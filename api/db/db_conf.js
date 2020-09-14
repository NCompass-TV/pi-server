const sqlite3 = require('sqlite3').verbose();
const db_file = 'api/db/_data.db';

// Establish connection on sqlite database.
const db = new sqlite3.Database(db_file, (err) => {
    if (err) {
        console.log(`An Error Occured: ${err.message}`);
    }
    console.log('Connected to data.sqlite');
})

module.exports = db;