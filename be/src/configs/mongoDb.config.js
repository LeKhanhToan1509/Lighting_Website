
const dev = {
    app: {
        port: process.env.DEV_PORT || 3000
    },
    db: {
        host: process.env.DEV_DB_HOST || "localhost",
        port: process.env.DEV_DB_PORT || 27017,
        name: process.env.DEV_DB_NAME || "dev"
    }
}

const prod = {
    app: {
        port: process.env.PROD_PORT || 3000
    },
    db: {
        host: process.env.PROD_DB_HOST || "mongodb",
        port: process.env.PROD_DB_PORT || 27017,
        name: process.env.PROD_DB_NAME || "prod"
    }
}

const config = {
    dev,
    prod
};

const nodeEnv = process.env.NODE_ENV || "dev";
export default config[nodeEnv];