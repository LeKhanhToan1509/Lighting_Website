import { redisClient } from '../dbs/redisdb.js';

export const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }

            const originalJson = res.json;
            res.json = function (data) {
                redisClient.setEx(key, duration, JSON.stringify(data));
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

export const clearCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}; 