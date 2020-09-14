// This is the socket communication between 
// Pi Server and Socket Server
// SS means Socket Server
const pi_license = require('../../api/routes/license');
const remote_update = require('../../api/routes/remote-update');
const launch_screenshot = require('../../api/routes/screenshot');
const anydesk = require('../../api/routes/anydesk');

module.exports = (client, local) => {

	// Connection to Socket Server Success
	client.on('connect', async () => {
		console.log('Connected to Socket Server');
		try {
			const license = await pi_license.getLicense();
			if (license[0]) {
				client.emit('PS_pi_is_online', license[0].license_id);
			}
		} catch(err) {
			console.log(err);
		}
	})

	// Remote Update All
	client.on('SS_remote_update', async () => {
		try {
			console.log('Initiating Remote Update');
			remote_update.initiateRemoteUpdate(client);
		} catch(err) {
			console.log('SS_remote_update', err)
		}
	})

	// Remote Update By License ID
	client.on('SS_remote_update_by_license', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('Initiating Remote Update');
				remote_update.initiateRemoteUpdate(client);
			}
		} catch (err) {
			console.log('SS_remote_update', err);
		}
	})

	// Electron Status Check
	client.on('SS_is_electron_running', async data => {
		console.log('ELECTRON IS RUNNING');
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('ELECTRON IS RUNNING')
				local.sockets.emit('LSS_is_electron_running');
			}
		} catch(err) {
			console.log('Failed ELECTRON_STATUS:', err)
		}
	
	})

	// Get Anydesk ID and Set Anydesk ID
	client.on('SS_anydesk_id', async (data) => {
		console.log('SS_anydesk_id', data);
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				
				const anydesk_info = {
					license_id: license[0].license_id,
					anydesk: await anydesk.getAnydeskId(),
					password: await anydesk.setAnydeskPass(license[0].license_id)
				}

				client.emit('PS_anydesk_id', anydesk_info);
			}
		} catch(err) {
			console.log('Failed ANYDESK_EVENT:', err)
		}
	})

	// Angular Player Update Content
	client.on('SS_launch_update', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('SS_LAUNCH_UPDATE', data);
				local.sockets.emit('LSS_launch_update');
			}
		} catch(err) {
			console.log('Failed UPDATE:', err)
		}
	})

	// SCROT (Screenshot) Trigger
	client.on('SS_launch_screenshot', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('SS_launch_screenshot', data);
				launch_screenshot.launchScreenshot(client);
			}
		} catch(err) {
			console.log('Failed SCREENSHOT Handshake:', err)
		}
	})

	// Reset Pi, Delete all Pi data.
	client.on('SS_launch_reset', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('SS_launch_reset', data);
				local.sockets.emit('LSS_launch_reset', data);
			}
		} catch(err) {
			console.log(err)
		}
	})
}