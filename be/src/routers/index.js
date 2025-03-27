import express from 'express';
import accessRoutes from './access/index.js';
import paymentRoutes from './payment/index.js';
import userRoutes from './user/index.js';
import orderRoutes from './order/index.js';
import productRoutes from './product/index.js';

const routes = express.Router();

routes.use('', accessRoutes);
routes.use('/payment', paymentRoutes);
routes.use('/user', userRoutes);
routes.use('/orders', orderRoutes);
routes.use('', productRoutes);

export default routes;