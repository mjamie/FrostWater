param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 8080
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$publicRoot = Join-Path $projectRoot 'public'
$php = (Get-Command php -ErrorAction Stop).Source

Write-Host "FrostWater Studios Website: http://127.0.0.1:$Port"
Write-Host 'Local preview only. Email sending is disabled; press Ctrl+C to stop.'
& $php -d date.timezone=Asia/Makassar -d disable_functions=mail -S "127.0.0.1:$Port" -t $publicRoot
exit $LASTEXITCODE
