"use strict";
const db = require('../db/db_conf');

// Template Update as of 08/09/2020
const checkTemplateTable = () => {
	return new Promise((resolve, reject) => {
		let sql = `PRAGMA table_info(template_zones)`;
		db.all(sql, (err, rows) => {
			if(err) {
				reject(err);
			} else {
				
				// Column Search
				let col_exist = rows.filter(
					i => {
						return i.name == 'zone_order'
					}
				)
				
				resolve(col_exist);
			}
		})
	})
}

// Check if Playlist Contents Table has Duration Column
const checkPlaylistContentTable = () => {
	return new Promise((resolve, reject) => {
		let sql = `PRAGMA table_info(playlist_contents)`;
		db.all(sql, (err, rows) => {
			if(err) {
				reject(err);
			} else {
				
				// Column Search
				let col_exist = rows.filter(
					i => {
						return i.name == 'duration'
					}
				)
				
				resolve(col_exist);
			}
		})
	})
}

// Check if Contents Table has Title Column
const checkFeedTitleColumn = () => {
	return new Promise((resolve, reject) => {
		let sql = `PRAGMA table_info(contents)`;
		db.all(sql, (err, rows) => {
			if(err) {
				reject(err);
			} else {
				
				// Column Search
				let col_exist = rows.filter(
					i => {
						return i.name == 'title'
					}
				)
				
				resolve(col_exist);
			}
		})
	})
}

// Check if Playlist Contents Table has Duration Column
const checkPlaylistContentFeedTitleColumn = () => {
	return new Promise((resolve, reject) => {
		let sql = `PRAGMA table_info(playlist_contents)`;
		db.all(sql, (err, rows) => {
			if(err) {
				reject(err);
			} else {
				
				// Column Search
				let col_exist = rows.filter(
					i => {
						return i.name == 'title'
					}
				)
				
				resolve(col_exist);
			}
		})
	})
}

// Check if Host Table Exists
const checkHostInfoTable = () => {
	return new Promise((resolve, reject) => {
		let sql = `PRAGMA table_info(host_info)`;
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

// Create Host Table 
const createHostTable = () => {
	return new Promise((resolve, reject) => {
		let sql = `CREATE TABLE host_info (host_id TEXT, business_name TEXT, timezone TEXT, operation_hours TEXT)`;
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		})
	})
}

// Add Order Column in Template Table
const addOrderColumnTable = () => {
	return new Promise((resolve, reject) => {
		let sql = `ALTER TABLE template_zones ADD COLUMN 'zone_order' INTEGER`
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(true)
			}
		})
	})
}

// Add Duration Column in Playlist Contents Table
const addDurationColumn = () => {
	return new Promise((resolve, reject) => {
		let sql = `ALTER TABLE playlist_contents ADD COLUMN 'duration' INTEGER`
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(true)
			}
		})
	})
}

const addFeedTitleColumn = () => {
	return new Promise((resolve, reject) => {
		let sql = `ALTER TABLE contents ADD COLUMN 'title' TEXT`
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(true)
			}
		})
	})
}

const addPlaylistContentFeedTitleColumn = () => {
	return new Promise((resolve, reject) => {
		let sql = `ALTER TABLE playlist_contents ADD COLUMN 'title' TEXT`
		db.all(sql, (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(true)
			}
		})
	})
}

module.exports = {
	checkTemplateTable: checkTemplateTable,
	addOrderColumnTable: addOrderColumnTable,
	checkHostInfoTable: checkHostInfoTable,
	createHostTable: createHostTable,
	checkPlaylistContentTable: checkPlaylistContentTable,
	checkFeedTitleColumn: checkFeedTitleColumn,
	addDurationColumn: addDurationColumn,
	addFeedTitleColumn: addFeedTitleColumn,
	addPlaylistContentFeedTitleColumn: addPlaylistContentFeedTitleColumn,
	checkPlaylistContentFeedTitleColumn: checkPlaylistContentFeedTitleColumn
}