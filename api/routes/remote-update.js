const exec = require('child_process').exec;

initiateRemoteUpdate = async (socket_server) => {
    try {
        const update = await runUpdate();
        console.log('Updated Successfully', update);
    } catch (err) {
        console.log(err)
    }
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