// The Angular App Player and the Electron App Browser
// are connected to this Pi Server's socket
// Everytime the Electron is down, we send email to owner
// that the player is down. The Pi Server is also a client of Socket Server
// that way we can determine if the Pi itself is running.

// Modules
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const body = require('body-parser');
const app = express();

// Modules
const PORT = process.env.PORT;
const content = require('./api/routes/content');
const content_count = require('./api/routes/play-count');
const device_info = require('./api/routes/device');
const pi_license = require('./api/routes/license');
const playlist_seq = require('./api/routes/playlist');
const save_data = require('./api/routes/player-data');
const socket_server_url = process.env.SOCKET_SERVER;
const template = require('./api/routes/template');

// Hotfix for Possible Memory Leak
require('events').EventEmitter.defaultMaxListeners = Infinity;

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Local Socket IO
const io = require('socket.io')(server, {
	origins: ["https://localhost:4200"]
});

// Local Client Socket Connecting to Socket Server
const socket_client = require('socket.io-client');
const to_socket_server = socket_client(socket_server_url);

// Body Parser Middleware
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// CORS Policy
app.use(cors());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Updates and Startup Tasks
const updates = require('./lib/updates/updates');
const startup = require('./lib/tasks/startup');
const tasks = require('./lib/tasks/tasks');

// Startup Updates
const startup_updates = () => {
	return new Promise((resolve, reject) => {
		const update_status = updates.runUpdates()
		resolve(update_status);
	})
}

// Startup Checkup
const startup_checkup = () => {
	new Promise((resolve, reject) => {
		const checkup_status = startup.runStartUpCheck(io, to_socket_server)
		resolve(checkup_status);
	})
}

// Non Stopping Tasks
const startup_tasks = () => {
	new Promise((resolve, reject) => {
		const task_status = tasks.runTasks(io, to_socket_server)
		resolve(task_status);
 	})
}

const on_init = async () => {
	try {
		const c = await startup_checkup();
		const u =  await startup_updates();
		console.log('Startup Update:', u);
		const t = await startup_tasks();
		console.log('Tasks Started:', u);
	} catch(err) {
		console.log('On Init Requirements', err);
	}
}

// Run On Initialization Requirements
on_init();

// Socket Modules
require('./lib/sockets/socket-server')(io, to_socket_server);
require('./lib/sockets/socket-client')(to_socket_server, io);
app.set("io", io);
app.set("socket_server", to_socket_server);

// Routes
app.use('/api/playlist', playlist_seq);
app.use('/api/content', content);
app.use('/api/template', template);
app.use('/api/systeminfo', device_info.router);
app.use('/api/save-data', save_data.router);
app.use('/api/save-content-count', content_count.router);
app.use('/api/license', pi_license.router);
