'use strict';

/**
  * @module 
  * @author John Butler
  * @description posts
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const { randomBytes } = require('crypto');

const app = express();
// parses json in the body of the req.
app.use(bodyParser.json());
app.use(cors());

// {"postId": {id: "id", title: "title"}}
const posts = {};

app.get('/posts', (req, res) => {
	res.send(posts);
});
app.post('/posts', async (req, res) => {
	const id = randomBytes(4).toString('hex');
	const { title } = req.body;
	posts[id] = { id, title };

	await axios.post('http://event-bus-srv:4005/events', {
		type: 'PostCreated',
		data: {
			id,
			title
		}
	});
	res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
	console.log(`Received event: ${req.body.type}`);
	res.send({});
});

app.listen(4000, () => {
	console.log('Version jpbutler2000 Dudes');
	console.log('Listening for posts on port 4000');
});
