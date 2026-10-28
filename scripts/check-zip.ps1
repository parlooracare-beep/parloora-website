Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery.zip")
Write-Host "Total entries in ZIP: $($zip.Entries.Count)"
$topLevel = $zip.Entries | Where-Object { $_.FullName -match '^Parloora-Mobile-App-Delivery/[^/]+$' -or $_.FullName -match '^Parloora-Mobile-App-Delivery/[^/]+/[^/]+$' }
foreach ($entry in $topLevel) {
    if ($entry.Length -gt 0) {
        Write-Host "$($entry.FullName) ($([math]::Round($entry.Length / 1KB, 1)) KB)"
    }
}
$zip.Dispose()
