import Account from "../models/account.model.js";
import redisClient from "../dbs/redisdb.js";
import RedisKeys from "../utils/redisKeys.js";

class userService {
    static async getDetailUser(payload) {
        const { id } = payload;
        if (!id) {
            throw new Error('Id is required');
        }

        try {
            const cachedUser = await redisClient.get(RedisKeys.userKey.profile(id));
            if (cachedUser) {
                return JSON.parse(cachedUser);
            }

            const user = await Account.find({ _id: id }).select('-password').lean();
            if (!user) {
                throw new Error('User not found');
            }
            await redisClient.set(RedisKeys.userKey.profile(id), JSON.stringify(user), 'EX', 3600);
            
            return user;
        } catch (error) {
            console.error("Error in getDetailUser:", error);
            throw new Error('Internal Server Error');
        }
    }

    static updateUserInfo = async (payload) => {
        const {id, ...data} = payload;
        if (!id) {
            throw new Error('Id is required');
        }
        try {
            const user = await Account.find({ _id: id }).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            await Account.updateOne({ _id: id }, data);
            
            await redisClient.del(RedisKeys.userKey.profile(id));
            await redisClient.del(RedisKeys.userKey.allUsers());
            
            return { message: 'Update user info successfully' };
        }catch(err){
            console.error("Error in updateUserInfo:", err);
            throw new Error('Internal Server Error');
        }
    }

    static async getAllUsers(userId) {
        try {
            const account = await Account.findOne({ _id: userId });
            if (!account) {
                throw new Error('User not found');
            }
            if(account.role !== 'admin'){
                throw new Error('Permission denied');
            }
            
            const cacheAllUsers = await redisClient.get(RedisKeys.userKey.allUsers());
            if (cacheAllUsers !== null) {
                return JSON.parse(cacheAllUsers);
            }
            
            const users = await Account.find({}).select('-password').lean();
            if (!users) {
                throw new Error('Users not found');
            }
            
            await redisClient.set(RedisKeys.userKey.allUsers(), JSON.stringify(users), 'EX', 3600);
            return users;
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            throw new Error('Internal Server Error');
        }
    }
}

export default userService;