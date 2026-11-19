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
The variables a file assigns exactly once and by a plain `=`, by their unqualified names without regard to case, each with its assignment; which uses it fixes is Test-AssignedFor's to say.
#>
function Get-FileVariables {
    param([Parameter(Mandatory)]$Ast)
    $assignments = @{}
    foreach ($assignment in $Ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.AssignmentStatementAst] }, $true)) {
        # An attribute before the target (`[SuppressMessageAttribute(...)]` then `$x = ...`) changes nothing assigned;
        # a type constraint (`[int]$x`), which PowerShell parses as the subclass ConvertExpressionAst, converts, and is left unread.
        $target = $assignment.Left
        while ($target.GetType() -eq [System.Management.Automation.Language.AttributedExpressionAst]) { $target = $target.Child }
        if ($target -isnot [System.Management.Automation.Language.VariableExpressionAst]) {
            continue
        }
        $name = $target.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', ''
        if (-not $assignments.ContainsKey($name)) { $assignments[$name] = [System.Collections.Generic.List[object]]::new() }
        $assignments[$name].Add($assignment)
    }
    # Enumerated, not read through .Keys, which a variable named `keys` would stand in for.
    $fixed = @{}
    foreach ($pair in $assignments.GetEnumerator()) {
        $only = $pair.Value
        if ($only.Count -eq 1 -and $only[0].Operator -eq [System.Management.Automation.Language.TokenKind]::Equals) {
            $fixed[$pair.Key] = $only[0]
        }
    }
    return $fixed
}

<#
.SYNOPSIS
Whether a variable's one assignment fixes it where a node stands: before it in the text, in the function or script block that holds the node or one enclosing it.
#>
function Test-AssignedFor {
    param([Parameter(Mandatory)]$Assignment, [Parameter(Mandatory)]$Use)
    if ($Assignment.Extent.StartOffset -ge $Use.Extent.StartOffset) {
        return $false
    }
    for ($parent = $Assignment.Parent; $parent; $parent = $parent.Parent) {
        if ($parent -is [System.Management.Automation.Language.FunctionDefinitionAst] -or
            $parent -is [System.Management.Automation.Language.ScriptBlockExpressionAst]) {
            return $parent.Extent.StartOffset -le $Use.Extent.StartOffset -and $Use.Extent.EndOffset -le $parent.Extent.EndOffset
        }
    }
    return $true
}

# A loop's item while the names its collection writes out are read, one at a time.
$script:LoopItems = @{}

# The script's own path, which Split-Path turns into its folder.
$script:OwnPath = '^\$(PSCommandPath|MyInvocation\.MyCommand\.(Path|Definition))$'

<#
.SYNOPSIS
The path an expression writes when the text alone fixes it, with the file's directory in place of $PSScriptRoot: a string, a bare word or a variable whose variables are $PSScriptRoot or ones the file assigns once at its own level, or a Join-Path of such. $null otherwise.
#>
function Get-PathValue {
    param($Ast, [Parameter(Mandatory)][string]$Directory, [Parameter(Mandatory)][hashtable]$Variables, [System.Collections.Generic.HashSet[string]]$Reading = [System.Collections.Generic.HashSet[string]]::new())
    if ($null -eq $Ast) {
        return $null
    }
    if ($Ast -is [System.Management.Automation.Language.StringConstantExpressionAst]) {
        return $Ast.Value
    }
    if ($Ast -is [System.Management.Automation.Language.VariableExpressionAst]) {
        $name = $Ast.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', ''
        if ($name -eq 'psscriptroot') {
            return $Directory
        }
        if ($script:LoopItems.ContainsKey($name)) {
            return $script:LoopItems[$name]
        }
        if (-not $Variables.ContainsKey($name) -or -not (Test-AssignedFor -Assignment $Variables[$name] -Use $Ast) -or -not $Reading.Add($name)) {
            return $null
        }
        try {
            return Get-PathValue -Ast $Variables[$name].Right -Directory $Directory -Variables $Variables -Reading $Reading
        }
        finally {
            [void]$Reading.Remove($name)
        }
    }
    if ($Ast -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) {
        $text = $Ast.Value
        $result = ''
        $at = 0
        foreach ($nested in $Ast.NestedExpressions) {
            if ($nested -isnot [System.Management.Automation.Language.VariableExpressionAst]) {
                return $null
            }
            $value = Get-PathValue -Ast $nested -Directory $Directory -Variables $Variables -Reading $Reading
            if ($null -eq $value) {
                return $null
            }
            $index = $text.IndexOf($nested.Extent.Text, $at, [System.StringComparison]::Ordinal)
            if ($index -lt 0) {
                return $null
            }
            $result += $text.Substring($at, $index - $at) + $value
            $at = $index + $nested.Extent.Text.Length
        }
        return $result + $text.Substring($at)
    }
    if ($Ast -is [System.Management.Automation.Language.ParenExpressionAst]) {
        return Get-PathValue -Ast $Ast.Pipeline -Directory $Directory -Variables $Variables -Reading $Reading
    }
    if ($Ast -is [System.Management.Automation.Language.CommandExpressionAst]) {
        return Get-PathValue -Ast $Ast.Expression -Directory $Directory -Variables $Variables -Reading $Reading
    }
    if ($Ast -is [System.Management.Automation.Language.PipelineAst]) {
        if ($Ast.PipelineElements.Count -ne 1) {
            return $null
        }
        return Get-PathValue -Ast $Ast.PipelineElements[0] -Directory $Directory -Variables $Variables -Reading $Reading
    }
    if ($Ast -is [System.Management.Automation.Language.CommandAst] -and $Ast.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Unknown -and
        $Ast.GetCommandName() -in 'Split-Path', 'Microsoft.PowerShell.Management\Split-Path') {
        # Split-Path of the script's own path is its folder; of another fixed path, its parent.
        $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($Ast, $true)
        foreach ($part in 'Leaf', 'LeafBase', 'Extension', 'Qualifier', 'NoQualifier', 'IsAbsolute') {
            if ($binding.BoundParameters.ContainsKey($part)) {
                return $null
            }
        }
        $key = if ($binding.BoundParameters.ContainsKey('Path')) { 'Path' } elseif ($binding.BoundParameters.ContainsKey('LiteralPath')) { 'LiteralPath' } else { $null }
        if (-not $key) {
            return $null
        }
        $written = $binding.BoundParameters[$key].Value
        if ($written.Extent.Text.Trim() -match $script:OwnPath) {
            return $Directory
        }
        $parentOf = Get-PathValue -Ast $written -Directory $Directory -Variables $Variables -Reading $Reading
        return $(if ($null -eq $parentOf) { $null } else { "$parentOf/.." })
    }
    if ($Ast -is [System.Management.Automation.Language.CommandAst] -and $Ast.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Unknown -and
        $Ast.GetCommandName() -in 'Join-Path', 'Microsoft.PowerShell.Management\Join-Path') {
        $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($Ast, $true)
        if (-not $binding.BoundParameters.ContainsKey('Path') -or -not $binding.BoundParameters.ContainsKey('ChildPath')) {
            return $null
        }
        $parts = [System.Collections.Generic.List[object]]::new()
        $parts.Add($binding.BoundParameters['Path'].Value)
        $parts.Add($binding.BoundParameters['ChildPath'].Value)
        if ($binding.BoundParameters.ContainsKey('AdditionalChildPath')) {
            $additional = $binding.BoundParameters['AdditionalChildPath'].Value
            if ($additional -is [System.Management.Automation.Language.ArrayLiteralAst]) { foreach ($element in $additional.Elements) { $parts.Add($element) } } else { $parts.Add($additional) }
        }
        $values = [System.Collections.Generic.List[string]]::new()
        foreach ($part in $parts) {
            $value = if ($part -is [System.Management.Automation.Language.ArrayLiteralAst]) { $null } else { Get-PathValue -Ast $part -Directory $Directory -Variables $Variables -Reading $Reading }
            if ($null -eq $value) {
                return $null
            }
            $values.Add($value)
        }
        return ($values -join '/')
    }
    return $null
}

<#
.SYNOPSIS
The files a Get-ChildItem command lists, fixture-relative and sorted, when the text fixes its folder and every narrowing: listed by PowerShell's own Get-ChildItem over the working copy, keeping the scripts and modules a loop can dot-source. $null when the text does not fix it.
#>
function Get-ListedFiles {
    param([Parameter(Mandatory)]$Command, [Parameter(Mandatory)][string]$Directory, [Parameter(Mandatory)][hashtable]$Variables)
    $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($Command, $true)
    $parameters = $binding.BoundParameters
    if ($parameters.ContainsKey('Name') -or $parameters.ContainsKey('Directory')) {
        return $null
    }
    $key = if ($parameters.ContainsKey('Path')) { 'Path' } elseif ($parameters.ContainsKey('LiteralPath')) { 'LiteralPath' } else { $null }
    if (-not $key -or $parameters[$key].Value -is [System.Management.Automation.Language.ArrayLiteralAst]) {
        return $null
    }
    $folder = Get-PathValue -Ast $parameters[$key].Value -Directory $Directory -Variables $Variables
    if ($null -eq $folder) {
        return $null
    }
    $arguments = @{ File = $true; Force = $true; ErrorAction = 'Ignore' }
    $arguments[$key] = [System.IO.Path]::Combine($Directory, ($folder -replace '\\', '/'))
    foreach ($narrowing in 'Filter', 'Include', 'Exclude') {
        if (-not $parameters.ContainsKey($narrowing)) {
            continue
        }
        $strings = Get-StaticStrings -Ast $parameters[$narrowing].Value
        if ($null -eq $strings) {
            return $null
        }
        $arguments[$narrowing] = if ($narrowing -eq 'Filter') { $strings[0] } else { [string[]]$strings }
    }
    if ($parameters.ContainsKey('Recurse')) {
        $arguments['Recurse'] = $true
    }
    $listed = [System.Collections.Generic.List[string]]::new()
    foreach ($item in @(Get-ChildItem @arguments)) {
        $relative = [System.IO.Path]::GetRelativePath($RootPath, $item.FullName) -replace '\\', '/'
        if (-not $relative.StartsWith('../') -and $item.Extension -in '.ps1', '.psm1') {
            $listed.Add($relative)
        }
    }
    $listed.Sort([System.StringComparer]::Ordinal)
    return , $listed
}

<#
.SYNOPSIS
The Get-ChildItem commands a loop's collection is: one written in place, a variable the file assigns once from one, or several of these joined by `+`, a comma or `@()`. $null when any part is something else.
#>
function Get-Listings {
    param($Ast, [Parameter(Mandatory)][hashtable]$Variables, [System.Collections.Generic.HashSet[string]]$Reading = [System.Collections.Generic.HashSet[string]]::new())
    $found = [System.Collections.Generic.List[object]]::new()
    $pending = [System.Collections.Generic.Queue[object]]::new()
    $pending.Enqueue($Ast)
    while ($pending.Count -gt 0) {
        $item = $pending.Dequeue()
        if ($item -is [System.Management.Automation.Language.CommandAst] -and $item.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Unknown -and
            $item.GetCommandName() -in 'Get-ChildItem', 'Microsoft.PowerShell.Management\Get-ChildItem', 'gci', 'dir', 'ls') {
            $found.Add($item)
        }
        elseif ($item -is [System.Management.Automation.Language.PipelineAst] -and $item.PipelineElements.Count -eq 1) { $pending.Enqueue($item.PipelineElements[0]) }
        elseif ($item -is [System.Management.Automation.Language.CommandExpressionAst]) { $pending.Enqueue($item.Expression) }
        elseif ($item -is [System.Management.Automation.Language.ParenExpressionAst]) { $pending.Enqueue($item.Pipeline) }
        elseif ($item -is [System.Management.Automation.Language.ArrayExpressionAst]) { foreach ($statement in $item.SubExpression.Statements) { $pending.Enqueue($statement) } }
        elseif ($item -is [System.Management.Automation.Language.ArrayLiteralAst]) { foreach ($element in $item.Elements) { $pending.Enqueue($element) } }
        elseif ($item -is [System.Management.Automation.Language.BinaryExpressionAst] -and $item.Operator -eq [System.Management.Automation.Language.TokenKind]::Plus) { $pending.Enqueue($item.Left); $pending.Enqueue($item.Right) }
        elseif ($item -is [System.Management.Automation.Language.VariableExpressionAst]) {
            $name = $item.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', ''
            if (-not $Variables.ContainsKey($name) -or -not (Test-AssignedFor -Assignment $Variables[$name] -Use $item) -or -not $Reading.Add($name)) {
                return $null
            }
            $pending.Enqueue($Variables[$name].Right)
        }
        else {
            return $null
        }
    }
    return , $found
}

<#
.SYNOPSIS
Whether a dot-source's target is a loop's item, `$item` or its FullName.
#>
function Test-ItemTarget {
    param([Parameter(Mandatory)]$Command, [Parameter(Mandatory)][string[]]$Names)
    $target = $Command.CommandElements[0]
    if ($target -is [System.Management.Automation.Language.VariableExpressionAst]) {
        return ($target.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', '') -in $Names
    }
    return $target -is [System.Management.Automation.Language.MemberExpressionAst] -and $target.Expression -is [System.Management.Automation.Language.VariableExpressionAst] -and
        (($target.Expression.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', '') -in $Names) -and $target.Member.Extent.Text -eq 'FullName'
}

<#
.SYNOPSIS
Whether a node holds a dot-source of a loop's item.
#>
function Test-DotSourcesItem {
    param([Parameter(Mandatory)]$Ast, [Parameter(Mandatory)][string[]]$Names)
    $found = $Ast.Find({
            param($node)
            $node -is [System.Management.Automation.Language.CommandAst] -and $node.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Dot -and
            (Test-ItemTarget -Command $node -Names $Names)
        }, $true)
    return $null -ne $found
}

<#
.SYNOPSIS
The names a loop's collection writes out: a string, a list of strings, an @() of such, or a variable assigned one where its assignment fixes it. $null when any part is something else.
#>
function Get-LiteralItems {
    param($Ast, [Parameter(Mandatory)][hashtable]$Variables)
    $items = [System.Collections.Generic.List[string]]::new()
    $pending = [System.Collections.Generic.Queue[object]]::new()
    $pending.Enqueue($Ast)
    $reading = [System.Collections.Generic.HashSet[string]]::new()
    while ($pending.Count -gt 0) {
        $item = $pending.Dequeue()
        if ($item -is [System.Management.Automation.Language.StringConstantExpressionAst]) { $items.Add($item.Value) }
        elseif ($item -is [System.Management.Automation.Language.PipelineAst] -and $item.PipelineElements.Count -eq 1) { $pending.Enqueue($item.PipelineElements[0]) }
        elseif ($item -is [System.Management.Automation.Language.CommandExpressionAst]) { $pending.Enqueue($item.Expression) }
        elseif ($item -is [System.Management.Automation.Language.ParenExpressionAst]) { $pending.Enqueue($item.Pipeline) }
        elseif ($item -is [System.Management.Automation.Language.ArrayExpressionAst]) { foreach ($statement in $item.SubExpression.Statements) { $pending.Enqueue($statement) } }
        elseif ($item -is [System.Management.Automation.Language.ArrayLiteralAst]) { foreach ($element in $item.Elements) { $pending.Enqueue($element) } }
        elseif ($item -is [System.Management.Automation.Language.VariableExpressionAst]) {
            $name = $item.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', ''
            if (-not $Variables.ContainsKey($name) -or -not (Test-AssignedFor -Assignment $Variables[$name] -Use $item) -or -not $reading.Add($name)) {
                return $null
            }
            $pending.Enqueue($Variables[$name].Right)
        }
        else {
            return $null
        }
    }
    return , $items
}

<#
.SYNOPSIS
The loads a command makes whose paths the text fixes, with the loop items in place: a dot-source, an Import-Module of a path, or a script run by its path.
#>
function Get-FixedLoads {
    param([Parameter(Mandatory)]$Command, [Parameter(Mandatory)][string]$Directory, [Parameter(Mandatory)][hashtable]$Variables)
    $found = [System.Collections.Generic.List[object]]::new()
    $nameAst = $Command.CommandElements[0]
    if ($Command.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Dot) {
        $value = Get-PathValue -Ast $nameAst -Directory $Directory -Variables $Variables
        if ($null -ne $value) {
            $file = Resolve-FixtureFile -Value $value -BaseDirectory $Directory
            $found.Add([ordered]@{ kind = 'dot'; file = $file })
        }
        return , $found
    }
    $isPlainName = $nameAst -is [System.Management.Automation.Language.StringConstantExpressionAst] -and $nameAst.Value -notmatch '[\\/]|\.ps1$'
    if (-not $isPlainName) {
        $value = Get-PathValue -Ast $nameAst -Directory $Directory -Variables $Variables
        if ($null -ne $value -and $value -match '[\\/]|\.ps1$') {
            $found.Add([ordered]@{ kind = 'run'; file = (Resolve-FixtureFile -Value $value -BaseDirectory $Directory) })
        }
        return , $found
    }
    if ((Resolve-CommandAlias -Name $Command.GetCommandName()) -replace '^Microsoft\.PowerShell\.Core\\', '' -ne 'Import-Module') {
        return , $found
    }
    $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($Command, $true)
    if ($binding.BoundParameters.ContainsKey('Name')) {
        $nameValue = $binding.BoundParameters['Name'].Value
        $elements = if ($nameValue -is [System.Management.Automation.Language.ArrayLiteralAst]) { $nameValue.Elements } else { @($nameValue) }
        foreach ($element in $elements) {
            $value = Get-PathValue -Ast $element -Directory $Directory -Variables $Variables
            if ($null -ne $value -and $value -match '[\\/]') {
                $found.Add([ordered]@{ kind = 'import'; file = (Resolve-FixtureFile -Value $value -BaseDirectory $Directory -ModuleDirectory) })
            }
        }
    }
    return , $found
}

<#
.SYNOPSIS
Records the loads of a loop over names the text writes out, read once for each name with the loop's item standing for it.
#>
function Add-ItemLoads {
    param($Items, [Parameter(Mandatory)][string[]]$Names, [Parameter(Mandatory)]$Body, [Parameter(Mandatory)]$Loads, [string]$Directory, [hashtable]$Variables)
    if ($null -eq $Items) {
        return
    }
    foreach ($item in $Items) {
        foreach ($name in $Names) { $script:LoopItems[$name] = $item }
        try {
            foreach ($command in $Body.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)) {
                foreach ($load in (Get-FixedLoads -Command $command -Directory $Directory -Variables $Variables)) {
                    $Loads.Add([ordered]@{
                        line     = $command.Extent.StartLineNumber
                        kind     = $load.kind
                        text     = ($command.Extent.Text -split "`r?`n", 2)[0]
                        resolved = @(if ($load.file) { $load.file })
                    })
                }
            }
        }
        finally {
            foreach ($name in $Names) { $script:LoopItems.Remove($name) }
        }
    }
}

<#
.SYNOPSIS
Records a loop's dot-sources of the files its listings name, when the text fixes every listing.
#>
function Add-ListingLoads {
    param($Listings, [Parameter(Mandatory)]$Loads, [int]$Line, [string]$Text, [string]$Directory, [hashtable]$Variables)
    if ($null -eq $Listings -or $Listings.Count -eq 0) {
        return
    }
    $files = [System.Collections.Generic.List[string]]::new()
    foreach ($listing in $Listings) {
        $listed = Get-ListedFiles -Command $listing -Directory $Directory -Variables $Variables
        if ($null -eq $listed) {
            return
        }
        foreach ($file in $listed) { if (-not $files.Contains($file)) { $files.Add($file) } }
    }
    $files.Sort([System.StringComparer]::Ordinal)
    $Loads.Add([ordered]@{
        line     = $Line
        kind     = 'dot'
        text     = ($Text -split "`r?`n", 2)[0]
        resolved = $files
    })
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
The command a name stands for in this PowerShell, an alias followed to its command; the name itself when it is not an alias. Each name is looked up once.
#>
function Resolve-CommandAlias {
    param([Parameter(Mandatory)][string]$Name)
    if (-not $script:CommandAliases.ContainsKey($Name)) {
        $known = Get-Command -Name $Name -CommandType Alias -ErrorAction Ignore | Select-Object -First 1
        $script:CommandAliases[$Name] = if ($known) { $known.ResolvedCommandName } else { $Name }
    }
    return $script:CommandAliases[$Name]
}
$script:CommandAliases = @{}

<#
.SYNOPSIS
Whether what a node defines is seen by whoever loads its file: it stands inside no function and no script block written as a value, which run in scopes of their own.
#>
function Test-FileScope {
    param([Parameter(Mandatory)]$Node)
    for ($parent = $Node.Parent; $parent; $parent = $parent.Parent) {
        if ($parent -is [System.Management.Automation.Language.FunctionDefinitionAst] -or
            $parent -is [System.Management.Automation.Language.ScriptBlockExpressionAst]) {
            return $false
        }
    }
    return $true
}

<#
.SYNOPSIS
The name of the function a node stands in, the nearest one, or $null at the file's own level. A class's members are not functions.
#>
function Get-EnclosingFunction {
    param([Parameter(Mandatory)]$Node)
    for ($parent = $Node.Parent; $parent; $parent = $parent.Parent) {
        if ($parent -is [System.Management.Automation.Language.FunctionDefinitionAst] -and
            $parent.Parent -isnot [System.Management.Automation.Language.FunctionMemberAst]) {
            return $parent.Name
        }
    }
    return $null
}

<#
.SYNOPSIS
The commands whose script-block arguments a node stands in, nearest first: `Invoke-Command`, `ForEach-Object`, a test's `It`.
#>
function Get-EnclosingBlocks {
    param([Parameter(Mandatory)]$Node)
    $blocks = [System.Collections.Generic.List[string]]::new()
    for ($parent = $Node.Parent; $parent; $parent = $parent.Parent) {
        if ($parent -is [System.Management.Automation.Language.ScriptBlockExpressionAst] -and
            $parent.Parent -is [System.Management.Automation.Language.CommandAst]) {
            $owner = $parent.Parent.GetCommandName()
            $blocks.Add($(if ($owner) { $owner } else { $parent.Parent.CommandElements[0].Extent.Text }))
        }
    }
    return , $blocks
}

<#
.SYNOPSIS
The aliases a function's `[Alias()]` attribute gives it, as written.
#>
function Get-FunctionAliases {
    param([Parameter(Mandatory)]$Function)
    $aliases = [System.Collections.Generic.List[string]]::new()
    if (-not $Function.Body.ParamBlock) {
        return , $aliases
    }
    foreach ($attribute in $Function.Body.ParamBlock.Attributes) {
        if ($attribute.TypeName.Name -notin 'Alias', 'AliasAttribute', 'System.Management.Automation.AliasAttribute') {
            continue
        }
        foreach ($argument in $attribute.PositionalArguments) {
            $strings = Get-StaticStrings -Ast $argument
            if ($strings) { foreach ($string in $strings) { $aliases.Add($string) } }
        }
    }
    return , $aliases
}

<#
.SYNOPSIS
What a statement at a file's own level is: a definition, a load, a command, an assignment, or another statement by its kind; whether it calls anything; and the first line of its text.
#>
function Get-StatementFact {
    param([Parameter(Mandatory)]$Statement)
    $kind = $Statement.GetType().Name -replace 'Ast$', ''
    $command = $null
    if ($Statement -is [System.Management.Automation.Language.FunctionDefinitionAst]) {
        $kind = 'function'
    }
    elseif ($Statement -is [System.Management.Automation.Language.TypeDefinitionAst]) {
        $kind = 'type'
    }
    elseif ($Statement -is [System.Management.Automation.Language.PipelineAst] -and $Statement.PipelineElements.Count -ge 1 -and
        $Statement.PipelineElements[0] -is [System.Management.Automation.Language.CommandAst]) {
        $first = $Statement.PipelineElements[0]
        $kind = if ($first.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Dot) { 'dotSource' } else { 'command' }
        $command = $first.GetCommandName()
    }
    elseif ($Statement -is [System.Management.Automation.Language.PipelineAst]) {
        $kind = 'expression'
    }
    elseif ($Statement -is [System.Management.Automation.Language.AssignmentStatementAst]) {
        $kind = 'assignment'
    }
    $invokes = $null -ne $Statement.Find({
            param($node)
            ($node -is [System.Management.Automation.Language.CommandAst] -or $node -is [System.Management.Automation.Language.InvokeMemberExpressionAst]) -and
            (Test-OutsideDefinitions -Node $node -Root $Statement)
        }, $true)
    $text = ($Statement.Extent.Text -split "`r?`n", 2)[0]
    return [ordered]@{
        line    = $Statement.Extent.StartLineNumber
        kind    = $kind
        command = $command
        invokes = $invokes
        text    = if ($text.Length -gt 120) { $text.Substring(0, 120) } else { $text }
    }
}

<#
.SYNOPSIS
Whether a node lies outside every function and class defined within a statement, so that it runs when the statement does.
#>
function Test-OutsideDefinitions {
    param([Parameter(Mandatory)]$Node, [Parameter(Mandatory)]$Root)
    for ($parent = $Node.Parent; $parent -and $parent -ne $Root.Parent; $parent = $parent.Parent) {
        if ($parent -is [System.Management.Automation.Language.FunctionDefinitionAst] -or
            $parent -is [System.Management.Automation.Language.TypeDefinitionAst]) {
            return $false
        }
    }
    return $true
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
        $member = $function.Parent -is [System.Management.Automation.Language.FunctionMemberAst]
        $functions.Add([ordered]@{
            name       = $function.Name
            keyword    = if ($function.IsWorkflow) { 'workflow' } elseif ($function.IsFilter) { 'filter' } else { 'function' }
            member     = $member
            fileScope  = -not $member -and (Test-FileScope -Node $function)
            aliases    = Get-FunctionAliases -Function $function
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

    $variables = Get-FileVariables -Ast $ast
    $dotSources = [System.Collections.Generic.List[object]]::new()
    $importModules = [System.Collections.Generic.List[object]]::new()
    $exportModuleMembers = [System.Collections.Generic.List[object]]::new()
    $invocations = [System.Collections.Generic.List[object]]::new()
    $aliasCommands = [System.Collections.Generic.List[object]]::new()
    $loads = [System.Collections.Generic.List[object]]::new()
    foreach ($command in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)) {
        # Every command, by the name it is called by and the path it names when its name is a path written out.
        $nameAst = $command.CommandElements[0]
        $operator = switch ($command.InvocationOperator) {
            ([System.Management.Automation.Language.TokenKind]::Dot) { '.' }
            ([System.Management.Automation.Language.TokenKind]::Ampersand) { '&' }
            default { '' }
        }
        $staticName = Get-StaticPath -Ast $nameAst -Directory $directory
        $isPath = $null -ne $staticName -and $staticName -match '[\\/]|\.ps1$'
        $nameText = $nameAst.Extent.Text
        $invocations.Add([ordered]@{
            line     = $command.Extent.StartLineNumber
            column   = $command.Extent.StartColumnNumber
            name     = $command.GetCommandName()
            operator = $operator
            text     = if ($nameText.Length -gt 200) { $nameText.Substring(0, 200) } else { $nameText }
            resolved = if ($isPath) { Resolve-FixtureFile -Value $staticName -BaseDirectory $directory } else { $null }
            function = Get-EnclosingFunction -Node $command
            blocks   = Get-EnclosingBlocks -Node $command
        })

        if ($command.InvocationOperator -eq [System.Management.Automation.Language.TokenKind]::Dot) {
            $targetAst = $command.CommandElements[0]
            $target = if ($targetAst -is [System.Management.Automation.Language.StringConstantExpressionAst] -or
                $targetAst -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) { $targetAst.Value } else { $null }
            $static = Get-PathValue -Ast $targetAst -Directory $directory -Variables $variables
            $dotSources.Add([ordered]@{
                line     = $command.Extent.StartLineNumber
                column   = $command.Extent.StartColumnNumber
                text     = $command.Extent.Text
                target   = $target
                resolved = if ($null -ne $static) { Resolve-FixtureFile -Value $static -BaseDirectory $directory } else { $null }
            })
            continue
        }

        # A script run by its path, `& "$PSScriptRoot\x.ps1"`, `./x.ps1`, `& (Join-Path ...)`, runs in a scope of its own.
        $isPlainName = $nameAst -is [System.Management.Automation.Language.StringConstantExpressionAst] -and $nameAst.Value -notmatch '[\\/]|\.ps1$'
        if (-not $isPlainName) {
            $runPath = Get-PathValue -Ast $nameAst -Directory $directory -Variables $variables
            if ($null -ne $runPath -and $runPath -match '[\\/]|\.ps1$') {
                $runFile = Resolve-FixtureFile -Value $runPath -BaseDirectory $directory
                $loads.Add([ordered]@{
                    line     = $command.Extent.StartLineNumber
                    kind     = 'run'
                    text     = ($command.Extent.Text -split "`r?`n", 2)[0]
                    resolved = @(if ($runFile) { $runFile })
                })
            }
        }

        $name = $command.GetCommandName()
        if (-not $name) {
            continue
        }
        $resolvedName = (Resolve-CommandAlias -Name $name) -replace '^Microsoft\.PowerShell\.(Core|Utility)\\', ''

        if ($resolvedName -in 'Set-Alias', 'New-Alias') {
            $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($command, $true)
            $aliasName = if ($binding.BoundParameters.ContainsKey('Name')) { Get-StaticStrings -Ast $binding.BoundParameters['Name'].Value } else { $null }
            $aliasValue = if ($binding.BoundParameters.ContainsKey('Value')) { Get-StaticStrings -Ast $binding.BoundParameters['Value'].Value } else { $null }
            $aliasCommands.Add([ordered]@{
                line  = $command.Extent.StartLineNumber
                text  = $command.Extent.Text
                name  = if ($aliasName -and $aliasName.Count -eq 1) { $aliasName[0] } else { $null }
                value = if ($aliasValue -and $aliasValue.Count -eq 1) { $aliasValue[0] } else { $null }
            })
        }
        elseif ($resolvedName -eq 'Import-Module') {
            $binding = [System.Management.Automation.Language.StaticParameterBinder]::BindCommand($command, $true)
            $bound = Get-BoundParameters -Binding $binding
            $names = [System.Collections.Generic.List[object]]::new()
            if ($binding.BoundParameters.ContainsKey('Name')) {
                $nameAst = $binding.BoundParameters['Name'].Value
                $elements = if ($nameAst -is [System.Management.Automation.Language.ArrayLiteralAst]) { $nameAst.Elements } else { @($nameAst) }
                foreach ($element in $elements) {
                    $value = if ($element -is [System.Management.Automation.Language.StringConstantExpressionAst] -or
                        $element -is [System.Management.Automation.Language.ExpandableStringExpressionAst]) { $element.Value } else { $null }
                    $static = Get-PathValue -Ast $element -Directory $directory -Variables $variables
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

    # A loop that dot-sources each file a Get-ChildItem lists: `foreach ($f in <listing>) { . $f.FullName }`, or `<listing> | ForEach-Object { . $_.FullName }`.
    foreach ($loop in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.ForEachStatementAst] }, $true)) {
        $item = $loop.Variable.VariablePath.UserPath.ToLowerInvariant() -replace '^(script|global|local|private):', ''
        Add-ItemLoads -Items (Get-LiteralItems -Ast $loop.Condition -Variables $variables) -Names @($item) -Body $loop.Body -Loads $loads -Directory $directory -Variables $variables
        if (Test-DotSourcesItem -Ast $loop.Body -Names @($item)) {
            Add-ListingLoads -Listings (Get-Listings -Ast $loop.Condition -Variables $variables) -Loads $loads -Line $loop.Extent.StartLineNumber -Text $loop.Extent.Text -Directory $directory -Variables $variables
        }
    }
    foreach ($pipeline in $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.PipelineAst] -and $node.PipelineElements.Count -ge 2 }, $true)) {
        for ($index = 1; $index -lt $pipeline.PipelineElements.Count; $index++) {
            $stage = $pipeline.PipelineElements[$index]
            if ($stage -isnot [System.Management.Automation.Language.CommandAst] -or $stage.GetCommandName() -notin 'ForEach-Object', 'Microsoft.PowerShell.Core\ForEach-Object', '%', 'foreach') {
                continue
            }
            $blocks = @($stage.CommandElements | Select-Object -Skip 1 | Where-Object { $_ -is [System.Management.Automation.Language.ScriptBlockExpressionAst] })
            $previous = $pipeline.PipelineElements[$index - 1]
            if ($blocks.Count -eq 1 -and $previous -isnot [System.Management.Automation.Language.CommandAst]) {
                Add-ItemLoads -Items (Get-LiteralItems -Ast $previous -Variables $variables) -Names @('_', 'psitem') -Body $blocks[0] -Loads $loads -Directory $directory -Variables $variables
            }
            if ($blocks.Count -eq 1 -and (Test-DotSourcesItem -Ast $blocks[0] -Names @('_', 'psitem'))) {
                Add-ListingLoads -Listings (Get-Listings -Ast $pipeline.PipelineElements[$index - 1] -Variables $variables) -Loads $loads -Line $pipeline.Extent.StartLineNumber -Text $pipeline.Extent.Text -Directory $directory -Variables $variables
            }
        }
    }

    # The statements at the file's own level, which run when the file runs or is loaded.
    $statements = [System.Collections.Generic.List[object]]::new()
    foreach ($block in @($ast.DynamicParamBlock, $ast.BeginBlock, $ast.ProcessBlock, $ast.EndBlock)) {
        if (-not $block) {
            continue
        }
        foreach ($statement in $block.Statements) {
            $statements.Add((Get-StatementFact -Statement $statement))
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
        invocations         = $invocations
        loads               = $loads
        aliasCommands       = $aliasCommands
        paramBlock          = $null -ne $ast.ParamBlock
        statements          = $statements
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
