const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.get('/api', (req, res) => {
	res.json({
		message: 'Welcome to the API'
	});
});

app.post('/api/posts', verifyToken, (req, res) => { // here: 'verifyToken' is a middleware function that we must write below. the purpose of this is to protect this 'route' (specifically, /api/posts) by requiring a jwt
	jwt.verify(req.token, 'secretkey', (err, authData) => { // here: req.token is the token sent in the header of this request (which is retrieved and set to be the value of this property by the middleware function verifyToken we called above), authData is the user's data (id, username, email)
		if(err) { // there was an error verifying that the token sent in the the header 'req.token' (again, that we retrieved from the header by calling the 'verifyToken' middleware function when this request is made)
			res.sendStatus(403);
		} else { // the token 'req.token' was verified successfully
			res.json({
				message: 'Post created...',
				authData // user data
			});
		}
	});

});

app.post('/api/login', (req, res) => {
	// Mock user
	// normally, you would make a request to this '/login' and be sending your username and password
	// then you would do all of your authentication stuff here with your database, then you would get your user back. We are just going to skip straight to getting the user back part (by making a mock user)
	const user = {
		id: 1,
		username: 'david',
		email: 'davidmwhynot@gmail.com'
	}

	jwt.sign({user: user}, 'secretkey', {expiresIn: '30s'}, (err, token) => { // we can make the token expire by putting in 'options' after the 'secretkey' (see 'options:' in the jsonwebtoken documentation (on github) for more details)
		res.json({
			token: token // es6 style would to just write 'token' (no quotes), same thing applies to 'user' above
		});
	});
});

// verifyToken middleware
function verifyToken(req, res, next) {

	// 'bearer token'
	// FORMAT OF TOKEN
	// Authorization: Bearer <access_token>


	// Get auth header value
	// so, when we send our token, we want to send it as the value for the field 'Authorization' in the 'header' of the 'request' ('req')
	const bearerHeader = req.headers['authorization'];

	// Check if bearerHeader is undefined
	// purpose of this is to verify that the request that was made to any route that requires a token (in other words, calls this 'verifyToken' function as middleware for the route) did not send a token with the request (or didn't format their request properly)
	if(typeof bearerHeader != 'undefined') {
		// split() the bearerHeader at the space (see FORMAT OF TOKEN above)
		const bearerHeaderSplit = bearerHeader.split(' '); // split() returns an array

		// Get the token from the returned array
		const bearerToken = bearerHeaderSplit[1];

		// Set the token
		req.token = bearerToken;

		// Next middleware
		next();
	} else {
		// Forbidden
		res.sendStatus(403);
	}
}

app.listen(5000, () => console.log('Server started on port 5000'));
