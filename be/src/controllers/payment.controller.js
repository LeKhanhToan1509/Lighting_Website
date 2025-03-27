import paymentService from '../services/payment.service.js';
import redisClient from '../dbs/redisdb.js';

export default class paymentController {

    static async checkTransaction(req, res) {
        try {
            const userId = req.user._id;
            const { transactionId, amount } = req.body;
            const hex_key = await redisClient.get(`transaction:${transactionId}`);
            const payload = { userId, transactionId, hex_key, amount };
            const result = await paymentService.checkTransaction(payload);
            res.status(200).json({
                message: 'Check transaction successfully',
                status: result
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Check transaction failed'
            });
        }
    }

    static async createTransaction(req, res) {
        try {
            const userId = req.user._id;
            const transaction = req.body;
            const payload = { userId, ...transaction };
            const newTransaction = await paymentService.createTransaction(payload);
            if (!newTransaction) {
                throw new Error('Create transaction failed');
            }
            const redis_key = `transaction:${newTransaction._id}`;
            await redisClient.set(redis_key, newTransaction.hex_key);
            res.status(200).json({
                message: 'Create transaction successfully',
                transaction: newTransaction
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Create transaction failed'
            });
        }
    }

    static async deleteTransaction(req, res) {
        try {
            const userId = req.user._id;
            const transactionId= req.params.id;
            await paymentService.deleteTransaction({
                userId,
                transactionId
            });
            res.status(200).json({
                message: 'Delete transaction successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Delete transaction failed'
            });
        }
    }

    static async getTransactionById(req, res) {
        try {
            const userId = req.user._id;
            const { id } = req.params;
            const transactions = await paymentService.getTransactionById({userId, id});
            res.status(200).json({
                message: 'Get transactions successfully',
                transactions
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Get transactions failed'
            });
        }
    }
}
