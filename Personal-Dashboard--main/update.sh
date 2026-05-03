#!/bin/bash
echo "Downloading latest version from GitHub..."
curl -L -o update.zip "https://github.com/rabib786/Personal-Dashboard-/archive/refs/heads/main.zip"
echo "Extracting files..."
unzip -q -o update.zip -d update_temp
echo "Updating files..."
cp -a update_temp/Personal-Dashboard--main/* ./
echo "Cleaning up..."
rm -rf update_temp
rm update.zip
echo "Update complete!"
