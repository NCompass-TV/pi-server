const express = require('express');
const fs = require('fs');
const router = express.Router();
const async = require("async");
const download = require('download-file');
const db = require('../db/db_conf');
const path = require('path');
const path_uri = './public/assets';
const exec = require('child_process').exec;
const shelljs = require('shelljs');
const scrape = require('website-scraper');
let feed_list = [];
let download_counter = 0;

router.get('', async (req, res) => {
    try {
		let io = req.app.get('io');
        let content = await getContent();
        await downloadContent(content, io);
        res.json({message: "Playlist Contents Downloaded Successfully"});
    } catch(error) {
        console.log('Error in /content', error);
    }
})

router.get('/cleardb', async(req, res) => {
    try {
        let contentTbl = await clearContentTbl();
        let playlistContentTbl = await clearPlaylistContentTbl();
		let templateZonesTbl = await clearTemplateZonesTbl();
		let hostInfoTbl = await clearHostInfoTbl();
		let contentLogs = await clearContentPlayLogsTbl();
		console.log('Database Cleared\n', 
		`Content Table: ${contentTbl}\n`, 
		`Content Play Logs: ${contentLogs}\n`, 
		`Playlist Content Table: ${playlistContentTbl}\n`, 
		`Template Zones Table: ${templateZonesTbl}\n`, 
		`Host Info Table${hostInfoTbl}\n`);
        res.json('Database Cleared');
    } catch(error) {
        console.log('#r_cleardb', error);
        res.status(500).send(`#ClearDB Route Error: ${error}`);
        await getBackupDatabase();
        await restartPlayer();
    }
})

router.get('/reset', async(req, res) => {
    try {
        let contentTbl = await clearContentTbl();
        let licenseTbl = await clearLicenseTbl();
        let playlistContentTbl = await clearPlaylistContentTbl();
		let templateZonesTbl = await clearTemplateZonesTbl();
		let hostInfoTbl = await clearHostInfoTbl();
		let contentLogs = await clearContentPlayLogsTbl();
		let config = await deleteConfigFile();
        await clearDir();
        console.log('Database Cleared', contentTbl, licenseTbl, playlistContentTbl, templateZonesTbl, hostInfoTbl, contentLogs, config);
        res.json('Pi Reset Successfully');
    } catch (error) {
        console.log('#r_reset',error);
        res.status(500).send(`#Reset Route Error: ${error}`);
        await getBackupDatabase();
        await restartPlayer();
    }
})

router.get('/refetch', async(req, res) => {
    try {
        let contentTbl = await clearContentTbl();
        let playlistContentTbl = await clearPlaylistContentTbl();
		let templateZonesTbl = await clearTemplateZonesTbl();
		let hostInfoTbl = await clearHostInfoTbl();
		let contentLogs = await clearContentPlayLogsTbl();
        await clearDir();
        console.log('Database Cleared', contentTbl, playlistContentTbl, templateZonesTbl, hostInfoTbl, contentLogs);
        res.json('Pi Data Refetched Successfully');
    } catch (error) {
        console.log(error);
        res.status(500).send('#refetch - Something went wrong');
        await getBackupDatabase();
        await restartPlayer();
    }
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

const clearContentTbl = () => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM contents;`;
        db.all(sql, (err, rows) => {
            if(err) {
                console.log('#clearContentTbl', err)
                reject(err);
            } else {
                resolve(rows); 
            }
        })
    })
}

const clearLicenseTbl = () => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM license;`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log('#clearLicenseTbl', err)
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const clearPlaylistContentTbl = () => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM playlist_contents;`
        db.all(sql, (err, rows) => {
            if(err) {
                console.log('#clearPlaylistContentTbl', err)
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const clearTemplateZonesTbl = () => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM template_zones`;
        db.all(sql, (err, rows) => {
            if(err) {
                console.log('#clearTemplateZonesTbl', err);
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

const clearContentPlayLogsTbl = () => {
	return new Promise((resolve, reject) => {
		let sql = `DELETE FROM content_play_log`
		db.all(sql, (err, rows) => {
			if (err) {
                console.log('#clearContentPlayLogsTbl', err)
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

const clearHostInfoTbl = () => {
	return new Promise((resolve, reject) => {
		let sql = `DELETE FROM host_info`
		db.all(sql, (err, rows) => {
			if (err) {
                console.log('#clearHostInfoTbl', err);
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

const clearDir = () => {
	return new Promise((resolve, reject) => {
      	// fs.readdir(path_uri, (err, files) => {
        //     if (err) {
        //         console.log('#clearDir', err);
        //         reject(err);
        //     }

        //     let file_total = files.length;
        //     let file_deleted = 0; 

        //     for (const file of files) {
        //         file_deleted++;
        //         fs.unlinkSync(path.join(path_uri, file))

        //         if (file_deleted == file_total) {
        //             console.log('All Assets Deleted');
        //             resolve();
        //         }
        //     }
		// });
		
		// Temporary Fix for Content and Directory Deletion inside Public Folder
		shelljs.exec(`sudo rm -rf ${path_uri}/*`, (err, stdout, stderr) => {
			if (err) {
				console.log(err)
				reject(err)
			}
			
			resolve();
		});
	})
}

// Get Content 
const getContent = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM contents`;
        db.all(sql, (err, rows) => {
            if(err) {
                reject();
            } else {
                resolve(rows);
            }
        })
    })
}

const downloadContent = (content, io) => {
    download_counter = 0;
    feed_list = [];
    io.emit('content_to_download', content.length);
    return new Promise ((resolve, reject) => {
        content.forEach(element => {

            // 1. Check if content filetype is feed.
            if (element.file_type !== 'feed') {
                fs.access(`${path_uri}/${element.file_name}`, fs.F_OK, (err) => {
                    if(err) {
                        // 2. If file does not exist, download the file, Set Option for download method.
                        let options = {
                            directory: path_uri,
                            filename: element.file_name
                        }
                        
                        // 3. Run download method with the options set above.
                        download(element.url, options, (err) => {
                            if(err) {
                                // Incase of errors.
                                console.log(err)
                            }
    
                            download_counter++;
                            // console.log('File Downloaded', element.file_name);
                            io.emit('downloaded_content', download_counter);
                        })
                    } else {
                        download_counter += 1;
                        io.emit('downloaded_content', download_counter);
                        if(download_counter == content.length) {
                            resolve();
                        }
                    }
                })
            } else {
                fs.access(`${path_uri}/${element.content_id}`, fs.F_OK, async (err) => {
                    const options = {
                        urls: [element.url],
                        directory: `${path_uri}/${element.content_id}/`
                    };

                    if(err) {
                        await downloadFeed(options)
                        download_counter++;
                        io.emit('downloaded_content', download_counter);
                        if(download_counter == content.length) {
                            resolve();
                        }
                    } else {
                        await deleteFeedDir(`${path_uri}/${element.content_id}`)
                        await downloadFeed(options)
                        download_counter++;
                        io.emit('downloaded_content', download_counter);
                        if(download_counter == content.length) {
                            resolve();
                        }
                    }
                })
            }
        })
    })
}

deleteFeedDir = (dir) => {
    return new Promise((resolve, reject) => {
        fs.rmdir(dir, { recursive: true }, (err) => {
            if (err) {
                console.log(err)
                reject();
            }
        
            console.log(`${dir} is deleted!`)
            resolve();
        });
    })
}

const downloadFeed = (options) => {
    return new Promise((resolve, reject) => {

        scrape(options, (error, result) => {
            if (error) {
                console.log('#downloadFeedError', error)
                reject(error);
            }

            resolve(result.saved)
        });
    })
}

// Delete Config File from Root Dir
const deleteConfigFile = () => {
	return new Promise((resolve, reject) => {
		const path = '../config.json';
		fs.unlink(path, (err) => {
			if (err) {
				console.log('#deleteConfigFile', err)
				resolve(false);
			} else {
				resolve(true);
			}
		})
	})
}

module.exports = router