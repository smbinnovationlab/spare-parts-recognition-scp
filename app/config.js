module.exports = {
    getConfigs: function () {
        return {
            "GENERAL": {
                "THRESHOLD_SIMILAR": Number(process.env.GENERAL_THRESHOLD_SIMILAR || 0.65),
                "THRESHOLD_NUM_SIMILAR": Number(process.env.GENERAL_THRESHOLD_NUM_SIMILAR || 3)
            },
            "LEONARDO": {
                "APIKEY": process.env.LEON_APIKEY || "jGMB8R9KPK2MhNv7Tc9vTVGQ1mu7KLB0",
                "IMAGEFEATUREEXTRACTION_APIURL": process.env.LEON_IMAGEFEATUREEXTRACTION_APIURL || "https://sandbox.api.sap.com/ml/imagefeatureextraction/feature-extraction",
                "SIMILARITYSCORING_APIURL": process.env.LEON_SIMILARITYSCORING_APIURL || "https://sandbox.api.sap.com/ml/similarityscoring/similarity-scoring"
            },
            "BUSINESSONE": {
                "SERVICELAYER_APIURL": process.env.B1_SERVICELAYER_APIURL || "https://52.59.87.94:50000/b1s/v1",
                "USERNAME": process.env.B1_USERNAME || "manager",
                "PASSWORD": process.env.B1_PASSWORD || "manager",
                "COMPANYDB": process.env.SBODEMOGB || "SBODEMOGB"
            }
        };
    }
};