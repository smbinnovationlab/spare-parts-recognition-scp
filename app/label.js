const fs = require('fs');
const req = require('request');

const b1service = require('./b1-sl');
const leon = require('./leonardo');

module.exports = {
    syncDatasets,
    getLabels,
    initialLabels
}

// sync the dataset of product items from b1 hana instances
async function syncDatasets() {
    var result = await b1service.itemList();

    if (result && result.hasOwnProperty('value') && result.value.length > 0) {
        console.log('itemList length:', result.value.length);

        const productItems = b1service.processDataset(result);
        fs.writeFile('./app/label/datasets.json', JSON.stringify(productItems), 'utf-8', function (err) {
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
async function initialLabels() {
    const ds = JSON.parse(fs.readFileSync('./app/label/datasets.json'));

    if (ds && ds.length > 0) {
        _itemLabels = {};
        for (let item of ds) {
            if (item.Picture && item.Picture != '') {
                let result = await leon.featureExtraction(item.ItemCode + '.jpg', filepath = './app/label/pictures/');
                if (result && result.hasOwnProperty('predictions') && result.predictions[0].hasOwnProperty('featureVectors')) {
                    _itemLabels[item.ItemCode] = {
                        "name": item.ItemName,
                        "price": `${item.ItemPrices[0].Currency} ${item.ItemPrices[0].Price}`,
                        "quantity": item.QuantityOnStock,
                        "featureVectors": result.predictions[0].featureVectors
                    };
                } else {
                    console.log('err on feature extraction', item.ItemCode)
                }
            }
        }

        console.log('_itemLabels keys:', Object.keys(_itemLabels).length);

        fs.writeFile('./app/label/labels.json', JSON.stringify(_itemLabels), 'utf-8', function (err) {
            if (err) { next(err); }
        });
    }

    return _itemLabels;
}

