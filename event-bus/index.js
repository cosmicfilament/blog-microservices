'use strict';

/**
  * @module index.js  
  * @author John Butler
  * @description events
*/

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
// parses json in the body of the req.
app.use(bodyParser.json());
app.use(cors());

const events = [];

app.post('/events', (req, res) => {
	const event = req.body;
	events.push(event);

	axios.post('http://localhost:4000/events', event);
	axios.post('http://localhost:4001/events', event);
	axios.post('http://localhost:4002/events', event);
	axios.post('http://localhost:4003/events', event);

	res.send({ status: 'ok' });
});

app.get('/events', async (req, res) => {
	res.send(events);
});

app.listen(4005, () => {
	console.log('Listening for events on port 4005');
});
