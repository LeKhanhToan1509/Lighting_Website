import PaymentModel from '../models/payment.model.js';
// import { v4 as uuidv4 } from 'uuid';
import paymentHelper from '../helpers/payment.js';
import MBBank from '../dbs/mbBank.js';
import Order from '../models/order.model.js';

export default class paymentService {

    static createTransaction(payload) {
        try {
            const hex_key = paymentHelper.geneKey(15);
            const transaction = {
                user_id: payload.user_id,
                amount: payload.amount,
                hex_key,
                description: paymentHelper.createDescription(hex_key),
            };
            const newTransaction = new PaymentModel(transaction);
            

            return newTransaction.save();
        } catch (error) {
            throw new Error(error);
        }
    };

    static async deleteTransaction(payload) {

        try {
            const { userId, transactionId } = payload;    
            const transaction = await PaymentModel.findOne({ _id: transactionId }).lean();
            if(!transaction) throw new Error('Transaction not found');
            console.log(transaction.user_id.toHexString(), userId);
            if(transaction.user_id.toHexString() !== userId) throw new Error('Unauthorized');
            await PaymentModel.deleteOne({ _id: transactionId });
            return true;
        } catch (error) {
            throw new Error(error);
        }
    };

    static async checkTransaction(payload) {
        try {
            const { userId, transactionId, hex_key, amount } = payload;
            let status = 'pending';
    
            const transaction = await PaymentModel.findOne({ _id: transactionId }).lean();
            if (!transaction) throw new Error('Transaction not found');
            if (transaction.user_id.toString() !== userId) throw new Error('Unauthorized');
            if (transaction.hex_key !== hex_key) throw new Error('Invalid transaction');
    
            const transactions = await MBBank.getTransactionsHistory();
            for (const t of transactions) {
                if (t.transactionDesc.includes(hex_key) && Number(t.creditAmount) === Number(amount)) {
                    status = 'success';
                    await Order.updateOne({ payment_id: transactionId }, { status: 'paid_pending_confirmation' });
                    await PaymentModel.findByIdAndUpdate(transactionId, { status: 'success' });
                    return { status: 'success' };
                }
            }
            return { status };
        } catch (error) {
            console.error('Error in checkTransaction:', error);
            throw new Error(error.message || 'Unknown error');
        }
    }
    
    static async getTransactionById(payload) {
        try {
            const { userId, id } = payload;
            const transactions = await PaymentModel.findOne({_id: id}).lean();
            console.log(transactions);
            if(!transactions) throw new Error('Transactions not found');
            if(transactions.user_id.toString() !== userId) throw new Error('Unauthorized');
            return transactions;
        }catch(error) {
            throw new Error(error);
        }
    }

    
}

