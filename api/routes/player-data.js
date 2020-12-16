const express = require('express');
const db = require('../db/db_conf');
const router = express.Router();
const exec = require('child_process').exec;
const os = require('os');
const sqlstring = require('sqlstring-sqlite');
const dbfix = require('../../api/routes/dbfix');
const remoteupdate = require('./remote-update');

router.post('', async(req, res) => {
    try {
        const saved_data = [];
        saved_data.push(await fetchAndSaveContent(req.body.piContents.contents));
		saved_data.push(await fetchAndSaveZones(req.body.piContents.screenZonePlaylistsContents));
		saved_data.push(await saveHostInfo(req.body.piContents.host, req.body.piContents.timezone));
		const backup_result = await backupDatabase();
		console.log(backup_result)
        res.json({data_saved: true});
    } catch(error) {
		console.log('Error on /save-data: \n * License is not activated \n * License does not exist \n * License is not assigned ', error);
    }
})

const backupDatabase = () => {
	return new Promise((resolve, reject) => {
        exec(`yes | cp -rf /home/pi/n-compasstv/pi-server/api/db/_data.db /home/pi/n-compasstv/db_backup_dirty/_data.db`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
			}
			
            resolve('Database Backup Created');
        });
    })
}

const fetchAndSaveContent = data => {
    return new Promise((resolve, reject) => {
        data.forEach(item => {
            let sql = `INSERT INTO contents (content_id, url, file_type, date_created, host_id, file_name, handler_id, title) VALUES 
			(${sqlstring.escape(item.contentId)}, 
			${sqlstring.escape(item.url)}, 
			${sqlstring.escape(item.fileType)}, 
			${sqlstring.escape(item.dateCreated)}, 
			${sqlstring.escape(item.hostId)}, 
			${sqlstring.escape(item.fileName)}, 
			${sqlstring.escape(item.handlerId)},
			${sqlstring.escape(item.title)})`;

            db.all(sql, (err, rows) => {
                if(err) {
                    console.log(err);
                    reject(new Error('SERVER PROBLEM'));
                } else {
                    resolve();
                }
            })
        });
    })
}

// (2020) Optimize this future dev :)
const fetchAndSaveZones = (data) => {
    return new Promise((resolve, reject) => {
        data.forEach(item => {
            let sequence = 1;
            const zone = item.screenTemplateZonePlaylist;
            const contents = item.contents;
			let sql = `INSERT INTO template_zones (template_id, x_pos, y_pos, height, width, screen_id, background, playlist_id, playlist_type, zone_order) 
			VALUES 
			(${sqlstring.escape(zone.templateId)}, 
			${sqlstring.escape(zone.xPos)},
			${sqlstring.escape(zone.yPos)},
			${sqlstring.escape(zone.height)},
			${sqlstring.escape(zone.width)}, 
			${sqlstring.escape(zone.screenId)},
			${sqlstring.escape(zone.background)},
			${sqlstring.escape(zone.playlistId)},
			${sqlstring.escape(zone.playlistTypdbfixe)},
			${sqlstring.escape(zone.order)})`;

            db.all(sql, (err, rows) => {
                if('#fetchAndSaveZones', err) {
					console.log(err);
                    reject(new Error('SERVER PROBLEM'));
                } else {
                    contents.forEach(async (content) => {
                        await savePlaylistData(zone.playlistId, content, sequence++);
                    })
                    resolve(rows);
                }
            });
        });
    })
}

// Save Host Info
const saveHostInfo = async (data, timezone) => {
	console.log('#saveHostInfo', data, timezone);

	// Set Timezone
	if (os.platform() == 'linux' && timezone.name) {
		await setTimezone(timezone.name);
		const saved_timezone = await checkTimezone();
		console.log('Timezone has been set', timezone.name, saved_timezone);
	}
	
	// Set Timezone
	return new Promise((resolve, reject) => {

		let sql = `INSERT INTO host_info (host_id, business_name, timezone, operation_hours) VALUES 
		(${sqlstring.escape(data.hostId)}, 
		${sqlstring.escape(data.name)}, 
		${sqlstring.escape(timezone.name)}, 
		${sqlstring.escape(data.storeHours)})`;

		db.all(sql, (err, rows) => {
			if (err) {
				console.log('#saveHostInfo', err);
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

// Save Playlist Data
const savePlaylistData = (zone_playlist_id, content, sequence) => {
    return new Promise((resolve, reject) => {
		let content_sql = `INSERT INTO playlist_contents (playlist_id, content_id, file_name, url, file_type, handler_id, sequence, is_fullscreen, duration, title) VALUES 
		(${sqlstring.escape(zone_playlist_id)}, 
		${sqlstring.escape(content.contentId)}, 
		${sqlstring.escape(content.fileName)}, 
		${sqlstring.escape(content.url)}, 
		${sqlstring.escape(content.fileType)}, 
		${sqlstring.escape(content.handlerId)}, 
		${sqlstring.escape(sequence)}, 
		${sqlstring.escape(content.isFullScreen)}, 
		${sqlstring.escape(content.duration)},
		${sqlstring.escape(content.title)});`;

        db.all(content_sql, (err, rows) => {
            if (err) {
                console.log(err);
                reject(new Error('SERVER PROBLEM'));
            } else {
                resolve(rows);
            }
        });
    })
}

// Set Timezone based on saved Host Timezone Data
const setTimezone = (timezone) => {
	return new Promise((resolve, reject) => {
        exec(`sudo timedatectl set-timezone ${timezone}`, (err, stdout, stderr) => {
            if (err) {
				console.log('#setTimezone', err)
				reject(err)
			}
			
            resolve();
        });
    })
}

// Check if Timezone has been set
const checkTimezone = () => {
	return new Promise((resolve, reject) => {
        exec(`date`, (err, stdout, stderr) => {
            if (err) {
				console.log('#checkTimezone', err)
				reject(err)
			}
			
            resolve(stdout);
        });
    })
}

const getHostInfo = () => {
	return new Promise((resolve, reject) => {
		let sql = `SELECT * FROM host_info`;
		db.all(sql, async (err, rows) => {
			if (err) {
				// console.log('#getHostInfo_Error', err);
				await dbfix.restartPlayer();
				reject(err);
			}

			if (rows) {
				// console.log('#getHostInfo', rows)
				resolve(rows[0]);
			} else {
				getHostInfo();
			}
		})
	})
}

module.exports = {
	router: router,
	getHostInfo: getHostInfo
};