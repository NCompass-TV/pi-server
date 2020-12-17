// This is the socket communication between 
// Pi Server and Socket Server
// SS means Socket Server
const pi_license = require('../../api/routes/license');
const remote_update = require('../../api/routes/remote-update');
const launch_screenshot = require('../../api/routes/screenshot');
const anydesk = require('../../api/routes/anydesk');
const player_data = require('../../api/routes/player-data');
const dbfix = require('../../api/routes/dbfix');
const db = require('../../api/db/db_conf');

module.exports = (client, local) => {

	// Connection to Socket Server Success
	client.on('connect', async () => {
		console.log('Connected to Socket Server');
		try {
			const license = await pi_license.getLicense();
			const init_host_info = await player_data.getHostInfo();
			
			console.log('#socketClient_connect', license, init_host_info);

			if (license[0]) {
				console.log(license[0]);

				const pi_info = {
					licenseId: license[0].license_id,
					timeZone: init_host_info ? init_host_info.timezone : null
				}
				
				client.emit('PS_pi_is_online', pi_info);
			}

		} catch(err) {
			console.log('#socketClient_connect', err);
			console.log('Getting Database Backup');
			await dbfix.getBackupDatabase();
			console.log('Restarting Player');
			await dbfix.restartPlayer();
		}
	})

	// Remote Update All
	client.on('SS_reboot_all', async () => {
		try {
			console.log('Initiating Remote Reboot All');
			remote_update.initiatePiRestart();
		} catch(err) {
			console.log('SS_remote_update', err)
		}
	})

		// Remote Update All
		client.on('SS_remote_update', async () => {
			try {
				console.log('Initiating Remote Update');
				remote_update.initiateRemoteUpdate();
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
				remote_update.initiateRemoteUpdate();
			}
		} catch (err) {
			console.log('SS_remote_update', err);
		}
	})

	// Remote Update By License ID
	client.on('SS_pi_restart', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('Restarting Pi');
				remote_update.initiatePiRestart(client);
			}
		} catch (err) {
			console.log('SS_pi_restart', err);
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
			if (license[0] && data == license[0].license_id) {
				
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
	
	// Refetch Content, Redownload all player data.
	client.on('SS_launch_refetch', async data => {
		try {
			const license = await pi_license.getLicense();
			if (data == license[0].license_id) {
				console.log('SS_launch_refetch', data);
				local.sockets.emit('LSS_launch_refetch', data);
			}
		} catch(err) {
			console.log(err)
		}
	})
}
