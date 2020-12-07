const exec = require('child_process').exec;
const shelljs = require('shelljs');
const remoteupdate = require('./remote-update');

const getBackupDatabase = () => {
    return new Promise((resolve, reject) => {
        exec(`yes | cp -rf /home/pi/n-compasstv/db_backup_clean/_data.db /home/pi/n-compasstv/pi-server/api/db`, async (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                await remoteupdate.initiateRemoteUpdate();
			}
			
            resolve('Database Rescued');
        });
    })
}

const restartPlayer = () => {
    console.log('Restarting Player')

    return new Promise((resolve, reject) => {
        shelljs.exec(`pm2 restart app`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
            }
        });

        shelljs.exec(`pm2 restart npm`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
            }
            
        });

        resolve("Restarting")
    })
}

module.exports = {
    getBackupDatabase: getBackupDatabase,
    restartPlayer: restartPlayer
};
