#!/bin/bash
# Remote Update Script

echo '**Welcome to the N-Compass TV Pi System Update**';
echo 'Starting Update Process, Please make sure Pi is connected to the internet and avoid turning it off during the process ...';
sleep 5;
pm2 stop all;
echo '=======================Updating NPM=========================';
sudo npm install -g npm;
echo '=======================Downloading Pi Server Updates=========================';
cd /home/pi/n-compasstv/pi-server;

if test -d /home/pi/n-compasstv/backup
then
	echo "Backup Folder is Present"
else
	echo "Creating Backup Folder"
	mkdir /home/pi/n-compasstv/backup;
fi

if test -d /home/pi/n-compasstv/db_backup_dirty
then
	echo "DB Dirty Folder is Present"
else
	echo "Creating DB Dirty Folder Folder"
	mkdir /home/pi/n-compasstv/db_backup_dirty;
fi

if test -d /home/pi/n-compasstv/db_backup_clean
then
	echo "DB Clean Folder is Present"
else
	echo "Creating DB Clean Folder Folder"
	mkdir /home/pi/n-compasstv/db_backup_clean;
fi

echo 'Creating backup, This may take a while ...';

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

echo '=======================Running Update=========================';
cd /home/pi/n-compasstv/pi-server/shell
./update-no-reboot.sh
