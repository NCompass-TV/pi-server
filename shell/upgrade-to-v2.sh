#!/bin/bash
# Upgrade to V2 Script Runner

echo "==> Downloading Version 2 Installer";
wget https://ncompass-tv-player.s3.amazonaws.com/player-installer.zip -P /home/pi/;

echo "==> Extracting Installer Files";
unzip /home/pi/player-installer.zip -d /home/pi/;

echo "==> Running Installer";
eval cd /home/pi/player-installer/;
./installer.sh;