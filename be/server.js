import app from './app.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

let isShutdownInitiated = false;

const Shutdown = () => {
    if (isShutdownInitiated) return; 
    isShutdownInitiated = true;

    mongoose.connection.close()
        .then(() => {
            console.log('Disconnected from MongoDB');
            server.close(() => {
                console.log('Server closed');
            });
        })
        .catch((err) => {
            console.log('Error disconnecting from MongoDB:', err);
        });
};

process.on('SIGINT', Shutdown);