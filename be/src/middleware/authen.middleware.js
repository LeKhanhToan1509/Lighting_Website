import jwt from 'jsonwebtoken';

export default class AuthenMiddleware {
    static verifyToken = async (req, res, next) => {
        try {
            const token = req.headers.token;
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!token.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Token invalid format' });
            }

            const jwt_token = token.split(' ')[1];
            const decoded = jwt.verify(jwt_token, process.env.JWT_ACCESS_TOKEN || 'secretKey');
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ message: 'Unauthorized' });
        }
    };
}
