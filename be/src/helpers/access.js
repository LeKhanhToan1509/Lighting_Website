import jwt from 'jsonwebtoken';

export default class accessHelper {

    static generateToken(user, key, timeExpire) {
        return jwt.sign({
            _id: user._id,
            email: user.email,
            user_name: user.user_name,
            role: user.role,
            isPremium: user.isPremium,
            PremiumExpired: user.PremiumExpired,
            askAiQuantity: user.askAiQuantity,
        }, key, { expiresIn: timeExpire });
    }


}