
import express from 'express';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
import orderController from '../../controllers/order.controller.js';

const orderRoutes = express.Router();

orderRoutes.use(AuthenMiddleware.verifyToken);
orderRoutes.post('/create', orderController.createOrder);
orderRoutes.post('/update/:id', orderController.updateOrder);
orderRoutes.post('/delete/:id', orderController.deleteOrder);
orderRoutes.get('/id/:id', orderController.getOrderById);
orderRoutes.get('/user/:userId', orderController.getOrdersByUserId);
orderRoutes.get('/all', orderController.getAllOrders);

export default orderRoutes;