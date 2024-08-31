const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) {
            throw new Error('No authorization header provided');
        }

        const token = authorizationHeader.split(' ')[1];

        if (!token) {
            throw new Error('Token not provided');
        }

        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = { userId };
        next();
    } catch(error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ error: error.message });
    }
};
