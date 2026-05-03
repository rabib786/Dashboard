@echo off
echo Downloading latest version from GitHub...

:: Create a temporary PowerShell script to handle the download and extraction
:: This ensures compatibility with Windows 7 (PowerShell 2.0)
echo [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 > "%TEMP%\update_temp.ps1"
echo $url = "https://github.com/rabib786/Personal-Dashboard-/archive/refs/heads/main.zip" >> "%TEMP%\update_temp.ps1"
echo $zipFile = "$PWD\update.zip" >> "%TEMP%\update_temp.ps1"
echo $extractPath = "$PWD\update_temp" >> "%TEMP%\update_temp.ps1"
echo. >> "%TEMP%\update_temp.ps1"
echo # Download using WebClient for PS 2.0 compatibility >> "%TEMP%\update_temp.ps1"
echo $client = New-Object System.Net.WebClient >> "%TEMP%\update_temp.ps1"
echo $client.DownloadFile($url, $zipFile) >> "%TEMP%\update_temp.ps1"
echo. >> "%TEMP%\update_temp.ps1"
echo echo "Extracting files..." >> "%TEMP%\update_temp.ps1"
echo # Try using modern ExtractToDirectory if available (.NET 4.5+) >> "%TEMP%\update_temp.ps1"
echo try { >> "%TEMP%\update_temp.ps1"
echo     Add-Type -AssemblyName System.IO.Compression.FileSystem >> "%TEMP%\update_temp.ps1"
echo     [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $extractPath) >> "%TEMP%\update_temp.ps1"
echo } catch { >> "%TEMP%\update_temp.ps1"
echo     # Fallback to Shell.Application for Windows 7 / PS 2.0 >> "%TEMP%\update_temp.ps1"
echo     $shell = New-Object -ComObject Shell.Application >> "%TEMP%\update_temp.ps1"
echo     $zip = $shell.NameSpace($zipFile) >> "%TEMP%\update_temp.ps1"
echo     $dest = $shell.NameSpace($extractPath) >> "%TEMP%\update_temp.ps1"
echo     if ($dest -eq $null) { >> "%TEMP%\update_temp.ps1"
echo         New-Item -ItemType Directory -Force -Path $extractPath ^| Out-Null >> "%TEMP%\update_temp.ps1"
echo         $dest = $shell.NameSpace($extractPath) >> "%TEMP%\update_temp.ps1"
echo     } >> "%TEMP%\update_temp.ps1"
echo     $dest.CopyHere($zip.Items(), 16) >> "%TEMP%\update_temp.ps1"
echo } >> "%TEMP%\update_temp.ps1"

:: Run the temporary script
powershell -ExecutionPolicy Bypass -File "%TEMP%\update_temp.ps1"

:: Clean up the temporary script
del "%TEMP%\update_temp.ps1"

echo Updating files...
xcopy "update_temp\Personal-Dashboard--main\*" "%cd%\" /E /Y /C /H

echo Cleaning up...
rmdir /s /q "update_temp"
del "update.zip"

echo Update complete! Press any key to exit.
pause >nul
