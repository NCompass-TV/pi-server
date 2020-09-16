#!/bin/bash
# Remote Update Script

echo '**N-CompassTV Player Startup Required Update**';
echo 'Starting Update Process, Please make sure Pi is connected to the internet and avoid turning it off during the process ...';
sleep 5;
pm2 stop all;
echo '=======================Updating the Pi Server=========================';
cd /home/pi/n-compasstv/pi-server;
git reset --hard;
git pull;
npm install;
echo '=======================Updating the Pi Electron=======================';
cd /home/pi/n-compasstv/pi-electron;
git pull;
npm install;
echo '=======================Updating the Pi Player=========================';
cd /var/www/html;
git pull;
echo 'Update Finished! Player Starting';
sleep 1;
echo '5';
sleep 1;
echo '4';
sleep 1;
echo '3';
sleep 1;
echo '2';
sleep 1;
echo '1';
sleep 1;
pm2 restart all;
killall lxterminal;