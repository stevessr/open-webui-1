#!/usr/bin/env pwsh

# Script to fix JSON conflict markers in translation files

$localesDir = "src/lib/i18n/locales"

# Get all JSON files with conflict markers
$jsonFiles = Get-ChildItem -Path $localesDir -Recurse -Filter "*.json" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "<<<<<<< HEAD"
}

Write-Host "Found $($jsonFiles.Count) JSON files with conflict markers"

foreach ($file in $jsonFiles) {
    Write-Host "Fixing $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove the conflict markers and keep only the "overlayOpacity" line
    $fixedContent = $content -replace '<<<<<<< HEAD\s*\n\s*"Output Format": "",\s*\n=======\s*\n\s*("overlayOpacity": "",)\s*\n>>>>>>> origin/main', '$1'
    
    # Write the fixed content back
    Set-Content -Path $file.FullName -Value $fixedContent -NoNewline
    
    Write-Host "Fixed $($file.Name)"
}

Write-Host "All JSON files fixed!"
