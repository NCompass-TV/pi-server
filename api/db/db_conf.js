const { shell } = require('systeminformation');
const sqlite3 = require('sqlite3').verbose();
const db_file = 'api/db/_data.db';
const exec = require('child_process').exec;
const shelljs = require('shelljs');

// Establish connection on sqlite database.
const db = new sqlite3.Database(db_file, sqlite3.OPEN_READWRITE, async (err) => {
    if (err) {
        console.log(`An Error Occured: ${err.message}`);
        await getBackupDatabase();
        await restartPlayer();
    }
    console.log('Connected to data.sqlite');
})

const getBackupDatabase = () => {
    return new Promise((resolve, reject) => {
        exec(`yes | cp -rf /home/pi/n-compasstv/db_backup_dirty/_data.db /home/pi/n-compasstv/pi-server/api/db`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
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

module.exports = db;