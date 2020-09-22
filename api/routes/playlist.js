const express = require('express');
const router = express.Router();
const db = require('../db/db_conf');

router.get('/:id', async (req, res) => {
    try {
        res.json(await getPlaylistSequence(req.params));
        db.close();
    } catch(error) {
        console.log(error);
        res.status(500).send('#getPlaylistSequence - Something went wrong');
    }
});

router.get('/type/:id', async(req, res) => {
    try {   
        res.json(await getPlaylistType(req.params));
        db.close();
    } catch(error) {
        console.log(error);
        res.status(500).send('#getPlaylistType - Something went wrong.');
    }
});

const getPlaylistSequence = data => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM playlist_contents WHERE playlist_id='${data.id}'`;
        db.all(sql, (err, rows) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(rows);
            }
        })
    })
}

const getPlaylistType = data => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM playlists WHERE playlist_id=${data.id}`;
        db.all(sql, (err, rows) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                resolve(rows);
            }
        })
    })
}

module.exports = router;