#!/bin/bash
# Remote Update Script

echo '**Welcome to the N-Compass TV Pi System Update**';
echo 'Starting Update Process, Please make sure Pi is connected to the internet and avoid turning it off during the process ...';
sleep 5;
pm2 stop all;
echo '=======================Updating the Pi Server=========================';
echo 'Creating backup ...';
cd /home/pi/n-compasstv/pi-server;
mkdir /home/pi/n-compasstv/backup;
cp -R /home/pi/n-compasstv/pi-server/public /home/pi/n-compasstv/backup;
cp /home/pi/n-compasstv/pi-server/api/db/_data.db /home/pi/n-compasstv/backup;
git reset --hard;
git pull;
npm install;
yes | cp -rf /home/pi/n-compasstv/backup/public /home/pi/n-compasstv/pi-server;
yes | cp -rf /home/pi/n-compasstv/backup/_data.db /home/pi/n-compasstv/pi-server/api/db;
rm -rf /home/pi/n-compasstv/backup;
sudo chmod -R 777 /home/pi/n-compasstv;
sudo ./home/pi/n-compasstv/pi-server/shell/on-demand.sh
echo '=======================Updating the Pi Electron=======================';
cd /home/pi/n-compasstv/pi-electron;
git pull;
npm install;
echo '=======================Updating the Pi Player=========================';
cd /var/www/html;
git pull;
echo 'Update Finished! Pi will now reboot';
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
reboot;