import express from 'express';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
import userController from '../../controllers/user.controller.js';
const userRoutes = express.Router();

userRoutes.use(AuthenMiddleware.verifyToken);
userRoutes.get('/get_detail_user/:id', userController.getDetailUser);
userRoutes.put('/update/:id', userController.updateUserInfo);
userRoutes.get('/all', userController.getAllUsers);




export default userRoutes;