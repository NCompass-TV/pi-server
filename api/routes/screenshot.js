const db = require('../db/db_conf');
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const sc_path = './public/screenshots';
const form_data = require('form-data');
const axios = require("axios");
const screenshot_url = `${process.env.NCOMPASS_API}/pi/upload?licenseid=`;

launchScreenshot = async (socket_server) => {
    console.log('LAUNCHED!!!')
    try {	
        await deleteScreenshots();
        const license = await getLicense();
        await screenShot();
        await uploadScreenShot(license.license_id);
        socket_server.emit('PS_screenshot_uploaded', license);
    } catch(error) {
        console.log('ERROR GETTING SCREENSHOT', error);
        socket_server.emit('PS_screenshot_failed', await getLicense());
    }
}

scheduleScreenshot = async (socket_server) => {
    try {
        await deleteScreenshots();
        const license = await getLicense();
        await screenShot();
        await uploadScreenShot(license.license_id);
        socket_server.emit('PS_screenshot_uploaded', license);
    } catch(error) {
        console.log('ERROR GETTING SCREENSHOT', error);
        socket_server.emit('PS_screenshot_failed', await getLicense());
    }
}

const deleteScreenshots = () => {
console.log('DELETING')
    return new Promise((resolve, reject) => {
        fs.readdir(sc_path, (err, files) => {
            if (err) {
                reject(err);   
                throw err;
            }
            for (const file of files) {
              fs.unlink(path.join(sc_path, file), err => {
                reject(err);
                if (err) throw err;
              });
            }
        });
        resolve('Old Screenshots Deleted');
    })
}

const screenShot = () => {
	console.log('SCREENSHOT')
    return new Promise((resolve, reject) => {
        exec(`scrot -u -q 10 ${sc_path}/%Y_%m_%d--%H_%M_%S.png`, (err, stdout, stderr) => {
            if (err) {
              reject(err)
            }
            resolve('New Screenshot Created');
        });
    })
}

const uploadScreenShot = (license) => {
	console.log('SUBMITTING')
    return new Promise((resolve, reject) => {
        fs.readdir(sc_path, (err, files) => {
            if(err) {
                reject();
            } else {
                console.log(license);
                const form = new form_data();
                form.append('file', fs.createReadStream(`${sc_path}/${files[0]}`));

                axios({
                    method: "post",
                    url: `${screenshot_url}${license}`,
                    data: form,
                    headers: { ...form.getHeaders() }
                }).then(res => {
                    resolve(res.data)
                })
            }
        });
    })
}

const getLicense = (data) => {
    console.log('GETTING LICENSE')
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM license`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.log(err);
                reject(new Error('SERVER PROBLEM'));
            } else {
                resolve(rows[0]);
            }
        })
    })
}


exports.launchScreenshot = launchScreenshot;
exports.scheduleScreenshot = scheduleScreenshot;
