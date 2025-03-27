import express from 'express';
import accessController from '../../controllers/acces.controller.js';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
const accessRoutes = express.Router();

accessRoutes.post('/signup', accessController.signUp);
accessRoutes.post('/signin', accessController.signIn);
accessRoutes.post('/refresh-token', accessController.refreshToken);
accessRoutes.post('/signout', AuthenMiddleware.verifyToken, accessController.signOut);
accessRoutes.post('/reset-password', accessController.resetPassword);
accessRoutes.post('/forgot-password', accessController.forgotPassWord);
accessRoutes.post('/verify-email', accessController.verifyEmail);
accessRoutes.post('/verify_pin', accessController.verifyPin);



export default accessRoutes;