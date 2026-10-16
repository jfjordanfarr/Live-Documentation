<#
.SYNOPSIS
Reads the PowerShell files of a fixture with PowerShell's own parser and prints what it says about each, as JSON.

.DESCRIPTION
The oracle for the PowerShell adapter, run at development time by oracle:index. It reads the
fixture-relative paths of the files to read from standard input, one per line, parses each with
System.Management.Automation.Language.Parser and prints, for every file: the parser's errors; every
function, filter and workflow it defines, nested ones and a class's members included, with its line,
column, declared parameters and comment-based help as GetHelpContent returns it, and the names the file
publishes; every class, enum and interface it defines, with its line and column; every Export-ModuleMember
and Import-Module command with the arguments PowerShell's own static binder binds to each parameter; every
dot-source; every using statement; the modules #requires names; and, for a .psd1, the table as
Import-PowerShellDataFile reads it, with each module and script a manifest's table names. Nothing is
trimmed to fit an analyzer.

The names a file publishes are a reading of the text: every function but a class's members, narrowed by
the -Function patterns of its Export-ModuleMember commands, unless one of those is not written out (a
variable, a sub-expression), which only a run of the module could know; then every function, so that the
reading shows private functions rather than hiding public ones.

A path is resolved to a file of the fixture only where the text alone fixes it: a string constant, or an
expandable string whose only variable is $PSScriptRoot, which stands for the file's directory. A relative
dot-source or Import-Module path is resolved against the file's directory, as if the script ran from where
it lies; PowerShell itself resolves it against the caller's location at run time, which no reading of the
text can know. A using module path, and a manifest's module and script entries, are resolved against the
file's directory, as PowerShell resolves them. A directory names the module of the same name inside it.
Each name in a path is found as Windows finds it, without regard to case, so that the record says what an
estate's Windows PowerShell would load, whatever file system the fixture is copied to.

.PARAMETER Root
The directory the fixture's files are relative to: the working copy oracle:index made.
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Root
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RootPath = (Resolve-Path -LiteralPath $Root).ProviderPath

<#
.SYNOPSIS
The entry of a directory with the name given, as Windows finds it: the one spelled exactly, or else the only one whose name differs in case alone. $null when there is none, or several that differ in case alone.
#>
function Find-Entry {
    param(
        [Parameter(Mandatory)][string]$Directory,
        [Parameter(Mandatory)][string]$Name
    )
    $matching = @(Get-ChildItem -LiteralPath $Directory -Force -ErrorAction Ignore | Where-Object { $_.Name -eq $Name })
    $exact = @($matching | Where-Object { $_.Name -ceq $Name })
    if ($exact.Count -eq 1) {
        return $exact[0]
    }
    if ($matching.Count -eq 1) {
        return $matching[0]
    }
    return $null
}

<#
.SYNOPSIS
The fixture-relative path, with forward slashes and spelled as on disk, of the file a path names, or $null when it names no file of the fixture.
#>
function Resolve-FixtureFile {
    param(
        [Parameter(Mandatory)][string]$Value,
        [Parameter(Mandatory)][string]$BaseDirectory,
        [switch]$ModuleDirectory
    )
    $normalized = $Value -replace '\\', '/'
    $candidate = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($BaseDirectory, $normalized))
    $relative = [System.IO.Path]::GetRelativePath($RootPath, $candidate) -replace '\\', '/'
    if ($relative -eq '.' -or $relative -eq '..' -or $relative.StartsWith('../') -or [System.IO.Path]::IsPathRooted($relative)) {
        return $null
    }
    $found = Get-Item -LiteralPath $RootPath
    foreach ($segment in $relative.Split('/', [System.StringSplitOptions]::RemoveEmptyEntries)) {
        $found = Find-Entry -Directory $found.FullName -Name $segment
        if (-not $found) {
            return $null
        }
    }
    if ($found -is [System.IO.DirectoryInfo]) {
        if (-not $ModuleDirectory) {
            return $null
        }
        $directory = $found
        $found = $null
        foreach ($extension in '.psd1', '.psm1') {
            $inside = Find-Entry -Directory $directory.FullName -Name "$($directory.Name)$extension"
            if ($inside -is [System.IO.FileInfo]) {
                $found = $inside
                break
            }
        }
        if (-not $found) {
            return $null
        }
    }
    return [System.IO.Path]::GetRelativePath($RootPath, $found.FullName) -replace '\\', '/'
}

<#
.SYNOPSIS
The text a string argument holds when the text alone fixes it: a constant, or an expandable string whose only variable is $PSScriptRoot, put in place. $null otherwise.
#>
function Get-StaticPath {
    param($Ast, [Parameter(Mandatory)][string]$Directory)
    if ($Ast -is [System.Management.Automation.Language.StringConstantExpressionAst]) {
        return $Ast.Value
    }
    if ($Ast -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) {
        foreach ($nested in $Ast.NestedExpressions) {
            $isScriptRoot = $nested -is [System.Management.Automation.Language.VariableExpressionAst] -and $nested.VariablePath.UserPath -eq 'PSScriptRoot'
            if (-not $isScriptRoot) {
                return $null
            }
        }
        return [regex]::Replace($Ast.Value, '\$\{PSScriptRoot\}|\$PSScriptRoot', { param($match) $Directory }, 'IgnoreCase')
    }
    return $null
}

<#
.SYNOPSIS
The strings an argument holds, flattening an array literal; $null when any part of it is not a string written out.
#>
function Get-StaticStrings {
    param($Ast)
    $values = [System.Collections.Generic.List[object]]::new()
    $pending = [System.Collections.Generic.Queue[object]]::new()
    $pending.Enqueue($Ast)
    while ($pending.Count -gt 0) {
        $item = $pending.Dequeue()
        if ($item -is [System.Management.Automation.Language.ArrayLiteralAst]) {
            foreach ($element in $item.Elements) { $pending.Enqueue($element) }
        }
        elseif ($item -is [System.Management.Automation.Language.StringConstantExpressionAst] -or
            $item -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) {
            $values.Add($item.Value)
        }
        else {
            return $null
        }
    }
    return , $values
}

<#
.SYNOPSIS
Every parameter PowerShell's static binder bound on a command, with the argument's text and the strings it holds, and what it could not bind.
#>
function Get-BoundParameters {
    param([Parameter(Mandatory)]$Binding)
    $parameters = [ordered]@{}
    foreach ($name in @($Binding.BoundParameters.Keys | Sort-Object)) {
        $value = $Binding.BoundParameters[$name].Value
        $parameters[$name] = [ordered]@{
            text   = if ($value) { $value.Extent.Text } else { $null }
            values = if ($value) { Get-StaticStrings -Ast $value } else { $null }
        }
    }
    $errors = [System.Collections.Generic.List[object]]::new()
    foreach ($name in @($Binding.BindingExceptions.Keys | Sort-Object)) {
        $errors.Add([ordered]@{ parameter = $name; message = $Binding.BindingExceptions[$name].BindingException.Message })
    }
    return [ordered]@{ parameters = $parameters; bindingErrors = $errors }
}

<#
.SYNOPSIS
A function's comment-based help as GetHelpContent returns it, each parameter under the key the help gives and the spelling the function declares.
#>
function Get-CommentHelp {
    param([Parameter(Mandatory)]$Function, [AllowEmptyCollection()][string[]]$Declared = @())
    $help = $Function.GetHelpContent()
    if (-not $help) {
        return $null
    }
    $parameters = [System.Collections.Generic.List[object]]::new()
    foreach ($key in $help.Parameters.Keys) {
        $spelling = $Declared | Where-Object { $_.ToUpperInvariant() -eq $key } | Select-Object -First 1
        $parameters.Add([ordered]@{
            key         = $key
            name        = if ($spelling) { $spelling } else { $key }
            description = $help.Parameters[$key]
        })
    }
    return [ordered]@{
        synopsis              = $help.Synopsis
        description           = $help.Description
        parameters            = $parameters
        notes                 = $help.Notes
        examples              = @($help.Examples)
        inputs                = @($help.Inputs)
        outputs               = @($help.Outputs)
        links                 = @($help.Links)
        component             = $help.Component
        role                  = $help.Role
        functionality         = $help.Functionality
        forwardHelpTargetName = $help.ForwardHelpTargetName
        forwardHelpCategory   = $help.ForwardHelpCategory
        remoteHelpRunspace    = $help.RemoteHelpRunspace
        externalHelp          = $help.MamlHelpFile
    }
}

<#
.SYNOPSIS
A hashtable as JSON reads it: keys sorted, nested tables and arrays followed.
#>
function ConvertTo-SortedData {
    param($Value)
    if ($Value -is [System.Collections.IDictionary]) {
        $sorted = [ordered]@{}
        foreach ($key in @($Value.Keys | Sort-Object)) { $sorted[[string]$key] = ConvertTo-SortedData -Value $Value[$key] }
        return $sorted
    }
    if ($Value -is [System.Collections.IEnumerable] -and $Value -isnot [string]) {
        $items = [System.Collections.Generic.List[object]]::new()
        foreach ($item in $Value) { $items.Add((ConvertTo-SortedData -Value $item)) }
        return , $items
    }
    return $Value
}

<#
.SYNOPSIS
What the parser says about a script or a module.
#>
function Read-Script {
    param([Parameter(Mandatory)][string]$FullPath)
    $directory = Split-Path -Parent $FullPath
    $tokens = $null
    $parseErrors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseFile($FullPath, [ref]$tokens, [ref]$parseErrors)

    $errors = [System.Collections.Generic.List[object]]::new()
    foreach ($parseError in $parseErrors) {
        $errors.Add([ordered]@{
            line    = $parseError.Extent.StartLineNumber
            column  = $parseError.Extent.StartColumnNumber
            id      = $parseError.ErrorId
            message = $parseError.Message
        })
    }

    $functions = [System.Collections.Generic.List[object]]::new()
    foreach ($function in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.FunctionDefinitionAst] }, $true)) {
        $declared = [System.Collections.Generic.List[string]]::new()
        if ($function.Parameters) {
            foreach ($parameter in $function.Parameters) { $declared.Add($parameter.Name.VariablePath.UserPath) }
        }
        if ($function.Body.ParamBlock -and $function.Body.ParamBlock.Parameters) {
            foreach ($parameter in $function.Body.ParamBlock.Parameters) { $declared.Add($parameter.Name.VariablePath.UserPath) }
        }
        $functions.Add([ordered]@{
            name       = $function.Name
            keyword    = if ($function.IsWorkflow) { 'workflow' } elseif ($function.IsFilter) { 'filter' } else { 'function' }
            member     = $function.Parent -is [System.Management.Automation.Language.FunctionMemberAst]
            line       = $function.Extent.StartLineNumber
            column     = $function.Extent.StartColumnNumber
            parameters = $declared
            help       = Get-CommentHelp -Function $function -Declared ([string[]]$declared)
        })
    }

    $types = [System.Collections.Generic.List[object]]::new()
    foreach ($type in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.TypeDefinitionAst] }, $true)) {
        $types.Add([ordered]@{
            name   = $type.Name
            kind   = if ($type.IsEnum) { 'enum' } elseif ($type.IsInterface) { 'interface' } else { 'class' }
            line   = $type.Extent.StartLineNumber
            column = $type.Extent.StartColumnNumber
        })
    }

    $dotSources = [System.Collections.Generic.List[object]]::new()
    $importModules = [System.Collections.Generic.List[object]]::new()
    $exportModuleMembers = [System.Collections.Generic.List[object]]::new()
    foreach ($command in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)) {
        if ($command.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Dot) {
            $targetAst = $command.CommandElements[0]
            $target = if ($targetAst -is [System.Management.Automation.Language.StringConstantExpressionAst] -or
                $targetAst -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) { $targetAst.Value } else { $null }
            $static = Get-StaticPath -Ast $targetAst -Directory $directory
            $dotSources.Add([ordered]@{
                line     = $command.Extent.StartLineNumber
                column   = $command.Extent.StartColumnNumber
                text     = $command.Extent.Text
                target   = $target
                resolved = if ($null -ne $static) { Resolve-FixtureFile -Value $static -BaseDirectory $directory } else { $null }
            })
            continue
        }

        $name = $command.GetCommandName()
        if (-not $name) {
            continue
        }
        $resolvedName = $name
        $known = Get-Command -Name $name -ErrorAction Ignore
        if ($known -and $known.CommandType -eq 'Alias') {
            $resolvedName = $known.ResolvedCommandName
        }
        $resolvedName = $resolvedName -replace '^Microsoft\.PowerShell\.Core\\', ''

        if ($resolvedName -eq 'Import-Module') {
            $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($command, $true)
            $bound = Get-BoundParameters -Binding $binding
            $names = [System.Collections.Generic.List[object]]::new()
            if ($binding.BoundParameters.ContainsKey('Name')) {
                $nameAst = $binding.BoundParameters['Name'].Value
                $elements = if ($nameAst -is [System.Management.Automation.Language.ArrayLiteralAst]) { $nameAst.Elements } else { @($nameAst) }
                foreach ($element in $elements) {
                    $value = if ($element -is [System.Management.Automation.Language.StringConstantExpressionAst] -or
                        $element -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) { $element.Value } else { $null }
                    $static = Get-StaticPath -Ast $element -Directory $directory
                    $isPath = $null -ne $static -and $static -match '[\\/]'
                    $names.Add([ordered]@{
                        name     = $value
                        text     = $element.Extent.Text
                        resolved = if ($isPath) { Resolve-FixtureFile -Value $static -BaseDirectory $directory -ModuleDirectory } else { $null }
                    })
                }
            }
            $importModules.Add([ordered]@{
                line          = $command.Extent.StartLineNumber
                column        = $command.Extent.StartColumnNumber
                text          = $command.Extent.Text
                command       = $name
                names         = $names
                parameters    = $bound.parameters
                bindingErrors = $bound.bindingErrors
            })
        }
        elseif ($resolvedName -eq 'Export-ModuleMember') {
            $bound = Get-BoundParameters -Binding ([System.Management.Automation.Language.StaticParameterBinder]::BindCommand($command, $true))
            $exportModuleMembers.Add([ordered]@{
                line          = $command.Extent.StartLineNumber
                column        = $command.Extent.StartColumnNumber
                text          = $command.Extent.Text
                parameters    = $bound.parameters
                bindingErrors = $bound.bindingErrors
            })
        }
    }

    $usingStatements = [System.Collections.Generic.List[object]]::new()
    foreach ($using in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.UsingStatementAst] }, $true)) {
        $usingName = $null
        if ($using.Name) {
            $usingName = $using.Name.Value
        }
        elseif ($using.ModuleSpecification) {
            foreach ($pair in $using.ModuleSpecification.KeyValuePairs) {
                if ($pair.Item1.Extent.Text -match '^[''"]?ModuleName[''"]?$') {
                    $usingName = $pair.Item2.Extent.Text.Trim().Trim('''', '"')
                }
            }
        }
        $isPath = $using.UsingStatementKind -eq 'Module' -and $usingName -and $usingName -match '[\\/]'
        $usingStatements.Add([ordered]@{
            line     = $using.Extent.StartLineNumber
            column   = $using.Extent.StartColumnNumber
            text     = $using.Extent.Text
            kind     = [string]$using.UsingStatementKind
            name     = $usingName
            resolved = if ($isPath) { Resolve-FixtureFile -Value $usingName -BaseDirectory $directory -ModuleDirectory } else { $null }
        })
    }

    $requiredModules = [System.Collections.Generic.List[object]]::new()
    if ($ast.ScriptRequirements -and $ast.ScriptRequirements.RequiredModules) {
        foreach ($module in $ast.ScriptRequirements.RequiredModules) {
            $isPath = $module.Name -match '[\\/]'
            $requiredModules.Add([ordered]@{
                name            = $module.Name
                version         = if ($module.Version) { [string]$module.Version } else { $null }
                requiredVersion = if ($module.RequiredVersion) { [string]$module.RequiredVersion } else { $null }
                maximumVersion  = $module.MaximumVersion
                guid            = if ($module.Guid) { [string]$module.Guid } else { $null }
                resolved        = if ($isPath) { Resolve-FixtureFile -Value $module.Name -BaseDirectory $directory -ModuleDirectory } else { $null }
            })
        }
    }

    # A file that calls Export-ModuleMember publishes only the functions its -Function patterns match, by
    # PowerShell's wildcard rules and without regard to case; a file that does not publishes every function.
    # A -Function argument that is not written out, such as a variable or a sub-expression, is known only when
    # the module runs, so the file publishes every function then too: a reading of the text shows private
    # functions rather than hiding public ones.
    # A class's constructors and methods are FunctionDefinitionAsts inside its members, which FindAll reaches,
    # but no script calls one as a command, so they are listed, marked, and never published.
    $published = [System.Collections.Generic.List[string]]::new()
    $patterns = @($exportModuleMembers | ForEach-Object { if ($_.parameters.Contains('Function') -and $_.parameters['Function'].values) { $_.parameters['Function'].values } })
    $unwritten = @($exportModuleMembers | Where-Object { $_.parameters.Contains('Function') -and $null -eq $_.parameters['Function'].values }).Count -gt 0
    foreach ($function in $functions) {
        if ($function.member) {
            continue
        }
        if ($exportModuleMembers.Count -eq 0 -or $unwritten) {
            $published.Add($function.name)
            continue
        }
        foreach ($pattern in $patterns) {
            if ([System.Management.Automation.WildcardPattern]::new($pattern, 'IgnoreCase').IsMatch($function.name)) {
                $published.Add($function.name)
                break
            }
        }
    }

    return [ordered]@{
        parseErrors         = $errors
        functions           = $functions
        published           = $published
        types               = $types
        exportModuleMembers = $exportModuleMembers
        dotSources          = $dotSources
        importModules       = $importModules
        usingStatements     = $usingStatements
        requiredModules     = $requiredModules
    }
}

<#
.SYNOPSIS
What a data file says: its table as Import-PowerShellDataFile reads it, and each module, script or nested module a manifest's table names, with the version a module specification writes (its RequiredVersion, else its ModuleVersion), resolved against its directory.
#>
function Read-DataFile {
    param([Parameter(Mandatory)][string]$FullPath)
    $directory = Split-Path -Parent $FullPath
    $tokens = $null
    $parseErrors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($FullPath, [ref]$tokens, [ref]$parseErrors)
    $errors = [System.Collections.Generic.List[object]]::new()
    foreach ($parseError in $parseErrors) {
        $errors.Add([ordered]@{
            line    = $parseError.Extent.StartLineNumber
            column  = $parseError.Extent.StartColumnNumber
            id      = $parseError.ErrorId
            message = $parseError.Message
        })
    }

    $data = $null
    $references = [System.Collections.Generic.List[object]]::new()
    try {
        $table = Import-PowerShellDataFile -LiteralPath $FullPath
        $data = ConvertTo-SortedData -Value $table
        foreach ($key in 'ModuleToProcess', 'RootModule', 'NestedModules', 'RequiredModules', 'ScriptsToProcess') {
            if (-not $table.ContainsKey($key)) {
                continue
            }
            foreach ($entry in @($table[$key])) {
                $specification = $entry -is [System.Collections.IDictionary]
                $value = if ($specification) { $entry['ModuleName'] } else { [string]$entry }
                if (-not $value) {
                    continue
                }
                $version = $null
                if ($specification -and $entry['RequiredVersion']) {
                    $version = [string]$entry['RequiredVersion']
                }
                elseif ($specification -and $entry['ModuleVersion']) {
                    $version = [string]$entry['ModuleVersion']
                }
                $references.Add([ordered]@{
                    key      = $key
                    value    = $value
                    version  = $version
                    resolved = Resolve-FixtureFile -Value $value -BaseDirectory $directory -ModuleDirectory
                })
            }
        }
    }
    catch {
        $errors.Add([ordered]@{ line = $null; column = $null; id = 'ImportPowerShellDataFile'; message = $_.Exception.Message })
    }

    return [ordered]@{
        parseErrors = $errors
        data        = $data
        references  = $references
    }
}

$files = [ordered]@{}
$relativePaths = [Console]::In.ReadToEnd() -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Sort-Object -CaseSensitive
foreach ($relativePath in $relativePaths) {
    $fullPath = Join-Path $RootPath $relativePath
    $files[$relativePath] = if ([System.IO.Path]::GetExtension($relativePath) -eq '.psd1') {
        Read-DataFile -FullPath $fullPath
    }
    else {
        Read-Script -FullPath $fullPath
    }
}

[ordered]@{
    version = $PSVersionTable.PSVersion.ToString()
    files   = $files
} | ConvertTo-Json -Depth 32
