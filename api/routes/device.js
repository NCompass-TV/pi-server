const si = require('systeminformation');
const express = require('express');
const router = express.Router();

router.get('', async (req, res) => {
    try {
        let memory = await getMemory();
        let internettype = await getInternet_iface();
        let macaddress = await getInternet();
        let internetspeed = await getLatency();
        let storage = await getStorage();
    
        return res.json({
            memory,
            internettype,
            macaddress,
            storage,
            internetspeed
        });
    } catch(error) {
        console.log(error);
        res.json(error);
    }
})

const getMemory = () => {
    return new Promise((resolve, reject) => {
        si.mem()
        .then(data => {
            resolve(`${Math.round(data.total/1073741824)} GB`);
        })
        .catch(error => {
            reject();
        });
    })
}

const getInternet = () => {
    return new Promise((resolve, reject) => {
        si.networkInterfaces()
        .then(data => {
            resolve(data[0].mac);
        })
        .catch(error => {
            reject();
        });
    })
}

const getInternet_iface = () => {
    return new Promise((resolve, reject) => {
        si.networkStats()
        .then(data => {
            resolve(data[0].iface);
        })
        .catch(error => {
            reject();
        });
    })
}

const getLatency = () => {
    return new Promise((resolve, reject) => {
        si.inetLatency('8.8.8.8')
        .then(data => {
            let status = (data <= 100 && data != -1) ? 'Good' : 'Bad';
            resolve(status);
        })
        .catch(error => {
            reject();
        });
    })
}

const getStorage = () => {
    return new Promise((resolve, reject) => {
        si.fsSize()
        .then(data => {
            resolve({total: `${Math.round(data[0].size/1073741824)} GB`, used: `${Math.round(data[0].use)}`});
        })
        .catch(error => {
            reject();
        });
    })
}

module.exports = {
	router: router,
	iface: getInternet_iface,
	internet: getInternet
}
