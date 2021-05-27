const exec = require('child_process').exec;
const axios = require('axios');
const environment = require('../../environment/environment');

const getAnydeskId = () => {
    console.log('GET ANYDESK ID');
    return new Promise((resolve, reject) => {
        exec(`anydesk --get-id`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
			}
			
            resolve(stdout);
        });
    })
}

const setAnydeskPass = (id) => {
	console.log('SET ANYDESK PASSWORD');
    return new Promise((resolve, reject) => {
		const passw = id.substr(id.length - 12);
        exec(`echo ${passw} | sudo anydesk --set-password`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
			}
			
            resolve(passw);
        });
    })
}

const saveAnydesk = (data) => {
    const anydesk_data = {
		licenseId: data.license_id,
		anydeskId: data.anydesk
	}

	axios.post(`${environment.api_base_url}/license/UpdateAnydeskId`, anydesk_data)
    .then(res => {
        console.log('AnydeskID Saved', res.status);
    }).catch(err => {
        console.log('#saveAnydeskToAPI Error Saving AnydeskID', err.response.data, data)
    })
}

exports.getAnydeskId = getAnydeskId;
exports.setAnydeskPass = setAnydeskPass;
exports.saveAnydesk = saveAnydesk;