param (
    [string]$TargetDir = "$env:USERPROFILE\android-env"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting up Android Build Environment in: $TargetDir"
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

$jdkZip = Join-Path $TargetDir "openjdk17.zip"
$jdkDir = Join-Path $TargetDir "jdk-17"
$sdkZip = Join-Path $TargetDir "cmdline-tools.zip"
$androidSdk = Join-Path $TargetDir "android-sdk"
$cmdlineLatest = Join-Path $androidSdk "cmdline-tools\latest"

# 1. Download & Extract OpenJDK 17
if (-not (Test-Path (Join-Path $jdkDir "bin\javac.exe"))) {
    Write-Host "Downloading OpenJDK 17..."
    $jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.20.1%2B1/OpenJDK17U-jdk_x64_windows_hotspot_17.0.20.1_1.zip"
    curl.exe -L -o $jdkZip $jdkUrl
    
    Write-Host "Extracting OpenJDK 17..."
    $tempExtract = Join-Path $TargetDir "jdk_temp"
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    Expand-Archive -Path $jdkZip -DestinationPath $tempExtract -Force
    $innerJdk = Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1
    if (Test-Path $jdkDir) { Remove-Item -Recurse -Force $jdkDir }
    Move-Item -Path $innerJdk.FullName -Destination $jdkDir
    Remove-Item -Recurse -Force $tempExtract
    Remove-Item -Force $jdkZip
    Write-Host "OpenJDK 17 installed successfully."
} else {
    Write-Host "OpenJDK 17 already exists."
}

# 2. Download & Extract Android Command-Line Tools
if (-not (Test-Path (Join-Path $cmdlineLatest "bin\sdkmanager.bat"))) {
    Write-Host "Downloading Android Command-Line Tools..."
    $sdkUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    curl.exe -L -o $sdkZip $sdkUrl
    
    Write-Host "Extracting Android Command-Line Tools..."
    $tempSdkExtract = Join-Path $TargetDir "sdk_temp"
    if (Test-Path $tempSdkExtract) { Remove-Item -Recurse -Force $tempSdkExtract }
    Expand-Archive -Path $sdkZip -DestinationPath $tempSdkExtract -Force
    
    New-Item -ItemType Directory -Force -Path (Join-Path $androidSdk "cmdline-tools") | Out-Null
    if (Test-Path $cmdlineLatest) { Remove-Item -Recurse -Force $cmdlineLatest }
    Move-Item -Path (Join-Path $tempSdkExtract "cmdline-tools") -Destination $cmdlineLatest
    Remove-Item -Recurse -Force $tempSdkExtract
    Remove-Item -Force $sdkZip
    Write-Host "Android Command-Line Tools installed successfully."
} else {
    Write-Host "Android Command-Line Tools already exist."
}

# 3. Configure Environment Variables for this session
$env:JAVA_HOME = $jdkDir
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:PATH = "$jdkDir\bin;$cmdlineLatest\bin;$androidSdk\platform-tools;$env:PATH"

Write-Host "Java version:"
& "$jdkDir\bin\java.exe" -version

# 4. Accept licenses and install platform-tools, platforms;android-35, build-tools;35.0.0
Write-Host "Accepting licenses..."
$sdkManager = Join-Path $cmdlineLatest "bin\sdkmanager.bat"
cmd.exe /c "echo y | `"$sdkManager`" --licenses" | Out-Null

Write-Host "Installing Android SDK packages (platforms;android-35, build-tools;35.0.0, platform-tools)..."
cmd.exe /c "echo y | `"$sdkManager`" `"platforms;android-35`" `"build-tools;35.0.0`" `"platform-tools`""

Write-Host "Android environment successfully configured!"
