const req = require('request');
const fs = require('fs');

const config = require('./config');

module.exports = {
    itemList,
    itemImage,
    processDataset,
};

const _configs = config.getConfigs();

var _token;
var _tokenTimeout;
function getToken() {
    return new Promise((resolve, reject) => {
        req.get(_configs.BYDESIGN.TENANT_HOSTNAME + '/vmumaterial/$metadata', {
            headers:
            {
                'cache-control': 'no-cache',
                'Authorization': 'Basic ' + new Buffer(_configs.BYDESIGN.USERNAME + ':' + _configs.BYDESIGN.PASSWORD).toString('base64'),
                'x-csrf-token': 'fetch'
            },
            rejectUnauthorized: false
        }, (err, res, body) => {
            if (err) { reject(err); }
            if (res && res.headers.hasOwnProperty('x-csrf-token')) {
                // x-csrf-token=LkJovn22gAJpAjVW2ZFpqw==
                _token = res.headers['x-csrf-token'];
                _tokenTimeout = Date.now();
                console.log(_token, _tokenTimeout);
                resolve(_token);
            } else {
                resolve(null);
            }
        });
    });
}

async function itemList() {
    // only for write 
    // if (!_token || (Date.now() - _tokenTimeout) > 10 * 60 * 1000) {// 10 mins timeout
    //     const token = await getToken();
    //     if (!token) { return null; }
    // }

    return new Promise((resolve, reject) => {
        req.get(_configs.BYDESIGN.TENANT_HOSTNAME + '/vmumaterial/MaterialCollection', {
            qs:
            {
                '$expand': 'MaterialQuantityConversion,MaterialAttachmentFolder',
                '$format': 'json'
            },
            headers:
            {
                'cache-control': 'no-cache',
                'Authorization': 'Basic ' + new Buffer(_configs.BYDESIGN.USERNAME + ':' + _configs.BYDESIGN.PASSWORD).toString('base64'),
                'x-csrf-token': 'fetch'
            },
            json: true,
            rejectUnauthorized: false
        }, (err, res, body) => {
            if (err) { reject(err); }
            if (res && res.headers.hasOwnProperty('x-csrf-token')) {
                // x-csrf-token=LkJovn22gAJpAjVW2ZFpqw==
                _token = res.headers['x-csrf-token'];
                _tokenTimeout = Date.now();
                console.log(_token, _tokenTimeout);
                resolve(body);
            } else {
                resolve(null);
            }
        });
    });
}

function itemImage(itemId, itemImage) {
    fs.writeFile(`./app/label/pictures/${itemId}.jpg`, itemImage.Binary, 'base64', function (err) {
        if (err) {
            next(err);
            res.sendStatus(415);
            return;
        }
    });
}

function processDataset(raw) {
    if (raw && raw.hasOwnProperty('d') && raw.d.hasOwnProperty('results') && raw.d.results.length > 0) {
        if (!fs.existsSync('./app/label/pictures')) {
            fs.mkdirSync('./app/label/pictures');
        }

        for (let item of raw.d.results) {
            if (item.MaterialAttachmentFolder && item.MaterialAttachmentFolder.length > 0) {
                itemImage(item.InternalID, item.MaterialAttachmentFolder[0]);
            }
        }
    }
    return raw.d.results;
}
