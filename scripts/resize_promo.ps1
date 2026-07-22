Add-Type -AssemblyName System.Drawing

$originalImagePath = "C:\Users\aadar\.gemini\antigravity-ide\brain\a20da96f-4fdd-459d-b821-93d3e78770ea\promo_small_1783799982730.png"
$targetPath = "d:\Projects\Projects\nid auto\promo_small.png"

$img = [System.Drawing.Image]::FromFile($originalImagePath)
$targetWidth = 440
$targetHeight = 280

$bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
$graph = [System.Drawing.Graphics]::FromImage($bitmap)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRatio = $img.Width / $img.Height
$tgtRatio = $targetWidth / $targetHeight

if ($srcRatio -gt $tgtRatio) {
    $scale = $targetHeight / $img.Height
    $scaledWidth = $img.Width * $scale
    $xOffset = ($targetWidth - $scaledWidth) / 2
    $graph.DrawImage($img, $xOffset, 0, $scaledWidth, $targetHeight)
} else {
    $scale = $targetWidth / $img.Width
    $scaledHeight = $img.Height * $scale
    $yOffset = ($targetHeight - $scaledHeight) / 2
    $graph.DrawImage($img, 0, $yOffset, $targetWidth, $scaledHeight)
}

$bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graph.Dispose()
$bitmap.Dispose()
$img.Dispose()
