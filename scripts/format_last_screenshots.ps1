Add-Type -AssemblyName System.Drawing
$dir = "d:\Projects\Projects\nid auto\store_screenshots"
$images = Get-ChildItem "$dir\*" -Include "11.*", "12.*" | Where-Object { $_.Name -notmatch "^ready_" }

$targetWidth = 1280
$targetHeight = 800

foreach ($img in $images) {
    $src = [System.Drawing.Image]::FromFile($img.FullName)
    $bmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Background color (modern light slate)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 241, 245, 249))
    $graph.FillRectangle($bgBrush, 0, 0, $targetWidth, $targetHeight)
    
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Padding
    $padding = 40
    $availW = $targetWidth - ($padding * 2)
    $availH = $targetHeight - ($padding * 2)
    
    $scale = [math]::Min($availW / $src.Width, $availH / $src.Height)
    
    $newW = [math]::Round($src.Width * $scale)
    $newH = [math]::Round($src.Height * $scale)
    
    $xOffset = [math]::Round(($targetWidth - $newW) / 2)
    $yOffset = [math]::Round(($targetHeight - $newH) / 2)
    
    # Drop shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 0, 0, 0))
    $graph.FillRectangle($shadowBrush, $xOffset + 8, $yOffset + 8, $newW, $newH)
    
    # Draw image
    $graph.DrawImage($src, $xOffset, $yOffset, $newW, $newH)
    
    $outPath = Join-Path $dir "ready_$([System.IO.Path]::GetFileNameWithoutExtension($img.Name)).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graph.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    $bgBrush.Dispose()
    $shadowBrush.Dispose()
    
    Write-Host "Processed $($img.Name)"
}
