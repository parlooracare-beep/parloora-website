param (
    [string]$Task = "all"
)

$ErrorActionPreference = "Stop"

$jdkDir = "$HOME\android-env\jdk-21"
if (-not (Test-Path "$jdkDir\bin\javac.exe")) {
    $jdkDir = "$HOME\android-env\jdk-17"
}

$env:JAVA_HOME = $jdkDir
$env:ANDROID_HOME = "$HOME\android-env\android-sdk"
$env:ANDROID_SDK_ROOT = "$HOME\android-env\android-sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "=========================================="
Write-Host "Parloora Android Native Build Pipeline"
Write-Host "=========================================="
Write-Host "JAVA_HOME=$env:JAVA_HOME"
Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
& "$env:JAVA_HOME\bin\java.exe" -version

$androidDir = "C:\From PC\Parloora New Website Ant+Supa\android"
$keystorePath = Join-Path $androidDir "parloora-release.keystore"

# 1. Generate release keystore if not exists
if (-not (Test-Path $keystorePath)) {
    Write-Host "Generating Parloora release keystore..."
    & "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v `
        -keystore $keystorePath `
        -alias "parloora" `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass "parloora2026" `
        -keypass "parloora2026" `
        -dname "CN=Parloora, OU=Mobile, O=Parloora Care, L=Dhaka, C=BD"
    Write-Host "Release keystore generated at: $keystorePath"
}

$env:PARLOORA_KEYSTORE_PASSWORD = "parloora2026"
$env:PARLOORA_KEY_ALIAS = "parloora"
$env:PARLOORA_KEY_PASSWORD = "parloora2026"

Set-Location $androidDir

# 2. Build Debug APK
if ($Task -eq "all" -or $Task -eq "assembleDebug") {
    Write-Host "Building Debug APK (assembleDebug)..."
    & .\gradlew.bat assembleDebug --stacktrace
}

# 3. Build Signed Release APK
if ($Task -eq "all" -or $Task -eq "assembleRelease") {
    Write-Host "Building Signed Release APK (assembleRelease)..."
    & .\gradlew.bat assembleRelease --stacktrace
}

# 4. Build Signed Release App Bundle (AAB) for Play Store
if ($Task -eq "all" -or $Task -eq "bundleRelease") {
    Write-Host "Building Signed Release AAB (bundleRelease)..."
    & .\gradlew.bat bundleRelease --stacktrace
}

Write-Host "=========================================="
Write-Host "Build finished. Copying deliverables..."
Write-Host "=========================================="

$deliveryAndroid = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery\Android"
New-Item -ItemType Directory -Force -Path $deliveryAndroid | Out-Null

# Copy Debug APK
$debugApkSrc = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $debugApkSrc) {
    Copy-Item -Path $debugApkSrc -Destination (Join-Path $deliveryAndroid "Parloora-Android-Debug.apk") -Force
    Write-Host "Delivered: Parloora-Android-Debug.apk"
}

# Copy Release APK
$releaseApkSrc = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $releaseApkSrc)) {
    # Check unsigned or signed variants
    $releaseApkSrc = Join-Path $androidDir "app\build\outputs\apk\release\app-release-unsigned.apk"
}
if (Test-Path $releaseApkSrc) {
    Copy-Item -Path $releaseApkSrc -Destination (Join-Path $deliveryAndroid "Parloora-Android-Release.apk") -Force
    Write-Host "Delivered: Parloora-Android-Release.apk"
}

# Copy Release AAB
$releaseAabSrc = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $releaseAabSrc) {
    Copy-Item -Path $releaseAabSrc -Destination (Join-Path $deliveryAndroid "Parloora-Android-Release.aab") -Force
    Write-Host "Delivered: Parloora-Android-Release.aab"
}

Write-Host "Android deliverables ready in Parloora-Mobile-App-Delivery/Android/"
