const pi_license = require('../../api/routes/license');
const anydesk = require('../../api/routes/anydesk');
const fs = require('fs');

// This is intended for a git reset --hard update (worst case scenario)
// Means everything on this directory has been overwritten
// making the saved license disappear.
// If the config.json holds the deleted license,
// this method will re-save the license to proceed with the 
// content update and player display instead of 
// re-entering the license again.

const runStartUpCheck = async (io, socket) => {
	try {
		await checkSavedLicense(io, socket);
		await saveAnydesk();
		return true;
	} catch (err) {
		console.log('#runStartUpCheck', err);
		return false;
	}
}

const saveAnydesk = async () => {
	try {
		const license = await pi_license.getLicense();
		if (license[0] && license[0].license_id) {
			
			const anydesk_info = {
				license_id: license[0].license_id,
				anydesk: await anydesk.getAnydeskId(),
				password: await anydesk.setAnydeskPass(license[0].license_id)
			}

			const save_anydesk = anydesk.saveAnydesk(anydesk_info);
			console.log('#saveAnydesk', save_anydesk);
		}
	} catch(err) {
		console.log('Failed ANYDESK_EVENT:', err)
	}
}

const checkSavedLicense = async (io, socket) => {
	try {
		const license = await pi_license.getLicense();
	
		if (license.length > 0) {
			console.log('Saved License: ', license[0])
			return true;
		} else {
			console.log('No License Saved from Database, Checking Config');
			const config = await readConfig();

			if (config) {
				console.log('Config License: ',config);
				const c = JSON.parse(config);
				const save = await pi_license.saveLicense(c.id, c.key, socket);
				io.sockets.emit('PI_has_license');
				console.log('License Saved from Backup', save);
			} else {
				console.log('Config has no data either, please enter the license manually.');
			}
		}
	} catch (err) {
		throw new Error(err);
	}
}

const readConfig = () => {
	return new Promise((resolve, reject) => {
		fs.readFile('../config.json', {encoding:'utf8', flag:'r'}, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data);
			}
		})
	})
}

module.exports = {
	runStartUpCheck: runStartUpCheck
}