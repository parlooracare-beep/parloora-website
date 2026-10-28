$delAssets = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery\Assets"
New-Item -ItemType Directory -Force -Path (Join-Path $delAssets "AppIcons") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $delAssets "SplashScreens") | Out-Null

Copy-Item "C:\From PC\Parloora New Website Ant+Supa\web\public\icon-512.png" (Join-Path $delAssets "AppIcons\icon-512x512.png") -Force
Copy-Item "C:\From PC\Parloora New Website Ant+Supa\web\public\logo.png" (Join-Path $delAssets "AppIcons\logo-primary.png") -Force
Copy-Item "C:\From PC\Parloora New Website Ant+Supa\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" (Join-Path $delAssets "AppIcons\icon-192x192.png") -Force
Copy-Item "C:\From PC\Parloora New Website Ant+Supa\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png" (Join-Path $delAssets "AppIcons\icon-192x192-round.png") -Force

Copy-Item "C:\From PC\Parloora New Website Ant+Supa\android\app\src\main\res\drawable\splash.png" (Join-Path $delAssets "SplashScreens\splash-android-portrait.png") -Force
Copy-Item "C:\From PC\Parloora New Website Ant+Supa\android\app\src\main\res\drawable-land-xxxhdpi\splash.png" (Join-Path $delAssets "SplashScreens\splash-android-landscape.png") -Force
Copy-Item "C:\From PC\Parloora New Website Ant+Supa\ios\App\App\Assets.xcassets\Splash.imageset\splash-2732x2732.png" (Join-Path $delAssets "SplashScreens\splash-ios-universal.png") -Force

Write-Host "Assets copied successfully!"
