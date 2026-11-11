$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    node scripts/check.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Project checks failed.' }
    New-Item -ItemType Directory -Path dist -Force | Out-Null
    # Use forward-slash entry names for extraction on the Linux hosting server.
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $publicRoot = Join-Path $projectRoot 'public'
    $archivePath = Join-Path $projectRoot 'dist/frostwater-namecheap.zip'
    $stream = [IO.File]::Open($archivePath, [IO.FileMode]::Create)
    $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($file in Get-ChildItem -LiteralPath $publicRoot -Recurse -File) {
            $entryName = $file.FullName.Substring($publicRoot.Length + 1).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    } finally {
        $archive.Dispose()
        $stream.Dispose()
    }
    Write-Output 'Ready: dist/frostwater-namecheap.zip'
} finally {
    Pop-Location
}
