# Generates the store/launcher icon set from assets/truediet-logo.png.
#
# The source logo is a 1536x1024 lockup (not square), so every output is the
# logo contained (never cropped) on the app's white background. Re-runnable:
#   powershell -ExecutionPolicy Bypass -File scripts\generate-app-icons.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'assets\truediet-logo.png'
$out = Join-Path $root 'assets'

if (-not (Test-Path $src)) { throw "Missing source logo: $src" }

# Draw the logo contained inside a square canvas of $size with $marginRatio padding.
function New-Icon {
  param([string]$Path, [int]$Size, [double]$MarginRatio, [string]$Background = '#ffffff')

  $canvas = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.SmoothingMode = 'HighQuality'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.CompositingQuality = 'HighQuality'

  $bg = [System.Drawing.ColorTranslator]::FromHtml($Background)
  $g.Clear($bg)

  $logo = [System.Drawing.Image]::FromFile($src)
  try {
    $margin = [int]($Size * $MarginRatio)
    $box = $Size - (2 * $margin)
    $scale = [Math]::Min($box / $logo.Width, $box / $logo.Height)
    $w = [int][Math]::Round($logo.Width * $scale)
    $h = [int][Math]::Round($logo.Height * $scale)
    $x = [int](($Size - $w) / 2)
    $y = [int](($Size - $h) / 2)
    $g.DrawImage($logo, (New-Object System.Drawing.Rectangle($x, $y, $w, $h)))
  } finally {
    $logo.Dispose()
  }

  $g.Dispose()
  $canvas.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  Write-Output ("wrote {0} ({1}x{1})" -f (Split-Path -Leaf $Path), $Size)
}

# Launcher / store icon (Google Play + App Store want 1024x1024, no transparency).
New-Icon -Path (Join-Path $out 'icon.png') -Size 1024 -MarginRatio 0.14

# Android adaptive icon foreground: the OS crops/masks the outer 33%, so the
# artwork must stay inside the central safe zone (~66%).
New-Icon -Path (Join-Path $out 'adaptive-icon.png') -Size 1024 -MarginRatio 0.22

# Splash logo and web favicon.
New-Icon -Path (Join-Path $out 'splash-icon.png') -Size 512 -MarginRatio 0.10
New-Icon -Path (Join-Path $out 'favicon.png') -Size 96 -MarginRatio 0.06
