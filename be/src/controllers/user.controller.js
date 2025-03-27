import userService from '../services/user.service.js';

export default class userController {
    static async getDetailUser(req, res) {
        try  {
            const id = req.params.id;
            const user = await userService.getDetailUser({id});
            res.status(200).json({
                message: 'Get detail user successfully',
                user
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Get all products failed'
            });
        }

    }

    static async updateUserInfo(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            const user = await userService.updateUserInfo({id, ...data});
            res.status(200).json({
                message: 'Update user info successfully',
                user
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Update user info failed'
            });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const userId = req.user._id;
            const users = await userService.getAllUsers(userId);
            res.status(200).json({
                message: 'Get all users successfully',
                users
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Get all users failed'
            });
        }
    }

}
