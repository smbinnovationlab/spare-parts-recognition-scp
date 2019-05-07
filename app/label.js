const fs = require('fs');
const req = require('request');

const b1service = require('./b1-sl');
const bydservice = require('./byd-api');
const leon = require('./leonardo');

module.exports = {
    syncDatasetsB1,
    syncDatasetsByd,
    getLabels,
    initialLabels
}

// sync the dataset of product items from b1 hana instances
async function syncDatasetsB1() {
    var result = await b1service.itemList();

    if (result && result.hasOwnProperty('value') && result.value.length > 0) {
        console.log('b1 itemList length:', result.value.length);

        const productItems = b1service.processDataset(result);
        fs.writeFile('./app/label/datasets-b1.json', JSON.stringify(productItems), 'utf-8', function (err) {
            if (err) { next(err); }
        });

        return productItems;
    }

    return [];
}

// sync the dataset of product items from bydesign
async function syncDatasetsByd() {
    var result = await bydservice.itemList();
    console.log(typeof result);
    console.log(result && result.hasOwnProperty('d') && result.d.hasOwnProperty('results') && result.d.results.length > 0);

    if (result && result.hasOwnProperty('d') && result.d.hasOwnProperty('results') && result.d.results.length > 0) {
        console.log('byd itemList length:', result.d.results.length);

        const productItems = bydservice.processDataset(result);
        fs.writeFile('./app/label/datasets-byd.json', JSON.stringify(productItems), 'utf-8', function (err) {
            if (err) { next(err); }
        });

        return productItems;
    }

    return [];
}

var _itemLabels;
function getLabels(key) {
    if (!_itemLabels) {
        _itemLabels = JSON.parse(fs.readFileSync('./app/label/labels.json'));
    }

    if (key) {
        return _itemLabels.hasOwnProperty(key) ? _itemLabels[key] : null;
    } else {
        return _itemLabels;
    }
}

// initial the labels.json by b1 product items dataset
async function initialLabels(dataset = 'all') {
    _itemLabels = {};
    if ((dataset == 'all' || dataset == 'b1') && fs.existsSync('./app/label/datasets-b1.json')) {
        const ds = JSON.parse(fs.readFileSync('./app/label/datasets-b1.json'));

        if (ds && ds.length > 0) {
            let count = 0;
            for (let item of ds) {
                if (item.Picture && item.Picture != '') {
                    let result = await leon.featureExtraction(item.ItemCode + '.jpg', filepath = './app/label/pictures/');
                    if (result && result.hasOwnProperty('predictions') && result.predictions[0].hasOwnProperty('featureVectors')) {
                        _itemLabels[item.ItemCode] = {
                            "name": item.ItemName,
                            "price": `${item.ItemPrices[0].Currency} ${item.ItemPrices[0].Price}`,
                            "quantity": item.QuantityOnStock,
                            "featureVectors": result.predictions[0].featureVectors,
                            "application": "b1"
                        };
                        count += 1;
                    } else {
                        console.log('err on feature extraction', item.ItemCode)
                    }
                }
            }
            console.log('b1 item labels:', count);
        }
    }

    if ((dataset == 'all' || dataset == 'byd') && fs.existsSync('./app/label/datasets-byd.json')) {
        const ds = JSON.parse(fs.readFileSync('./app/label/datasets-byd.json'));

        if (ds && ds.length > 0) {
            let count = 0;
            for (let item of ds) {
                if (item.MaterialAttachmentFolder && item.MaterialAttachmentFolder.length > 0) {
                    let result = await leon.featureExtraction(item.InternalID + '.jpg', filepath = './app/label/pictures/');
                    if (result && result.hasOwnProperty('predictions') && result.predictions[0].hasOwnProperty('featureVectors')) {
                        _itemLabels[item.InternalID] = {
                            "name": item.Description,
                            "price": '',
                            "quantity": item.MaterialQuantityConversion.length > 0 ? int(item.MaterialQuantityConversion[0].Quantity) : '',
                            "featureVectors": result.predictions[0].featureVectors,
                            "application": "byd"
                        };
                        count += 1;
                    } else {
                        console.log('err on feature extraction', item.ItemCode)
                    }
                }
            }
            console.log('byd item labels:', count);
        }
    }

    console.log('total _itemLabels keys:', Object.keys(_itemLabels).length);

    fs.writeFile('./app/label/labels.json', JSON.stringify(_itemLabels), 'utf-8', function (err) {
        if (err) { next(err); }
    });


    return _itemLabels;
}

