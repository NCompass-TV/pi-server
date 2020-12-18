// This is the socket communication between 
// the Pi Server and Pi Player
// PP means Pi Player (ANGULAR)
// PS means Pi Server (THIS)
const pi_license = require('../../api/routes/license');
const pi_startup = require('../tasks/startup');
const content_logs = require('../../api/routes/play-count');

module.exports = (io, socket_server) => {

	io.on('connection', (socket) => {

		console.log('Connection Established', socket.id, socket.handshake.query.connecting_as);

		// If ever there's a delay with the license checking on startup
		// This here will re-run the startup task if the
		// Angular player succesfully connected to the Pi Server Socket
		pi_startup.runStartUpCheck(io, socket_server);

		let electron_socket;

		if (socket.handshake.query.connecting_as === 'electron') {
			electron_socket = socket.id;
			console.log('Electron Socket:', electron_socket);
		}

		// Sending Logs over Socket
		socket.on('PP_logs', async(data) => {
			content_logs.sendLogsOverSocket(data);
		})

		socket.on('PP_electron_is_running', async data => {
			try {
				const license = await pi_license.getLicense();
				socket_server.emit('PS_electron_is_running', license[0].license_id);
			} catch(err) {
				console.log(err);
			}
		})

		socket.on('PP_update_finish', async data => {
			try {
				console.log('Update Finish');
				const license = await pi_license.getLicense();
				socket_server.emit('PS_update_finish', license[0].license_id);
			} catch(err) {
				console.log(err);
			}
		})

		socket.on('disconnect', async () => {
			try {
				if (socket.id == electron_socket) {
					const license = await pi_license.getLicense();
					console.log('ELECTRON HAS STOPPED RUNNING', socket.id, electron_socket);
					socket_server.emit('PS_electron_is_not_running', license[0].license_id);
				}
			} catch(err) {
				console.log(err);
			}
		})
	})
}