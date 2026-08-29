<#
  Download every name from Supabase to a local JSON file (manual backup).

  Usage:  .\backup.ps1            -> writes backup\names-YYYY-MM-DD.json
#>

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$cfg = Get-Content .\config.js -Raw
$url = [regex]::Match($cfg, 'url:\s*"([^"]+)"').Groups[1].Value
$key = [regex]::Match($cfg, 'anonKey:\s*"([^"]+)"').Groups[1].Value

if (-not $url -or $url.StartsWith("PASTE_")) { throw "Supabase not configured in config.js" }

$headers = @{ apikey = $key; Authorization = "Bearer $key" }
$data = Invoke-RestMethod "$url/rest/v1/names?select=*&order=created_at.asc" -Headers $headers

New-Item -ItemType Directory -Force -Path .\backup | Out-Null
$file = ".\backup\names-$(Get-Date -Format 'yyyy-MM-dd').json"
$data | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $file

Write-Host "Saved $($data.Count) names to $file" -ForegroundColor Green

