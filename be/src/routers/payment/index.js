import express from 'express';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
import  paymentController  from '../../controllers/payment.controller.js';
const paymentRoutes = express.Router();

paymentRoutes.use(AuthenMiddleware.verifyToken);
paymentRoutes.post('/ispaid', paymentController.checkTransaction);
paymentRoutes.post('/create', paymentController.createTransaction);
paymentRoutes.post('/delete/:id', paymentController.deleteTransaction);
paymentRoutes.get('/:id', paymentController.getTransactionById);




export default paymentRoutes;