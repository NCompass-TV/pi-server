require('dotenv').config();
const express = require('express');
const db = require('../db/db_conf');
const body = require('body-parser');
const async = require("async");
const axios = require('axios');
const router = express.Router();
const sqlstring = require('sqlstring-sqlite');
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({kafkaHost: process.env.KAFKAHOST});
const producer = new Producer(client);
let broker_status_healthy = true;

// On Producer Ready
producer.on('ready', function () {
	console.log('Producer is ready');
	broker_status_healthy = true;
});

// On Producer Error
producer.on('error', function (err) {
    console.log('Producer is in error state');
	broker_status_healthy = false; 
})

router.post('', async(req, res) => {
    try {
		if (broker_status_healthy == true) {
			await sendToBroker(req);
		} else {
			console.log('Saved unsent log to database:', req.body)
			await contentPlayCount(req.body.license_id, req.body.content_id, req.body.timestap);
		}
		play_log_data = req;
        res.json({data_saved: true});
    } catch(error) {
		console.log(error);
    }
})

const sendLogsOverSocket = async (data) => {
    try {
        if (broker_status_healthy == true) {
            await sendToBroker(data);
        } else {
            console.log('Saved unsent log to database:', data)
            await contentPlayCount(data.license_id, data.content_id, data.timestap);
        }

        play_log_data = data;
        return ({data_saved: true});
    } catch(error) {
        console.log(error);
    }
} 

const sendToBroker = async (count) => {
    const payload = [
        { topic: 'contentPlayCount', messages:count, partition: 0 }
    ];

    producer.send(payload, async (err, data) => {
        if (err) {
			console.log('Unable to send data to broker:', err);
			await contentPlayCount(data.license_id, data.content_id, data.timestap);
			console.log('Saved unsent log to database:', data)
		} else {
			console.log('Play log sent to broker:', data);
		}
	});
}

const contentPlayCount = (license_id, content_id, date) => {
    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO content_play_log (license_id, content_id, timestap) VALUES 
		(${sqlstring.escape(license_id)}, 
		${sqlstring.escape(content_id)}, 
		${sqlstring.escape(date)})`;
		
        db.all(sql, (err, rows) => {
            if(err) {
                console.log(err);
                reject(new Error('SERVER PROBLEM'));
            } else {
                resolve();
            }
        })
    })
}

// Beyond this point are unused functions, but will be used in the future.
const getUnsentLogs = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM content_play_log WHERE is_sent IS NULL`;
        db.all(sql, (err, rows) => {
            if (err) {
                reject(new Error('SERVER PROBLEM'))
            } else {
                resolve(rows);
            }
        })
    })
}

const sendContentLogs = async data => {
    try {
        const all_unsent_logs = await getUnsentLogs(); 
        const structured_logs = constructLogs(all_unsent_logs);
        console.log('Structured', structured_logs)
        await sendLogs(structured_logs);
        await deleteSentLogs(all_unsent_logs);
        console.log('Sending Logs:', structured_logs);
    } catch(err) {
        console.log('Error:', err)
    }
}

const constructLogs = data => {
    return (data.map(
        i => {
            return {
                licenseId: i.license_id,
                contentId: i.content_id,
                logDate: i.timestap
            }
        }
    ))
}

const sendLogs = data => {
    if (data.length > 0) {
        return axios.post(`${NCOMPASS_API}/api/ContentPlays/Log`, data)
        .then((res) => {
            console.log('Logs Sent to API Server', res.status);
        }).catch((err) => {
            console.log('Error sending logs to API Server', err.response.status)
        })
    } else {
        console.log('No Data to Send')
    }
}

const logSetToSent = data => {
    return new Promise((resolve, reject) => {
        data.map(
            i => {
                let sql = `UPDATE content_play_log SET is_sent = 1 WHERE id = ${sqlstring.escape(i.id)}`;
                db.all(sql, (err, rows) => {
                    if (err) {
                        console.log(err);
                        reject(new Error('SERVER PROBLEM'))
                    } else {
                        resolve(rows);
                    }
                })
            }
        )
    })
}

const deleteSentLog = id => {
    return new Promise((resolve, reject) => {
		let sql = `DELETE FROM content_play_log WHERE id = ${sqlstring.escape(id)}`;
			db.all(sql, (err, rows) => {
			if (err) {
				reject(new Error('SERVER PROBLEM'));
			} else {
				console.log('Deleted', id)
				resolve(rows);
			}
		})
    })
}

module.exports = {
    router: router,
    sendLogsOverSocket: sendLogsOverSocket,
    sendContentLogs: sendContentLogs
};
