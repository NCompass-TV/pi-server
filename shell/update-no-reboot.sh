#!/bin/bash
# Remote Update Script

echo '**N-CompassTV Player Startup Required Update**';
echo 'Starting Update Process, Please make sure Pi is connected to the internet and avoid turning it off during the process ...';
sleep 5;
pm2 stop all;
echo '=======================Updating NPM=========================';
sudo npm install -g npm;
echo '=======================Updating the Pi Server=========================';
echo 'Creating backup ...';
cd /home/pi/n-compasstv/pi-server;
if [-d /backup]
then
	echo "Backup Folder is Present"
else
	mkdir /home/pi/n-compasstv/backup;
fi

if [-d /backup]
then
	echo "DB Dirty Folder is Present"
else
	mkdir /home/pi/n-compasstv/db_backup_dirty;
fi

if [-d /backup]
then
	echo "DB Clean Folder is Present"
else
	mkdir /home/pi/n-compasstv/db_backup_clean;
fi
cp -R /home/pi/n-compasstv/pi-server/public /home/pi/n-compasstv/backup;
cp /home/pi/n-compasstv/pi-server/api/db/_data.db /home/pi/n-compasstv/backup;
git reset --hard;
git pull;
npm install;
npm update;
yes | cp -rf /home/pi/n-compasstv/pi-server/api/db/_data.db /home/pi/n-compasstv/db_backup_clean;
yes | cp -rf /home/pi/n-compasstv/backup/public /home/pi/n-compasstv/pi-server;
yes | cp -rf /home/pi/n-compasstv/backup/_data.db /home/pi/n-compasstv/pi-server/api/db;
rm -rf /home/pi/n-compasstv/backup;
sudo chmod -R 777 /home/pi/n-compasstv;
echo '=======================Updating the Pi Electron=======================';
cd /home/pi/n-compasstv/pi-electron;
git pull;
npm install;
npm update;
echo '=======================Updating the Pi Player=========================';
cd /var/www/html;
git pull;
echo '=======================Finishing Touch, Hold on=========================';
if grep -Fxq "avoid_warnings=1" /boot/config.txt
then 
	echo "avoid_warnings already set to 1"
else
	sudo sed -i -e '$aavoid_warnings=1' /boot/config.txt
fi
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