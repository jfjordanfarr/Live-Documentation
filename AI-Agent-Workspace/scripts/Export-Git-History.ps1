<#
.SYNOPSIS
    Exports every git commit in the current repository to individual text files
    in chronological order.

.DESCRIPTION
    This script retrieves the git log in reverse (chronological) order.
    It generates a text file for every commit containing the full diff and metadata.
    Files are prefixed with a 4-digit index to maintain order in the file system.

.PARAMETER OutputDirectory
    The folder where the text files will be saved. Defaults to ".\git_export".
#>

param (
    [string]$OutputDirectory = ".\git_export"
)

$ErrorActionPreference = "Stop"

# 1. Check if we are in a git repository
if (-not (Test-Path .\.git)) {
    Write-Error "Current directory is not a git repository. Please run this inside a git-versioned folder."
    exit
}

# 2. Create Output Directory
if (-not (Test-Path $OutputDirectory)) {
    Write-Host "Creating output directory: $OutputDirectory" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

# 3. Get all commit hashes in chronological order (Oldest -> Newest)
Write-Host "Retrieving commit history..." -ForegroundColor Cyan
# %H returns the full hash. --reverse ensures 0001 is the first commit ever made.
$commits = git log --reverse --pretty=format:"%H"

if (-not $commits) {
    Write-Warning "No commits found in this repository."
    exit
}

$totalCommits = $commits.Count
$counter = 1

Write-Host "Found $totalCommits commits. Starting export..." -ForegroundColor Green

# 4. Loop through commits and export
foreach ($hash in $commits) {
    # Format the counter as a 4-digit string (e.g., 0001, 0015, 0999)
    $prefix = $counter.ToString("D4")
    
    # Define the filename
    $fileName = "${prefix}_${hash}.txt"
    $filePath = Join-Path -Path $OutputDirectory -ChildPath $fileName

    # Update Progress Bar
    $percentComplete = ($counter / $totalCommits) * 100
    Write-Progress -Activity "Exporting Commits" -Status "Processing $prefix of $totalCommits" -PercentComplete $percentComplete -CurrentOperation "$hash"

    # Export the commit content (Message + Diff)
    # We use 'git show' to get the full context. 
    # If you strictly want ONLY code changes without author/date info, 
    # change the command below to: git diff "$hash^!" "$hash"
    git show $hash --no-color | Out-File -FilePath $filePath -Encoding UTF8

    $counter++
}

Write-Progress -Activity "Exporting Commits" -Completed
Write-Host "Success! Exported $totalCommits commits to '$OutputDirectory'" -ForegroundColor Green