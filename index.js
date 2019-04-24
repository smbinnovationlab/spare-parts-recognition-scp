const express = require("express");
const bodyParser = require("body-parser");

const fs = require('fs');
const http = require('http');
const https = require('https');

const config = require('./app/config');
const label = require('./app/label');
const recognize = require('./app/recognize');
const b1service = require('./app/b1-sl');

// ssl cert
// const credentials = {
//     key: fs.readFileSync('./cert/private.pem', 'utf8'),
//     cert: fs.readFileSync('./cert/client.crt', 'utf8')
// };

// initial config
const _configs = config.getConfigs();
const app = express();
app.use(bodyParser.json({ limit: '20mb' }));

// static files
app.use('/', express.static('./public'));
app.use('/labels', express.static('./public/labels.html'));
app.use('/favicon', express.static('./favicon.ico'));
// app.use('/dist', express.static('./dist'));
// app.use('/node_modules', express.static('./node_modules'));

// photo library file path
app.use('/library', express.static('./app/label/pictures'))
//app.use('/spr_img', express.static('../server/label/b1_items'));

app.post('/api/recognize', async function (req, res, next) {
    console.log('[recognize]', new Date().toISOString());
    if (!req.body || !req.body.hasOwnProperty('filename') || !req.body.hasOwnProperty('image')) {
        res.sendStatus(400);
    }

    var filename = req.body.filename;
    console.log('input:', req.body.filename);

    let base64Data = req.body.image.replace(/^data:image\/png;base64,/, '').replace(/^data:image\/jpeg;base64,/, '');
    // let contentType = req.body.image.substring(0, req.body.image.indexOf(';base64,'));
    // let blob = utils.b64toBlob(base64Data, contentType);

    if (!fs.existsSync('./app/sample')) {
        fs.mkdirSync('./app/sample');
    }

    fs.writeFileSync('./app/sample/' + filename, base64Data, 'base64', function (err) {
        if (err) {
            next(err);
            res.sendStatus(415);
            return;
        }
    });

    var result = await recognize.search(filename);
    console.log('similarity scoring:', result);

    if (result && result.hasOwnProperty('predictions') && result.predictions.length > 0 &&
        result.predictions[0].hasOwnProperty('id') && (result.predictions[0].id == filename) &&
        result.predictions[0].hasOwnProperty('similarVectors') && result.predictions[0].similarVectors.length > 0) {
        var condinates = [];

        for (let item of result.predictions[0].similarVectors) {
            if (item.score > _configs.GENERAL.THRESHOLD_SIMILAR) {
                condinates.push(item);
            }
        }

        if (condinates.length > 0) {
            res.send({ "state": "success", "filename": filename, "data": recognize.export(condinates), "raw": result.predictions[0].similarVectors });
            console.log(condinates);
            console.log('-'.repeat(100));
            return;
        } else {
            res.send({ "state": "success", "filename": filename, "data": [], "raw": result.predictions[0].similarVectors });
            console.log('no condinates');
            console.log('-'.repeat(100));
            return;
        }
    }

    res.send({ "state": "success", "filename": filename, "data": [] });
    console.log('exception on smilarity scoring');
    console.log('-'.repeat(100));
});

app.post('/api/sync', async function (req, res, next) {
    console.log('[syncDatasets]', new Date().toISOString());
    var result = await label.syncDatasets();
    res.send(result);
    console.log('-'.repeat(100));
});

app.post('/api/train', async function (req, res, next) {
    console.log('[initialLabels]', new Date().toISOString());
    var result = await label.initialLabels();
    res.send(result);
    console.log('-'.repeat(100));
});

// http / https server
var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

const PORT = 8080;
// const SSLPORT = 9080;

httpServer.listen(PORT, () => {
    console.log('HTTP Server is running on port %s', PORT);
    console.log('-'.repeat(100));
});

// httpsServer.listen(SSLPORT, () => {
//     console.log('HTTPS Server is running on port %s', SSLPORT);
//     console.log('-'.repeat(100));
// });

