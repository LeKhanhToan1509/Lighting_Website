import orderService from '../services/order.service.js';
import paymentService from '../services/payment.service.js';
import redisClient from '../dbs/redisdb.js';

export default class orderController {
    static createOrder = async (req, res) => {
        try {
            const user_id = req.user._id;
            const orderData = req.body;
            console.log(orderData);
    
            let payment = null;
            if (orderData.paymentMethod === 'TRANSFER') {
                const transactionData = {
                    user_id,
                    amount: orderData.totalPrice,
                };
    
                payment = await paymentService.createTransaction(transactionData);
                console.log(payment);
                if (!payment) {
                    throw new Error("Create transaction failed");
                }
    
                const redis_key = `transaction:${payment._id}`;
                await redisClient.set(redis_key, payment.hex_key);
            }
    
            const payload = {
                user_id,
                ...orderData,
                payment_id: payment ? payment._id : null
            };
    
            const newOrder = await orderService.createOrder(payload);
    
            if (!newOrder) {
                throw new Error('Create order failed');
            }
    
            res.status(200).json({
                message: 'Create order successfully',
                order: newOrder
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Create order failed'
            });
        }
    };

    static async getOrderById(req, res) {
        try {
            const userId = req.user._id;
            const orderId = req.params.id;
            const order = await orderService.getOrdersById({
                userId,
                orderId
            });
            res.status(200).json({
                message: 'Get order successfully',
                order
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Get order failed'
            });
        }
    };

    static async deleteOrder(req, res) {
        try {
            const userId = req.user._id;
            const orderId = req.params.id;
            console.log(userId, orderId);
            await orderService.deleteOrder({
                userId,
                orderId
            });
            res.status(200).json({
                message: 'Delete order successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Delete order failed'
            });
        }
    }

    static async updateOrder(req, res) {
        try {
            const userId = req.user._id;
            console.log(req.user);
            const orderId = req.params.id;
            const order = req.body;
            const payload = { userId, orderId, ...order };
            await orderService.updateOrder(payload);
            res.status(200).json({
                message: 'Update order successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Update order failed'
            });
        }
    }

    static async getOrdersByUserId(req, res) {
        try {
            const userId = req.user._id;
            const orders = await orderService.getOrdersByUserId(userId);
            res.status(200).json({
                message: 'Get orders successfully',
                orders
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Get orders failed'
            });
        }
    }

    static getAllOrders = async (req, res) => {
        try {
            console.log(req.query);
            const userId = req.user._id;
            const { page, limit } = req.query; 
            const orders = await orderService.getAllOrders({userId, page, limit});
            res.status(200).json({
                message: 'Get all orders successfully',
                orders
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Get all orders failed'
            });
        }
    }
}
