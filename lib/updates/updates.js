const db_updates = require('../../api/system-updates/db-update');

const runUpdates = async () => {
	try {
		await checkHostInfoTable();
		await templateTableUpdate();
		await checkPlaylistContentsTable();
		await checkFeedTitleColumn();
		await checkPlaylistContentsFeedTitleColumn();
		return true;
	} catch(err) {
		console.log('#runUpdates', err);
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

const checkFeedTitleColumn = async () => {
	try {
		const check_content_feed_title_column = await db_updates.checkFeedTitleColumn();

		if (check_content_feed_title_column.length == 0) {
			console.log('#Content_FeedTitle - Column Added'); 
			return await db_updates.addFeedTitleColumn();
		}
		
	} catch(err) {
		console.log('DB UPDATE ERROR', err)
	}
}

const checkPlaylistContentsFeedTitleColumn = async () => {
	try {
		const check_content_feed_title_column = await db_updates.checkPlaylistContentFeedTitleColumn();

		if (check_content_feed_title_column.length == 0) {
			console.log('#PlaylistContent_FeedTitle - Column Added'); 
			return await db_updates.addPlaylistContentFeedTitleColumn();
		}
		
	} catch(err) {
		console.log('DB UPDATE ERROR', err)
	}
}

module.exports = {
	runUpdates: runUpdates
}