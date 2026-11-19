if ($PSVersionTable.PSVersion.Major -lt 5) {
    # Windows PowerShell 4 has no Expand-Archive; PowerShell 5 and later ship it.
    function Expand-Archive {
        param([string]$Path, [string]$DestinationPath)
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($Path, $DestinationPath)
    }
}
