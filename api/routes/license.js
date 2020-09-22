const express = require('express');
const db = require('../db/db_conf');
const body = require('body-parser');
const async = require("async");
const router = express.Router();
const fs = require('fs');
const sqlstring = require('sqlstring-sqlite');

router.post('/save-license', async (req, res) => {
    try {
        let socket_server = req.app.get('socket_server');
        console.log('LICENSE', req.body.license_id, req.body.license_key);
        await clearLicenseDb();
		const saved_license = await saveLicense(req.body.license_id, req.body.license_key, socket_server);
        await createConfig(saved_license);
        db.close();
        res.send(true);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error });
    }
})

router.get('/get-license', async (req, res) => {
    try {
        const license_key = await getLicense();
        db.close();
        console.log(license_key);
        res.json(license_key);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error });
    }
})

const clearLicenseDb = () => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM license;`;
        db.all(sql, (err, rows) => {
            if (err) {
                reject();
            } else {
                resolve(rows);
            }
        })
    })
}

const saveLicense = (id, key, socket_server) => {
    return new Promise((resolve, reject) => {
		let sql = `INSERT INTO license (license_id, license_key) VALUES (${sqlstring.escape(id)}, ${sqlstring.escape(key)})`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err);
                reject(new Error('SERVER PROBLEM'));
            } else {
				socket_server.emit('PS_pi_license_saved', id);
				const saved_license = {
					id: id,
					key: key
				}
                resolve(saved_license);
            }
        })
    })
}

const getLicense = (data) => {
    return new Promise((resolve, reject) => {
		let sql = `SELECT * FROM license`;
		if (db) {
			db.all(sql, (err, rows) => {
				if (err) {
					console.log(err);
					reject(new Error('SERVER PROBLEM'));
				} else {
					resolve(rows);
				}
			})
		}
    })
}


const createConfig = (data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile('../config.json', JSON.stringify(data), (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	})
}

module.exports = {
	router: router,
	getLicense: getLicense,
	saveLicense: saveLicense
};