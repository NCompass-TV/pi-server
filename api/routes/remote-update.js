const exec = require('child_process').exec;

initiateRemoteUpdate = async (socket_server) => {
    try {
        const update = await runUpdate();
        console.log('Updated Successfully', update);
    } catch (err) {
        console.log(err)
    }
}

initiatePiRestart = async (socket_server) => {
	try {
		const off = await shutdownPlayer();
		console.log('#initiatePiRestart: ', off);
		const restart = await restartPi();
		console.log('#initiatePiRestart: ', restart);
    } catch (err) {
        console.log('#initiatePiRestart:', err)
    }
}

shutdownPlayer = async () => {
	console.log('Turning Off Player')
    return new Promise((resolve, reject) => {
        exec(`gnome-terminal -- pm2 stop all`, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              reject(err)
            }
            resolve('Player is now off, Pi Rebooting', stdout);
        });
    })
}

restartPi = async () => {
	console.log('Pi Restarting')
    return new Promise((resolve, reject) => {
        exec(`sudo reboot now`, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              reject(err)
            }
            resolve('Pi Restart Gracefully', stdout);
        });
    })
}

runUpdate = () => {
    console.log('REMOTE UPDATE')
    return new Promise((resolve, reject) => {
        exec(`gnome-terminal -- /home/pi/n-compasstv/pi-server/shell/remote-update.sh`, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              reject(err)
            }
            resolve('Update Completed Succesfully', stdout);
        });
    })
}

exports.initiateRemoteUpdate = initiateRemoteUpdate;
exports.initiatePiRestart = initiatePiRestart;