Add-Type -AssemblyName System.Drawing

$targetWidth = 1280
$targetHeight = 800

$outDir = "d:\Projects\Projects\nid auto\store_screenshots"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$files = @(
    "C:\Users\aadar\.gemini\antigravity-ide\brain\a20da96f-4fdd-459d-b821-93d3e78770ea\screenshot_1_1783802029624.png",
    "C:\Users\aadar\.gemini\antigravity-ide\brain\a20da96f-4fdd-459d-b821-93d3e78770ea\screenshot_2_1783802047763.png",
    "C:\Users\aadar\.gemini\antigravity-ide\brain\a20da96f-4fdd-459d-b821-93d3e78770ea\screenshot_3_1783802064236.png"
)

for ($i=0; $i -lt $files.Length; $i++) {
    $img = [System.Drawing.Image]::FromFile($files[$i])
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

    $targetPath = Join-Path $outDir "screenshot_$($i+1)_1280x800.png"
    $bitmap.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graph.Dispose()
    $bitmap.Dispose()
    $img.Dispose()
}
