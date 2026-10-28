$deliveryDir = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery"
$androidSourceDest = Join-Path $deliveryDir "Android\android-source"
$iosSourceDest = Join-Path $deliveryDir "iOS\ios-source"

New-Item -ItemType Directory -Force -Path $androidSourceDest | Out-Null
New-Item -ItemType Directory -Force -Path $iosSourceDest | Out-Null

Write-Host "Copying iOS source..."
$iosSrc = "C:\From PC\Parloora New Website Ant+Supa\ios"
robocopy $iosSrc $iosSourceDest /E /XD "build" "DerivedData" ".gradle" /XF "*.keystore" "*.jks" /NFL /NDL /NJH /NJS | Out-Null

Write-Host "iOS source copied to: $iosSourceDest"

Write-Host "Copying Android source..."
$androidSrc = "C:\From PC\Parloora New Website Ant+Supa\android"
robocopy $androidSrc $androidSourceDest /E /XD "build" ".gradle" ".idea" /XF "*.keystore" "*.jks" "*.aab" "*.apk" /NFL /NDL /NJH /NJS | Out-Null

Write-Host "Android source copied to: $androidSourceDest"
