'use strict';

/**
  * @module index.js  
  * @author John Butler
  * @description comments service
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

// {id: post_id, comments:
// [{id: commentId, content: blah blah blah}, {id: commentId, content: blah blah blah}]}
const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
	res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
	const commentId = randomBytes(4).toString('hex');
	const postId = req.params.id;
	const { content } = req.body;
	// if a comment for this post id has already been
	// saved then grab it from the datastore
	const comments = commentsByPostId[postId] || [];
	comments.push({ id: commentId, content, status: 'pending' });
	// update the datastore
	commentsByPostId[postId] = comments;

	await axios.post('http://event-bus-srv:4005/events', {
		type: 'CommentCreated',
		data: {
			id: commentId,
			content,
			postId,
			status: 'pending'
		}
	});
	res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
	console.log(`Received event: ${req.body.type}`);

	const { type, data } = req.body;

	// coming from the moderation server
	if (type === 'CommentModerated') {
		const { id, postId, status, content } = data;

		const comments = commentsByPostId[postId];

		const comment = comments.find(comment => {
			return comment.id === id;
		});
		comment.status = status;

		await axios.post('http://event-bus-srv:4005/events', {
			type: 'CommentUpdated',
			data: {
				id,
				status,
				postId,
				content
			}
		});
	}

	res.send({});
});

app.listen(4001, () => {
	console.log('Listening for comments on port 4001 with ernest.');
});
