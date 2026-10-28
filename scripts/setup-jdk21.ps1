$TargetDir = "$HOME\android-env"
$jdk21Zip = Join-Path $TargetDir "openjdk21.zip"
$jdk21Dir = Join-Path $TargetDir "jdk-21"

if (-not (Test-Path (Join-Path $jdk21Dir "bin\javac.exe"))) {
    Write-Host "Downloading OpenJDK 21..."
    $jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip"
    curl.exe -L -o $jdk21Zip $jdkUrl
    
    Write-Host "Extracting OpenJDK 21..."
    $tempExtract = Join-Path $TargetDir "jdk21_temp"
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    Expand-Archive -Path $jdk21Zip -DestinationPath $tempExtract -Force
    $innerJdk = Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1
    if (Test-Path $jdk21Dir) { Remove-Item -Recurse -Force $jdk21Dir }
    Move-Item -Path $innerJdk.FullName -Destination $jdk21Dir
    Remove-Item -Recurse -Force $tempExtract
    Remove-Item -Force $jdk21Zip
    Write-Host "OpenJDK 21 installed successfully!"
} else {
    Write-Host "OpenJDK 21 already exists."
}

& "$jdk21Dir\bin\java.exe" -version
