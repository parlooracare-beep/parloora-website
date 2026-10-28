$TargetDir = "$env:USERPROFILE\android-env"
$jdkDir = Join-Path $TargetDir "jdk-17"
$androidSdk = Join-Path $TargetDir "android-sdk"
$cmdlineLatest = Join-Path $androidSdk "cmdline-tools\latest"
$sdkManager = Join-Path $cmdlineLatest "bin\sdkmanager.bat"

$env:JAVA_HOME = $jdkDir
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$jdkDir\bin;$cmdlineLatest\bin;$androidSdk\platform-tools;$env:PATH"

$licDir = Join-Path $androidSdk "licenses"
New-Item -ItemType Directory -Force -Path $licDir | Out-Null

$licText = @"
24333f8a63b6825ea9c5514f83c2829b004d1fee
d56f5187479451eabf01fb78af6dfcb131a6481e
8933bad161af4178b1185d1a37fbf41ea5269c55
"@
Set-Content -Path (Join-Path $licDir "android-sdk-license") -Value $licText -Encoding ASCII

$prevLic = "84831b9409646a53fe447391c0270e40f66e2e87"
Set-Content -Path (Join-Path $licDir "android-sdk-preview-license") -Value $prevLic -Encoding ASCII

$armLic = "859f317696f67ef3d7f30a50a5560e7834b433fb"
Set-Content -Path (Join-Path $licDir "android-sdk-arm-dbt-license") -Value $armLic -Encoding ASCII

Write-Host "Licenses established. Now installing packages..."
# Run sdkmanager to install platforms;android-35 build-tools;35.0.0 platform-tools
& $sdkManager --install "platforms;android-35" "build-tools;35.0.0" "platform-tools"

Write-Host "Android SDK components installed successfully!"
