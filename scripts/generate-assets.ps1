Add-Type -AssemblyName System.Drawing

$sourceLogoPath = "C:\From PC\Parloora New Website Ant+Supa\web\public\icon-512.png"
if (-not (Test-Path $sourceLogoPath)) {
    $sourceLogoPath = "C:\From PC\Parloora New Website Ant+Supa\web\public\logo.png"
}

Write-Host "Using base image from: $sourceLogoPath"
$sourceImg = [System.Drawing.Image]::FromFile($sourceLogoPath)

# Color definitions
$primaryColor = [System.Drawing.ColorTranslator]::FromHtml("#4B1D5F")
$accentColor = [System.Drawing.ColorTranslator]::FromHtml("#E2A9A9")
$whiteColor = [System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")

function Save-Resized-Icon {
    param (
        [System.Drawing.Image]$img,
        [int]$width,
        [int]$height,
        [string]$outputPath,
        [bool]$rounded = $false,
        [bool]$withBackground = $true
    )
    $dir = Split-Path $outputPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

    $targetBmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($withBackground) {
        $bgBrush = New-Object System.Drawing.SolidBrush $primaryColor
        $g.FillRectangle($bgBrush, 0, 0, $width, $height)
        $bgBrush.Dispose()
    } else {
        $g.Clear([System.Drawing.Color]::Transparent)
    }

    if ($rounded) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $g.SetClip($path)
    }

    # Center icon with padding (approx 12% padding)
    $padX = [int]($width * 0.12)
    $padY = [int]($height * 0.12)
    $drawW = $width - ($padX * 2)
    $drawH = $height - ($padY * 2)

    $g.DrawImage($img, $padX, $padY, $drawW, $drawH)
    $g.Dispose()

    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
}

function Save-Splash-Screen {
    param (
        [System.Drawing.Image]$img,
        [int]$width,
        [int]$height,
        [string]$outputPath
    )
    $dir = Split-Path $outputPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

    $targetBmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Background
    $bgBrush = New-Object System.Drawing.SolidBrush $primaryColor
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)
    $bgBrush.Dispose()

    # Draw centered logo
    $logoSize = [Math]::Min([int]($width * 0.38), [int]($height * 0.38))
    $logoSize = [Math]::Max($logoSize, 120)
    $posX = [int](($width - $logoSize) / 2)
    $posY = [int](($height - $logoSize) / 2) - [int]($height * 0.05)
    $g.DrawImage($img, $posX, $posY, $logoSize, $logoSize)

    $g.Dispose()
    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
}

function Save-Feature-Graphic {
    param (
        [System.Drawing.Image]$img,
        [string]$outputPath
    )
    $dir = Split-Path $outputPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

    $targetBmp = New-Object System.Drawing.Bitmap 1024, 500
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Gradient background
    $rect = New-Object System.Drawing.Rectangle 0, 0, 1024, 500
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $primaryColor, ([System.Drawing.ColorTranslator]::FromHtml("#361445")), 45.0
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Draw logo on left
    $g.DrawImage($img, 80, 100, 300, 300)

    # Text
    $fontTitle = New-Object System.Drawing.Font("Arial", [float]42, [System.Drawing.FontStyle]::Bold)
    $fontSubtitle = New-Object System.Drawing.Font("Arial", [float]20, [System.Drawing.FontStyle]::Regular)
    $titleBrush = New-Object System.Drawing.SolidBrush $whiteColor
    $subBrush = New-Object System.Drawing.SolidBrush $accentColor

    $g.DrawString("Parloora", $fontTitle, $titleBrush, 430, 150)
    $g.DrawString("Book Your self care services in seconds.", $fontSubtitle, $subBrush, 430, 230)
    $g.DrawString("Verified Salons | Instant Appointments | Real-Time", $fontSubtitle, $titleBrush, 430, 280)

    $fontTitle.Dispose()
    $fontSubtitle.Dispose()
    $titleBrush.Dispose()
    $subBrush.Dispose()
    $g.Dispose()

    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
}

function Save-Store-Screenshot {
    param (
        [string]$title,
        [string]$subtitle,
        [string]$outputPath
    )
    $dir = Split-Path $outputPath -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

    $width = 1080
    $height = 1920
    $targetBmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($targetBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Premium background gradient
    $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $primaryColor, ([System.Drawing.ColorTranslator]::FromHtml("#2A0D38")), 90.0
    $g.FillRectangle($brush, $rect)
    $brush.Dispose()

    # Header Card
    $fontHeader = New-Object System.Drawing.Font("Arial", [float]44, [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font("Arial", [float]24, [System.Drawing.FontStyle]::Regular)
    $whiteBrush = New-Object System.Drawing.SolidBrush $whiteColor
    $accentBrush = New-Object System.Drawing.SolidBrush $accentColor

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center

    $g.DrawString($title, $fontHeader, $whiteBrush, ($width / 2), 120, $sf)
    $g.DrawString($subtitle, $fontSub, $accentBrush, ($width / 2), 200, $sf)

    # Mockup phone container
    $phoneRect = New-Object System.Drawing.Rectangle 90, 320, 900, 1500
    $phoneBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF"))
    $g.FillRectangle($phoneBrush, $phoneRect)
    $phoneBrush.Dispose()

    # Top app bar in phone mockup
    $appBarRect = New-Object System.Drawing.Rectangle 90, 320, 900, 130
    $appBarBrush = New-Object System.Drawing.SolidBrush $primaryColor
    $g.FillRectangle($appBarBrush, $appBarRect)
    $appBarBrush.Dispose()

    $fontApp = New-Object System.Drawing.Font("Arial", [float]30, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Parloora", $fontApp, $whiteBrush, 140, 365)
    $fontApp.Dispose()

    # Content mockup cards
    $card1 = New-Object System.Drawing.Rectangle 130, 500, 820, 280
    $cardBrush1 = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#F9FAFB"))
    $g.FillRectangle($cardBrush1, $card1)
    
    $cardBorder = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#E5E7EB")), 2
    $g.DrawRectangle($cardBorder, $card1)

    $fontCardTitle = New-Object System.Drawing.Font("Arial", [float]28, [System.Drawing.FontStyle]::Bold)
    $fontCardText = New-Object System.Drawing.Font("Arial", [float]22, [System.Drawing.FontStyle]::Regular)
    $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#111827"))
    $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#6B7280"))

    $g.DrawString("★ 4.9 Verified Salon", $fontCardTitle, $darkBrush, 170, 540)
    $g.DrawString("Hair Care - Skincare - Bridal Makeup", $fontCardText, $mutedBrush, 170, 600)
    $g.DrawString("Instant Confirmation - Verified Staff", $fontCardText, $accentBrush, 170, 650)

    # Card 2
    $card2 = New-Object System.Drawing.Rectangle 130, 830, 820, 280
    $g.FillRectangle($cardBrush1, $card2)
    $g.DrawRectangle($cardBorder, $card2)
    $g.DrawString("★ 5.0 Premium Spa & Wellness", $fontCardTitle, $darkBrush, 170, 870)
    $g.DrawString("Aromatherapy - Facial - Relaxing Massage", $fontCardText, $mutedBrush, 170, 930)
    $g.DrawString("Special Discount: 20% OFF", $fontCardText, $accentBrush, 170, 980)

    # Card 3
    $card3 = New-Object System.Drawing.Rectangle 130, 1160, 820, 280
    $g.FillRectangle($cardBrush1, $card3)
    $g.DrawRectangle($cardBorder, $card3)
    $g.DrawString("★ 4.8 Top Rated Nail Studio", $fontCardTitle, $darkBrush, 170, 1200)
    $g.DrawString("Manicure - Pedicure - Gel Polish", $fontCardText, $mutedBrush, 170, 1260)
    $g.DrawString("Available Today - Book Now", $fontCardText, $accentBrush, 170, 1310)

    # Book Button
    $btnRect = New-Object System.Drawing.Rectangle 180, 1500, 720, 100
    $btnBrush = New-Object System.Drawing.SolidBrush $primaryColor
    $g.FillRectangle($btnBrush, $btnRect)
    $btnBrush.Dispose()

    $fontBtn = New-Object System.Drawing.Font("Arial", [float]26, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Book Appointment in Seconds", $fontBtn, $whiteBrush, ($width / 2), 1532, $sf)
    $fontBtn.Dispose()

    $fontHeader.Dispose()
    $fontSub.Dispose()
    $fontCardTitle.Dispose()
    $fontCardText.Dispose()
    $whiteBrush.Dispose()
    $accentBrush.Dispose()
    $darkBrush.Dispose()
    $mutedBrush.Dispose()
    $cardBrush1.Dispose()
    $cardBorder.Dispose()
    $g.Dispose()

    $targetBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $targetBmp.Dispose()
}

Write-Host "1. Generating Android launcher icons..."
$androidMipmap = "C:\From PC\Parloora New Website Ant+Supa\android\app\src\main\res"
Save-Resized-Icon $sourceImg 48 48 "$androidMipmap\mipmap-mdpi\ic_launcher.png"
Save-Resized-Icon $sourceImg 48 48 "$androidMipmap\mipmap-mdpi\ic_launcher_round.png" $true
Save-Resized-Icon $sourceImg 108 108 "$androidMipmap\mipmap-mdpi\ic_launcher_foreground.png" $false $false

Save-Resized-Icon $sourceImg 72 72 "$androidMipmap\mipmap-hdpi\ic_launcher.png"
Save-Resized-Icon $sourceImg 72 72 "$androidMipmap\mipmap-hdpi\ic_launcher_round.png" $true
Save-Resized-Icon $sourceImg 162 162 "$androidMipmap\mipmap-hdpi\ic_launcher_foreground.png" $false $false

Save-Resized-Icon $sourceImg 96 96 "$androidMipmap\mipmap-xhdpi\ic_launcher.png"
Save-Resized-Icon $sourceImg 96 96 "$androidMipmap\mipmap-xhdpi\ic_launcher_round.png" $true
Save-Resized-Icon $sourceImg 216 216 "$androidMipmap\mipmap-xhdpi\ic_launcher_foreground.png" $false $false

Save-Resized-Icon $sourceImg 144 144 "$androidMipmap\mipmap-xxhdpi\ic_launcher.png"
Save-Resized-Icon $sourceImg 144 144 "$androidMipmap\mipmap-xxhdpi\ic_launcher_round.png" $true
Save-Resized-Icon $sourceImg 324 324 "$androidMipmap\mipmap-xxhdpi\ic_launcher_foreground.png" $false $false

Save-Resized-Icon $sourceImg 192 192 "$androidMipmap\mipmap-xxxhdpi\ic_launcher.png"
Save-Resized-Icon $sourceImg 192 192 "$androidMipmap\mipmap-xxxhdpi\ic_launcher_round.png" $true
Save-Resized-Icon $sourceImg 432 432 "$androidMipmap\mipmap-xxxhdpi\ic_launcher_foreground.png" $false $false

Write-Host "2. Generating Android splash screens..."
Save-Splash-Screen $sourceImg 480 800 "$androidMipmap\drawable\splash.png"
Save-Splash-Screen $sourceImg 320 480 "$androidMipmap\drawable-port-mdpi\splash.png"
Save-Splash-Screen $sourceImg 480 800 "$androidMipmap\drawable-port-hdpi\splash.png"
Save-Splash-Screen $sourceImg 720 1280 "$androidMipmap\drawable-port-xhdpi\splash.png"
Save-Splash-Screen $sourceImg 960 1600 "$androidMipmap\drawable-port-xxhdpi\splash.png"
Save-Splash-Screen $sourceImg 1280 1920 "$androidMipmap\drawable-port-xxxhdpi\splash.png"
Save-Splash-Screen $sourceImg 480 320 "$androidMipmap\drawable-land-mdpi\splash.png"
Save-Splash-Screen $sourceImg 800 480 "$androidMipmap\drawable-land-hdpi\splash.png"
Save-Splash-Screen $sourceImg 1280 720 "$androidMipmap\drawable-land-xhdpi\splash.png"
Save-Splash-Screen $sourceImg 1600 960 "$androidMipmap\drawable-land-xxhdpi\splash.png"
Save-Splash-Screen $sourceImg 1920 1280 "$androidMipmap\drawable-land-xxxhdpi\splash.png"

Write-Host "3. Generating iOS AppIcon and Splash..."
$iosIconDir = "C:\From PC\Parloora New Website Ant+Supa\ios\App\App\Assets.xcassets\AppIcon.appiconset"
Save-Resized-Icon $sourceImg 1024 1024 "$iosIconDir\AppIcon-512@2x.png" $false $true

$iosSplashDir = "C:\From PC\Parloora New Website Ant+Supa\ios\App\App\Assets.xcassets\Splash.imageset"
Save-Splash-Screen $sourceImg 2732 2732 "$iosSplashDir\splash-2732x2732.png"
Save-Splash-Screen $sourceImg 2732 2732 "$iosSplashDir\splash-2732x2732-1.png"
Save-Splash-Screen $sourceImg 2732 2732 "$iosSplashDir\splash-2732x2732-2.png"

Write-Host "4. Generating Store Graphics & Delivery Assets..."
$assetsDelivery = "C:\From PC\Parloora New Website Ant+Supa\Parloora-Mobile-App-Delivery\Assets"
Save-Resized-Icon $sourceImg 512 512 "$assetsDelivery\GooglePlay\google-play-icon-512.png" $false $true
Save-Feature-Graphic $sourceImg "$assetsDelivery\GooglePlay\google-play-feature-graphic-1024x500.png"
Save-Resized-Icon $sourceImg 1024 1024 "$assetsDelivery\AppStore\app-store-icon-1024.png" $false $true

Write-Host "5. Generating Play Store & App Store Screenshots..."
Save-Store-Screenshot "Discover Top Salons" "Explore verified beauty parlours across Bangladesh" "$assetsDelivery\StoreScreenshots\1-discover-parlours.png"
Save-Store-Screenshot "Instant Appointment Booking" "Select treatments, staff, and real-time time slots" "$assetsDelivery\StoreScreenshots\2-instant-booking.png"
Save-Store-Screenshot "Seamless Account & Bookings" "Track appointments, status, and history easily" "$assetsDelivery\StoreScreenshots\3-manage-bookings.png"
Save-Store-Screenshot "Verified Customer Reviews" "Transparent ratings and authentic client feedback" "$assetsDelivery\StoreScreenshots\4-verified-reviews.png"

$sourceImg.Dispose()
Write-Host "All assets generated successfully!"
