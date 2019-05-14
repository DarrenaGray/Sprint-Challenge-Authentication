const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { authenticate } = require('../auth/authenticate');

const Users = require('./models');

module.exports = server => {
	server.post('/api/register', register);
	server.post('/api/login', login);
	server.get('/api/users', users);
	server.get('/api/jokes', authenticate, getJokes);
};

function genToken(user) {
	const payload = {
		subject: user.id,
		username: user.username
	};
	const secret = process.env.JWT_SECRET;
	const options = {
		expiresIn: '1hr'
	};
	return jwt.sign(payload, secret, options);
}

function users(req, res) {
	Users.find()
		.then(users => {
			if (users.length !== 0) {
				res.status(200).json(users);
			} else {
				res.status(404).json({ message: 'There are no users here.' });
			}
		})
		.catch(err => {
			res.status(500).json({
				err,
				message: 'There was a problem retrieving the users.'
			});
		});
}

function register(req, res) {
	// implement user registration
	let user = req.body;
	const hash = bcrypt.hashSync(user.password, 10);
	user.password = hash;
	const token = genToken(user);
	Users.add(user)
		.then(regUser => {
			res.status(201).json({
				regUser,
				message: 'The user was registered successfully!',
				token
			});
		})
		.catch(err => {
			res.status(500).json({
				err,
				message: 'There was a problem registering the user.'
			});
		});
}

function login(req, res) {
	// implement user login
	let { username, password } = req.body;
	Users.findBy({ username })
		.then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {
				const token = genToken(user);
				res
					.status(200)
					.json({ message: `Welcome, ${user.username}`, token });
			} else {
				res.status(401).json({ message: 'Invalid Credentials.' });
			}
		})
		.catch(err => {
			res
				.status(500)
				.json({ err, message: 'There was a problem logging in.' });
		});
}

function getJokes(req, res) {
	const requestOptions = {
		headers: { accept: 'application/json' }
	};

	axios
		.get('https://icanhazdadjoke.com/search', requestOptions)
		.then(response => {
			res.status(200).json(response.data.results);
		})
		.catch(err => {
			res
				.status(500)
				.json({ message: 'Error Fetching Jokes', error: err });
		});
}
