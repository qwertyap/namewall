<#
  Writes config.js from your Supabase project URL + anon key, then you deploy.

  Usage:
      .\set-supabase.ps1
      .\set-supabase.ps1 -Url "https://abc.supabase.co" -AnonKey "eyJhbGci..."
#>

param(
  [string]$Url,
  [string]$AnonKey
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $Url)     { $Url     = Read-Host "Supabase Project URL (https://xxxx.supabase.co)" }
if (-not $AnonKey) { $AnonKey = Read-Host "Supabase anon public key" }

$Url = $Url.Trim().TrimEnd('/')
$AnonKey = $AnonKey.Trim()

if ($Url -notmatch '^https://[a-z0-9-]+\.supabase\.(co|in)$') {
  throw "That doesn't look like a Supabase URL: $Url"
}
if ($AnonKey.Length -lt 30) { throw "That anon key looks too short." }

$cfg = Get-Content .\config.js -Raw
$cfg = $cfg -replace 'url:\s*"[^"]*"',     ('url: "' + $Url + '"')
$cfg = $cfg -replace 'anonKey:\s*"[^"]*"', ('anonKey: "' + $AnonKey + '"')
Set-Content -Path .\config.js -Value $cfg -Encoding UTF8

Write-Host "`nconfig.js updated - backend is now Supabase." -ForegroundColor Green
Write-Host "Next:  .\deploy.ps1" -ForegroundColor Yellow

