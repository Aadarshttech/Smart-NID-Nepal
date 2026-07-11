Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("extension\icons\icon.png")
$bitmap = New-Object System.Drawing.Bitmap(128, 128)
$graph = [System.Drawing.Graphics]::FromImage($bitmap)
$graph.DrawImage($img, 0, 0, 128, 128)
$bitmap.Save("extension\icons\icon128.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graph.Dispose()
$bitmap.Dispose()
$img.Dispose()
