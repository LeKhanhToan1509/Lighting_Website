import { createClient } from 'redis';
import redisDbConfig from '../configs/redisDb.config.js';

const redisClient = createClient({
    url: `redis://${redisDbConfig.db.host}:${redisDbConfig.db.port}`,
});

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
});

await redisClient.connect();

export default redisClient;
