#!/bin/sh

echo 'Turning off Player';
pm2 stop npm;

echo 'Turning off Pi Server'
pm2 stop app;

echo 'Flushing PM2 Logs'
pm2 flush;

echo 'Services are turned off, Restarting Pi ...';
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
