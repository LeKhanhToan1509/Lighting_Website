
const dev = {
    app: {
        port: process.env.DEV_REDIS_PORT || 6379
    },
    db: {
        host: process.env.DEV_REDIS_HOST || "localhost",
        port: process.env.DEV_REDIS_PORT || 6379,
        name: process.env.DEV_REDIS_NAME || "dev"
    }
}

const prod = {
    app: {
        port: process.env.PROD_PORT || 6379
    },
    db: {
        host: process.env.PROD_REDIS_HOST || "redis",
        port: process.env.PROD_REDIS_PORT || 6379,
        name: process.env.PROD_REDIS_NAME || "prod"
    }
}

const config = {
    dev,
    prod
};

const nodeEnv = process.env.NODE_ENV || "dev";
export default config[nodeEnv];