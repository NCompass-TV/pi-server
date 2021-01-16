#!/bin/sh

echo 'Turning off Player';
pm2 stop all;

echo 'Flushing PM2 Logs'
pm2 flush;

echo 'Player is turned off, Restarting Pi ...';
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
