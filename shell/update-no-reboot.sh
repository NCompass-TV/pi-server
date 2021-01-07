#!/bin/bash
# Remote Update Script

echo '=======================Updating Pi Electron=======================';
cd /home/pi/n-compasstv/pi-electron;
rm package-lock.json
git reset --hard;
git pull;
npm install;
npm update;
echo '=======================Updating Pi Player Updates=========================';
cd /var/www/html;
git pull;
echo '=======================Finishing Touch, Hold on=========================';

if grep -Fxq "avoid_warnings=1" /boot/config.txt
then 
	echo "avoid_warnings already set to 1"
else
	echo "Adding Warning Disabled Property"
	sudo sed -i -e '$aavoid_warnings=1' /boot/config.txt
fi

if test -d /home/pi/n-compasstv/db_backup_dirty
then
	echo "DB Dirty is Present"
else
	echo "Creating DB Dirty Folder Folder"
	rm -rf /home/pi/n-compasstv/db_backup_dirty;
	rm /home/pi/n-compasstv/db_backup_dirty;
	mkdir /home/pi/n-compasstv/db_backup_dirty;
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
sudo reboot now
