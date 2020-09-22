const express = require('express');
const router = express.Router();
const db = require('../db/db_conf');

router.get('', async (req, res) => {
    try {
        res.json(await getTemplate());
    } catch(error) {
        console.log(error);
        res.status(500).send('#getContent - Something went wrong');
    }
})

const getTemplate = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM template_zones`;
        db.all(sql, (err, rows) => {
            if(err) {
                console.log(err);
                reject();
            } else {
                // console.log('#getTemplate', rows);
                resolve(rows);
            }
        })
    })
}

module.exports = router;