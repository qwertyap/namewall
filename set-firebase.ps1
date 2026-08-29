<#
  Paste the firebaseConfig snippet from the Firebase console and this writes
  config.js for you - no manual editing.

  Usage:
      .\set-firebase.ps1
  then paste the whole block, e.g.

      const firebaseConfig = {
        apiKey: "AIza....",
        authDomain: "myapp.firebaseapp.com",
        projectId: "myapp",
        storageBucket: "myapp.appspot.com",
        messagingSenderId: "123456789",
        appId: "1:123:web:abc"
      };

  and press Enter on an empty line.
#>

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Paste your firebaseConfig block, then press Enter on an empty line:`n" -ForegroundColor Cyan
$lines = @()
while ($true) {
  $l = Read-Host
  if ([string]::IsNullOrWhiteSpace($l)) { break }
  $lines += $l
}
$text = $lines -join "`n"

$keys = 'apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'
$cfg = @{}
foreach ($k in $keys) {
  $m = [regex]::Match($text, "$k\s*:\s*[""']([^""']+)[""']")
  if ($m.Success) { $cfg[$k] = $m.Groups[1].Value }
}

$missing = $keys | Where-Object { -not $cfg.ContainsKey($_) -and $_ -ne 'measurementId' }
if ($missing -contains 'apiKey' -or $missing -contains 'projectId') {
  throw "Could not read apiKey/projectId from what you pasted. Try again."
}

$body = ($keys | Where-Object { $cfg.ContainsKey($_) } | ForEach-Object {
  "    $_`: `"$($cfg[$_])`""
}) -join ",`n"

$text = Get-Content .\config.js -Raw
$replacement = "export const firebaseConfig = {`n$body`n};"
$text = [regex]::Replace($text, 'export const firebaseConfig = \{[^}]*\};', { param($m) $replacement })
Set-Content -Path .\config.js -Value $text -Encoding UTF8

Write-Host "`nconfig.js updated for Firebase project '$($cfg.projectId)'." -ForegroundColor Green
Write-Host "Note: Supabase keys (if set) take priority. Next:  .\deploy.ps1" -ForegroundColor Yellow
