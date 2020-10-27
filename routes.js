var express = require('express');
const routes = express.Router();


var apiController = require('./controller');

routes.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to GMAIL API endpoint made in Nodejs' });
  });



routes.get('/auth', apiController.generateAuthCodeURL);

routes.get('/auth-success', apiController.completeAuth);

routes.get('/send', apiController.sendMail);

routes.get('/send-success', apiController.sendSuccess);

module.exports = routes;