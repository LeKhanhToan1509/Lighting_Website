
import { MB } from "mbbank";
import dotenv from "dotenv";
dotenv.config();

export default class MBBank {
    static getTransactionsHistory = async () => {
        const today = new Date();
        const formattedDate = new Intl.DateTimeFormat('en-GB').format(today);
        const mb = new MB({ username: process.env.MB_USER, password: process.env.MB_PASS });
        const info = await mb.getTransactionsHistory({ accountNumber: process.env.MB_NO, fromDate:formattedDate, toDate: formattedDate });
        return info;
    }

    

    static getBalance = async () => {
        const mb = new MB({ username: process.env.MB_USER, password: process.env.MB_PASS });
        const info = await mb.getBalance();
        return info;
    }
}

