
import HttpError from '../model/http-error.js';
import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    console.log('🔐 Running checkAuth middleware');

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new HttpError('Authentication failed!', 401);
        }

        const token = authHeader.split(' ')[1];
        console.log('🔑 Token:', token);

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_TOKENKEY);
        console.log('✅ Decoded Token:', decodedToken);

        req.userData = { userId: decodedToken.userId };
        next();
    } catch (err) {
        console.error('❌ Auth error:', err.message);
        return next(new HttpError(err.message || 'Authentication failed!', 401));
    }
};

export default checkAuth;
