#!/bin/bash
# Remote Update Script

echo '**Welcome to the N-Compass TV Pi System Update**';
echo 'Starting Update Process, Please make sure Pi is connected to the internet and avoid turning it off during the process ...';
sleep 5;
pm2 stop all;
echo '=======================Updating NPM=========================';
sudo npm install -g npm;
echo '=======================Downloading Pi Server Updates=========================';
echo 'Creating backup ...';
cd /home/pi/n-compasstv/pi-server;
if test -d /home/pi/n-compasstv/backup
then
	echo "Backup Folder is Present"
else
	mkdir /home/pi/n-compasstv/backup;
fi

if test -d /home/pi/n-compasstv/db_backup_dirty
then
	echo "DB Dirty Folder is Present"
else
	mkdir /home/pi/n-compasstv/db_backup_dirty;
fi

if test -d /home/pi/n-compasstv/db_backup_clean
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
echo '=======================Downloading Pi Electron Updates=======================';
cd /home/pi/n-compasstv/pi-electron;
git pull;
npm install;
npm update;
echo '=======================Downloading Pi Player Updates=========================';
cd /var/www/html;
git pull;
echo '=======================Finishing Touch, Hold on=========================';
if grep -Fxq "avoid_warnings=1" /boot/config.txt
then 
	echo "avoid_warnings already set to 1"
else
	sudo sed -i -e '$aavoid_warnings=1' /boot/config.txt
fi
echo '=======================Running Update no Reboot=========================';
cd /home/pi/n-compasstv/pi-server/shell
./update-no-reboot.sh
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
