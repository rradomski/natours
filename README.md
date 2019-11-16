# natours

This is my course Node Express app using MongoDB. 
It is website that shows tours around the city. 
For now it is only API to access tours form database but in future there is going to be full client app.

## run

Before running the app. Look at `config.env` to provide some configuration data.

To run app use `node server.js` or using nodemon `nodemon start`.  
It requires MongoDB service on port 27017 and created database named `natours`.

## dev data

This project contains dev data for testing.  
To import data use `node dev-data/data/import-dev-data.js --import`.  
To delete data use `node dev-data/data/import-dev-data.js --delete`.  
