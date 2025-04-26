import jwt from 'jsonwebtoken';
import { redisClient } from '../dbs/redisdb.js';
import RedisKeys from '../utils/redisKeys.js';

class AuthenMiddleware {
    static async verifyToken(req, res, next) {
        try {
            const token = req.headers.token?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
            req.account = decoded;
            req.user = decoded;

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    static async verifyRefreshToken(req, res, next) {
        try {
            // const token = req.body.refreshToken;
            // if (!token) {
            //     return res.status(401).json({ message: 'Refresh token is required' });
            // }

            // const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
            // req.account = decoded;

            // const redisRefreshKey = RedisKeys.userKey.refreshToken(decoded._id);
            // const storedToken = await redisClient.get(redisRefreshKey);
            
            // if (!storedToken || storedToken !== token) {
            //     return res.status(401).json({ message: 'Invalid refresh token' });
            // }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Refresh token expired' });
            }
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
    }

    static checkRole(roles = []) {
        return (req, res, next) => {
            if (!req.account) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!roles.includes(req.account.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            next();
        };
    }
}

export { AuthenMiddleware };
export default AuthenMiddleware;
