function authenticate(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	auth.verify(token, auth_key, function(err, decoded) {
		if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
		
		// res.status(200).send(decoded);
		next();
	});
}

module.exports = authenticate;