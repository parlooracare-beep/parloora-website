$TargetDir = "$HOME\android-env"
$jdk21Dir = Join-Path $TargetDir "jdk-21"
$androidSdk = Join-Path $TargetDir "android-sdk"
$cmdlineLatest = Join-Path $androidSdk "cmdline-tools\latest"
$sdkManager = Join-Path $cmdlineLatest "bin\sdkmanager.bat"

$env:JAVA_HOME = $jdk21Dir
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$jdk21Dir\bin;$cmdlineLatest\bin;$androidSdk\platform-tools;$env:PATH"

Write-Host "Installing platforms;android-36..."
& $sdkManager --install "platforms;android-36"

Write-Host "platforms;android-36 installed successfully!"
