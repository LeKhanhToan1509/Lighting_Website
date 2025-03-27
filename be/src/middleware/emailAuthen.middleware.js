import sendEmail from "../helpers/sendEmail";


export default class emailAuthenMiddleware {
    static authenEmail = async (req, res, next) => {
        const { email, ...info } = req.body;
        const code = getRandomSixDigit();
        const subject = 'Email verification';
        const text = `Your code is: ${code}`;
        const email_recipient = [email];
        await sendEmail(subject, text, email_recipient);
        req.code = code;
    }
}
