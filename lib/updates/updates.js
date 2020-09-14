const db_updates = require('../../api/system-updates/db-update');

const runUpdates = async () => {
	try {
		await templateTableUpdate();
		await checkHostInfoTable();
		await checkPlaylistContentsTable();
		return true;
	} catch(err) {
		console.log('#runUpdates', err);
	}
}

const templateTableUpdate = async () => {
	try {
		const check_db_column = await db_updates.checkTemplateTable();
		if (check_db_column.length == 0) {
			console.log('#TemplateZonesTable - Table Updated');
			return await db_updates.addOrderColumnTable();
		}
	} catch (error) {	
		console.log('DB UPDATE ERROR', error);
	}
}

const checkPlaylistContentsTable = async () => {
	try {
		const check_db_column = await db_updates.checkPlaylistContentTable();
		if (check_db_column.length == 0) {
			console.log('#PlaylistContentsTable - Table Updated');
			return await db_updates.addDurationColumn();
		}
	} catch (error) {	
		console.log('DB UPDATE ERROR', error);
	}
}

const checkHostInfoTable = async () => {
	try {
		const check_host_info_table = await db_updates.checkHostInfoTable();

		if (check_host_info_table.length == 0) {
			console.log('#HostInfoTable - Table Created'); 
			return await db_updates.createHostTable();
		}
		
	} catch(err) {
		console.log('DB UPDATE ERROR', err)
	}
}

module.exports = {
	runUpdates: runUpdates
}