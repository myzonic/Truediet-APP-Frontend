# Generates the Android notification small icon (a white-on-transparent
# silhouette) from the True Diet logo, for every density bucket.
#
# Android renders the status-bar icon as a flat silhouette, so the colourful
# logo has to be reduced to solid white shapes on a transparent background.
#
#   powershell -ExecutionPolicy Bypass -File scripts\generate-notification-icon.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$logo = Join-Path $root 'assets\truediet-logo.png'
$res = Join-Path $root 'android\app\src\main\res'

if (-not (Test-Path $logo)) { throw "Missing logo: $logo" }

# The fork mark in the source logo (1536x1024). Only the tines and upper stem
# are used: the lower part of the fork disappears behind the bowl and would
# read as noise at 24dp.
$crop = New-Object System.Drawing.Rectangle(400, 0, 470, 270)

$source = [System.Drawing.Image]::FromFile($logo)
$region = New-Object System.Drawing.Bitmap($crop.Width, $crop.Height)
$g = [System.Drawing.Graphics]::FromImage($region)
$g.DrawImage(
  $source,
  (New-Object System.Drawing.Rectangle(0, 0, $crop.Width, $crop.Height)),
  $crop,
  [System.Drawing.GraphicsUnit]::Pixel
)
$g.Dispose()

# Turn the crop into a white silhouette with the original alpha.
$mask = New-Object System.Drawing.Bitmap($crop.Width, $crop.Height)
for ($y = 0; $y -lt $crop.Height; $y++) {
  for ($x = 0; $x -lt $crop.Width; $x++) {
    $p = $region.GetPixel($x, $y)
    $alpha = [Math]::Min(255, $p.A)
    if ($alpha -lt 24) {
      $mask.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    } else {
      $mask.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
    }
  }
}
$region.Dispose()
$source.Dispose()

# Trim transparent edges so the glyph fills the icon box.
$minX = $crop.Width; $maxX = -1; $minY = $crop.Height; $maxY = -1
for ($y = 0; $y -lt $mask.Height; $y++) {
  for ($x = 0; $x -lt $mask.Width; $x++) {
    if ($mask.GetPixel($x, $y).A -gt 24) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
if ($maxX -lt 0) { throw 'The crop produced an empty mask.' }
$trimmed = New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
Write-Output "trimmed glyph: $($trimmed.Width)x$($trimmed.Height)"

# Density buckets: a notification icon is 24dp.
$buckets = @{
  'drawable-mdpi'    = 24
  'drawable-hdpi'    = 36
  'drawable-xhdpi'   = 48
  'drawable-xxhdpi'  = 72
  'drawable-xxxhdpi' = 96
}

foreach ($bucket in $buckets.GetEnumerator()) {
  $size = $bucket.Value
  $dir = Join-Path $res $bucket.Key
  New-Item -ItemType Directory -Force -Path $dir | Out-Null

  $icon = New-Object System.Drawing.Bitmap($size, $size)
  $g2 = [System.Drawing.Graphics]::FromImage($icon)
  $g2.Clear([System.Drawing.Color]::Transparent)
  $g2.SmoothingMode = 'HighQuality'
  $g2.InterpolationMode = 'HighQualityBicubic'
  $g2.PixelOffsetMode = 'HighQuality'
  $g2.CompositingQuality = 'HighQuality'

  # Fit the glyph inside the box with a little padding.
  $pad = [Math]::Round($size * 0.08)
  $box = $size - (2 * $pad)
  $scale = [Math]::Min($box / $trimmed.Width, $box / $trimmed.Height)
  $w = [int][Math]::Round($trimmed.Width * $scale)
  $h = [int][Math]::Round($trimmed.Height * $scale)
  $dx = [int](($size - $w) / 2)
  $dy = [int](($size - $h) / 2)
  $g2.DrawImage(
    $mask,
    (New-Object System.Drawing.Rectangle($dx, $dy, $w, $h)),
    $trimmed,
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $g2.Dispose()

  $path = Join-Path $dir 'ic_truediet_notification.png'
  $icon.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $icon.Dispose()
  Write-Output "wrote $($bucket.Key)/ic_truediet_notification.png ($size x $size)"
}

$mask.Dispose()
