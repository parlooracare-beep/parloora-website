$sourceDir = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery"
$zipPath = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Write-Host "Creating ZIP archive: $zipPath..."
Compress-Archive -Path $sourceDir -DestinationPath $zipPath -CompressionLevel Optimal

$zipItem = Get-Item $zipPath
Write-Host "Archive created successfully!"
Write-Host "File: $($zipItem.FullName)"
Write-Host "Size: $([math]::Round($zipItem.Length / 1MB, 2)) MB ($($zipItem.Length) bytes)"
