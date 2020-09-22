#!/bin/bash
# On Demand Script in case there are commands that needs to be run by force.
# Set Permission

echo 0 0 * * * ./home/pi/n-compasstv/pi-server/shell/remote-update.sh | crontab -