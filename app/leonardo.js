const req = require('request');
const fs = require('fs');

const config = require('./config');

module.exports = {
    featureExtraction,
    similarityScoring
};

const _configs = config.getConfigs();

const headers = {
    'APIKey': _configs.LEONARDO.APIKEY,
    'Accept': 'application/json'
    // 'content-type' : 'multipart/form-data'
};

function featureExtraction(filename, filepath = './app/sample/') {
    console.log(filepath + filename);
    return new Promise((resolve, reject) => {
        req.post(_configs.LEONARDO.IMAGEFEATUREEXTRACTION_APIURL, {
            formData: {
                files: fs.createReadStream(filepath + filename)
            },
            json: true,
            headers: headers
        }, (err, res, body) => {
            if (err) { reject(err); }
            resolve(body);
        });
    });
}

function similarityScoring(vectors, numSimilarVectors = 1) {
    return new Promise((resolve, reject) => {
        req.post(_configs.LEONARDO.SIMILARITYSCORING_APIURL, {
            formData: {
                texts: JSON.stringify(vectors),
                options: JSON.stringify({ "numSimilarVectors": numSimilarVectors })
            },
            json: true,
            headers: headers
        }, (err, res, body) => {
            if (err) { reject(err); }
            resolve(body);
        });
    });
}

