# Spare Part Recognition - A Simple Integration between SAP Business One / ByDesign and SAP Leonardo

![avatar](https://jam4.sapjam.com/profile/vQ2WGFrz1l1cmyPIZX6G8c/documents/exUx6J98mB0A3RqbVkE0W1/thumbnail?max_x=1200&max_y=1200)

This is a sample integration of SAP Business One or SAP Business ByDesign with SAP Leonardo. It uses SAP Leonardo APIs to extract the features vectors of a given input product image and then find out the smiliar items.

## Overview

- It is coded in [NodeJS](https://nodejs.org/en/)
- Can be deployed anywhere and I suggest to do it in the  [SAP Cloud Platform](https://cloudplatform.sap.com).  
- It is integrated with [SAP Business One](https://www.sap.com/uk/products/business-one.html) using the [Service Layer](https://www.youtube.com/watch?v=zaF_i7x9-s0&list=PLMdHXbewhZ2QsgYSICRQuoL8lkoEHjNzS&index=22) or [SAP Business ByDesign](https://www.sap.com/products/business-bydesign.html) using the [OData API](https://blogs.sap.com/2015/03/10/odata-for-sap-business-bydesign-analytics/).
- It consumes the [SAP Leonardo APIs](https://api.sap.com/package/SAPLeonardoMLFunctionalServices?section=Artifacts) available in the SAP API Business Hub.

## Installation in the Cloud

Clone this repository

```sh
$ git clone https://github.com/CyranoChen/spare-parts-recognition-scp
```

Give a name to your app on the [manifest.yml](manifest.yml)

Then set the global variables configuration in [manifest]
It also requires a [SAP Leonardo API Key](https://api.sap.com/api/sap_service_ticketing_classification_api/overview) which you can retrive **AFTER** login into the API Hub and clicking on GET API KEY.

```sh
LEON_APIKEY: <-- YOUR OWN LEONARDO API KEY-->
LEON_IMAGEFEATUREEXTRACTION_APIURL: https://sandbox.api.sap.com/ml/imagefeatureextraction/feature-extraction
LEON_SIMILARITYSCORING_APIURL: https://sandbox.api.sap.com/ml/similarityscoring/similarity-scoring
```

This project depends on an instance of B1 HANA environment and set the adminstrator account for accessing the service layer.

```sh
B1_SERVICELAYER_APIURL: https://<B1 hostname>:50000/b1s/v1 
B1_USERNAME: <username> 
B1_PASSWORD: <password>
B1_COMPANYDB: <companydb>
```

This project also integrate with an instance of ByDesign and set the adminstrator account for accessing the odata api of product data.

The odata api [configuration profile](vmumaterial.xml) should be imported by custom odata services.

```sh
BYD_TENANT_HOSTNAME: https://<ByDesign Tenant>/sap/byd/odata/cust/v1 
BYD_USERNAME: <username> 
BYD_PASSWORD: <password>
```

From the root directory, using the [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) push your app to the SAP CP Cloud Foundry

```sh
$ cf push
or
$ cf push --random-route
–random-route will avoid name collisions with others that deploy this same app on SCP. You can also choose your own app name by changing the manifest.yml file.
```

Access the app from the URL route shown in the terminal

## Demo app

There is a sample implementation [running here](https://spare-parts-recognition.cfapps.eu10.hana.ondemand.com/). Be advised that the B1 System Backend is not running 24/7

## License

This code snippet is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.