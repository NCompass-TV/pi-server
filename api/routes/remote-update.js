const exec = require('child_process').exec;

initiateRemoteUpdate = async () => {
    try {
        const update = await runUpdate();
        console.log('Updated Successfully', update);
    } catch (err) {
        console.log(err)
    }
}

initiatePiRestart = async () => {
	try {
		const off = await shutdownPlayer();
		console.log('#initiatePiRestart: ', off);
    } catch (err) {
        console.log('#initiatePiRestart:', err)
    }
}

shutdownPlayer = () => {
	console.log('Turning Off Player')
    return new Promise((resolve, reject) => {
        exec(`gnome-terminal -- /home/pi/n-compasstv/pi-server/shell/restart-pi.sh`, (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              reject(err)
            }
            resolve('Player is now off, Pi Rebooting', stdout);
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