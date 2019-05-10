const axios = require('axios');
const bcrypt = require('bcryptjs');

const { authenticate } = require('../auth/authenticate');

const db = require('../database/dbConfig');

module.exports = server => {
	server.post('/api/register', register);
	server.post('/api/login', login);
	server.get('/api/jokes', authenticate, getJokes);
};

function genToken(user) {
	const payload = {
		subject: user.id,
		username: user.username
	};
	const options = {
		expiresIn: '1hr'
	};
	return jwt.sign(payload, authenticate.jwtKey, options);
}

async function register(req, res) {
	// implement user registration
	let user = req.body;
	const hash = bcrypt.hashSync(user.password, 10);
	user.password = hash;
	await db('users')
		.where([ req.params.id ])
		.first()
		.insert(user)
		.then(user => {
			res.status(200).json({ user });
		})
		.catch(err => {
			console.log(err);
		});
	// return findById(id);
}

function login(req, res) {
	// implement user login
	return db('users')
		.where('users')
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {
				const token = genToken(user);
				res.status(200).json(user, token);
			} else {
				res.status(401).json({ message: 'Invalid Credentials.' });
			}
		})
		.catch(err => {
			console.log(err);
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
