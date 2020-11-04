const exec = require('child_process').exec;
const launch_screenshot = require('../../api/routes/screenshot');
const pi_license = require('../../api/routes/license');
const player_data = require('../../api/routes/player-data');
const moment = require('moment-timezone');
const screenshot_interval = 30 * 60 * 1000;
let timer;
let counter = 0;

const runTasks = async (io, socket_server) => {
	try {
		scheduledScreenshot(socket_server);
		timerReset(io);
		socketTimer(io);
		return true;
	} catch(err) {
		console.log(err);
	}
}

// Scheduled Screenshot
const scheduledScreenshot = async (socket_server) => {
	try {
		if (await pi_license.getLicense()) {
			launch_screenshot.scheduleScreenshot(socket_server);
		} else {
			console.log('SCHEDULED SCREENSHOT: No License Detected, Aborting.');
		}
	} catch(err) {
		console.log('FAILED SCHEDULED SCREENSHOT:')
	}

	setTimeout(() => {
		scheduledScreenshot(socket_server);
	}, screenshot_interval);
}

// Timer Reset on Update
const timerReset = async (io) => {
	try {
		const on_off = await scheduleOnOff();
		// Just making sure that this function is not
		// running twice because of socket inconsistency.
		clearTimeout(timer);

		if (on_off == 1) {
			io.emit('PS_operation_open')
		} else if (on_off == 0) {
			io.emit('PS_operation_closed')
		} else {
			io.emit('PS_operation_closed')
		}
		
		timer = setTimeout(async () => {
			await timerReset(io);
		}, 1000)
	} catch (err) {
		console.log('#timerReset:', err)
	}
}

// Pi Player Connection
const socketTimer = (io) => {
	io.on('connection', (socket) => {
		console.log('Timer is ready for socket events');

		socket.on('PP_launch_update', () => {
			console.log('PLAYER UPDATE LAUNCH, STOPPING TIMER');
			clearTimeout(timer);
		})

		socket.on('PP_update_finish', () => {
			clearTimeout(timer);
			console.log('UPDATE FINISHED, RESETTING TIMER');
			counter = 0;
			timerReset(io);
		})
	})
}

const restartAndUpdate = () => {
	return new Promise((resolve, reject) => {
        exec(`./home/pi/n-compasstv/pi-server/shell/remote-udpate.sh`, (err, stdout, stderr) => {
            if (err) {
				console.log(err)
				reject(err)
			}
			
            resolve("Restart and Update");
        });
    })
}

// On Off Schedule Feature
const scheduleOnOff = async () => {
	try {
		let init_host_info = await player_data.getHostInfo();

		if (init_host_info) {

			let current_time = moment.tz(init_host_info.timezone).format("HH:mm:ss");

			if (current_time === "12:55:00") {
				restartAndUpdate();
			} else {
				let init_timezone = init_host_info.timezone;
				let init_operation_hours = JSON.parse(init_host_info.operation_hours);
				let time_comparison_result = compareDateTime(init_timezone, init_operation_hours);
				
				return time_comparison_result;
			}
		}
	} catch(err) {
		console.log('#scheduleOnOff', err);
	}
}

// Date Comparison for Checking the On Off Schedule
const compareDateTime = (timezone, operation_hours) => {
	return new Promise((resolve, reject) => {
		let current_day = moment.tz(timezone).format("dddd");
		let current_date_time = moment.tz(timezone).format("DD/MM/YYYY, h:mm:ss A");
		let date_split = current_date_time.split(', ');
		let current_operation_hours = operation_hours.filter(i => i.day === current_day)[0];
		let status;
	
		// If the current_operation_hours.status is true, means the
		// host is open for business else close.
		if (current_operation_hours.status) {
			for (i of current_operation_hours.periods) {

				// If there are no operation periods, but the current_operation_hours.status
				// is true, means the the schedule is 24 hrs.
				if (i) {
					const opening_hour = moment(`${date_split[0]}, ${i.open}`, 'DD/MM/YYYY, h:mm:ss A');
					const closing_hour = moment(i.close, 'h:mm:ss A') > moment(i.open, 'h:mm:ss A')
										 ? moment(`${date_split[0]}, ${i.close}`, 'DD/MM/YYYY, h:mm:ss A')
										 : moment(`${date_split[0]}, ${i.close}`, 'DD/MM/YYYY, h:mm:ss A').add(1, 'd');
		
					const now = moment(current_date_time, 'DD/MM/YYYY, h:mm:ss A');
		
					if (now >= opening_hour && now < closing_hour) {
						// Store is open for the day
						status = 1;
						break;
					} else {
						// Store is close for the day
						status = 0;
						continue;
					}
				} else {
					// Store is open 24 hours
					status = 1;
				}
			}
		} else {
			// Business is close
			status = 0;
		}

		resolve(status);
	})
}

module.exports = {
	runTasks: runTasks
}