
import Order from '../models/order.model.js';
import Account from '../models/account.model.js';
import PaymentModel from '../models/payment.model.js';

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
    
            return await newOrder.save();
        } catch (error) {
            console.error("Error creating order:", error.message);
            throw new Error(error.message);
        }
    }

    static async getOrderById(payload) {
        try {
            const { userId, orderId } = payload;
            const order = await Order.findOne({ _id: orderId }).lean();
            if(!order) throw new Error('Order not found');

            if(order.user_id.toHexString() !== userId) throw new Error('Unauthorized');
            return order;
        }catch(error) {
            throw new Error(error);
        }
    }

    static async deleteOrder(payload) {
        try {
            const { userId, orderId } = payload;
            const order = await Order.findOne({ _id: orderId }).lean();
            if(!order) throw new Error('Order not found');
            if(order.paymentMethod === 'TRANSFER') {
                const payment = await PaymentModel.deleteOne({ _id: order.payment_id });
                if(!payment) throw new Error('Payment not found');
            }
            if(order.user_id.toString() !== userId) throw new Error('Unauthorized');
            await Order.deleteOne({ _id: orderId });
            return true;
        }catch(error) {
            throw new Error(error);
        }
    }

    static async updateOrder(payload) {
        try {
            const { userId, orderId, ...data } = payload;
            const order = await Order.findOne({ _id: orderId }).lean();
            if(!order) throw new Error('Order not found');
            console.log(userId, order.user_id.toString());
            if(order.user_id.toString() !== userId) throw new Error('Unauthorized');
            await Order.updateOne({
                _id: orderId
            }, data);
            return true;
        }catch(error) {
            throw new Error(error);
        }
    }

    static async getOrders(userId) {
        try {
            const orders = await Order.find({ "user_id": userId }).lean();
            return orders;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getAllOrders(payload) {
        try {
            const { userId, page, limit } = payload;
            const account = await Account.findOne({ _id: userId }).lean();
            if(!account || account.role !== 'admin') throw new Error('Unauthorized');
            const orders = await Order.find().skip(page * limit).limit(limit).lean();
            return orders;
        }catch(error) {
            throw new Error(error);
        }
    }
}

