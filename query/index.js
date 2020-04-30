'use strict';

/**
  * @module index.js  
  * @author John Butler
  * @description query
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
// parses json in the body of the req.
app.use(bodyParser.json());
app.use(cors());

// example
/* 
{
  'j123': {
    id: 'j123',
    title: 'post title',
    comments: [
      {id: 'k456', content: 'comment', status: 'pending' || 'rejected' || 'approved'}
    ]
  }
}
*/
const posts = {};

const handleEvent = (type, data) => {
	if (type === 'PostCreated') {
		const { id, title } = data;
		posts[id] = { id, title, comments: [] };
	}

	if (type === 'CommentCreated') {
		const { id, content, postId, status } = data;

		const post = posts[postId];
		post.comments.push({ id, content, status });
	}

	if (type === 'CommentUpdated') {
		const { id, content, postId, status } = data;

		const post = posts[postId];
		const comment = post.comments.find(comment => {
			return comment.id === id;
		});
		comment.status = status;
		comment.content = content;
	}
};

app.get('/posts', (req, res) => {
	res.send(posts);
});

app.post('/events', (req, res) => {
	const { type, data } = req.body;

	handleEvent(type, data);

	res.send({});
});

app.listen(4002, async () => {
	console.log('Listening for queries on port 4002');

	const res = await axios.get('http://localhost:4005/events');

	for (let event of res.data) {
		console.log(`processing event: ${event.type}`);
		handleEvent(event.type, event.data);
	}
});
