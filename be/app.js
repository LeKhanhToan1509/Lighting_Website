import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import MongoDB from './src/dbs/mongodb.js';
import dotenv from 'dotenv';
import routes from './src/routers/index.js';
import cookieParser from 'cookie-parser';
import MBBank from './src/dbs/mbBank.js';

dotenv.config();
const app = express();

// Initialize middleware
app.use(cookieParser());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));


app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        return callback(null, true); 
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(morgan('dev'));
app.use(compression());
app.use(express.json()); 
app.use("/uploads", express.static("uploads"));
// app.use(express.urlencoded(
//     {
//         extended: true
//     }
// ));

MongoDB.getMongoInstance("dev");

app.use('', routes);


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error)
});

app.use((error, req, res) => {
    res.status(error.status || 500);
    res.json({
        error: {
            code: error.status || 500,
            message: error.message
        }
    })
});

console.log(MBBank.getTransactionsHistory());
export default app;
