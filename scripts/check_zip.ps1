Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("d:\Projects\Projects\nid auto\Smart-NID-Helper-v1.1.0.zip")
$zip.Entries | Select-Object FullName
$zip.Dispose()
