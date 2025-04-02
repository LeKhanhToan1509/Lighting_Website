import Order from '../models/order.model.js';
import Account from '../models/account.model.js';
import PaymentModel from '../models/payment.model.js';
import redisClient from '../dbs/redisdb.js';
import RedisKeys from '../utils/redisKeys.js';

export default class orderService {
    static async createOrder(payload) {
        try {
            const { user_id, ...orderData } = payload;
            const user = await Account.findOne({ _id: user_id }).lean();
            if (!user) throw new Error('User not found');
            
            const newOrder = new Order({
                ...orderData,
                user_id
            });
            
            const savedOrder = await newOrder.save();
            
            // Invalidate user orders cache
            await redisClient.del(RedisKeys.ordersKey.userOrders(user_id));
            // Invalidate all orders cache
            await redisClient.del(RedisKeys.ordersKey.allOrders());
            
            return savedOrder;
        } catch (error) {
            console.error("Error creating order:", error.message);
            throw new Error(error.message);
        }
    }
    
    static async getOrdersById(payload) {
        try {
            const { userId, orderId } = payload;
            
            // Try to get order from Redis first
            const cachedOrder = await redisClient.get(`order:${orderId}`);
            if (cachedOrder) {
                const order = JSON.parse(cachedOrder);
                // Verify user has permission to access this order
                if (order.user_id.toString() !== userId) throw new Error('Unauthorized');
                return order;
            }
            
            const order = await Order.findOne({ _id: orderId }).lean();
            if (!order) throw new Error('Order not found');
            
            if (order.user_id.toString() !== userId) throw new Error('Unauthorized');
            
            // Cache order for future requests
            await redisClient.set(`order:${orderId}`, JSON.stringify(order), 'EX', 3600); // Cache for 1 hour
            
            return order;
        } catch (error) {
            throw new Error(error);
        }
    }
    
    static async deleteOrder(payload) {
        try {
            const { userId, orderId } = payload;
            const order = await Order.findOne({ _id: orderId }).lean();
            if (!order) throw new Error('Order not found');
            
            if (order.paymentMethod === 'TRANSFER') {
                const payment = await PaymentModel.deleteOne({ _id: order.payment_id });
                if (!payment) throw new Error('Payment not found');
                
                // Delete payment transaction cache if exists
                if (order.payment_id) {
                    await redisClient.del(RedisKeys.transactionKey.paymentTransaction(order.payment_id));
                }
            }
            
            if (order.user_id.toString() !== userId) throw new Error('Unauthorized');
            
            await Order.deleteOne({ _id: orderId });
            
            // Delete order from cache
            await redisClient.del(`order:${orderId}`);
            // Invalidate user orders cache
            await redisClient.del(RedisKeys.ordersKey.userOrders(userId));
            // Invalidate all orders cache
            await redisClient.del(RedisKeys.ordersKey.allOrders());
            
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }
    
    static async updateOrder(payload) {
        try {
            const { userId, orderId, ...data } = payload;
            const order = await Order.findOne({ _id: orderId }).lean();
            if (!order) throw new Error('Order not found');
            
            console.log(userId, order.user_id.toString());
            if (order.user_id.toString() !== userId) throw new Error('Unauthorized');
            
            await Order.updateOne({
                _id: orderId
            }, data);
            
            // Delete order from cache
            await redisClient.del(`order:${orderId}`);
            // Invalidate user orders cache
            await redisClient.del(RedisKeys.ordersKey.userOrders(userId));
            // Invalidate all orders cache
            await redisClient.del(RedisKeys.ordersKey.allOrders());
            
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }
    
    static async getOrdersByUserId(userId) {
        try {
            const cachedOrders = await redisClient.get(RedisKeys.ordersKey.userOrders(userId));
            if (cachedOrders) {
                return JSON.parse(cachedOrders);
            }
            
            const orders = await Order.find({ "user_id": userId }).lean();
            
            await redisClient.set(RedisKeys.ordersKey.userOrders(userId), JSON.stringify(orders), 'EX', 3600); // Cache for 1 hour
            
            return orders;
        } catch (error) {
            throw new Error(error);
        }
    }
    
    static async getAllOrders(payload) {
        try {
            const { userId, page, limit } = payload;
            const account = await Account.findOne({ _id: userId }).lean();
            if (!account || account.role !== 'admin') throw new Error('Unauthorized');
            
            const cachedOrders = await redisClient.get(RedisKeys.ordersKey.allOrders());
            if (cachedOrders) {
                return JSON.parse(cachedOrders);
            }
            
            const orders = await Order.find();
            
            await redisClient.set(RedisKeys.ordersKey.allOrders(), JSON.stringify(orders), 'EX', 1800); // Cache for 30 minutes
            
            return orders;
        } catch (error) {
            throw new Error(error);
        }
    }
}