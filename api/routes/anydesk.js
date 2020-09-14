const exec = require('child_process').exec;

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

exports.getAnydeskId = getAnydeskId;
exports.setAnydeskPass = setAnydeskPass;