import accessService from "../services/access.service.js"

export default class accessController {
    static signUp = async (req, res) => {
        try {
            await accessService.signUp(req.body);
            res.status(200).json({
                message: 'Sign up successfully let verify your email',
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Sign up failed'
            });
        }
    }

    static signIn = async (req, res) => {
        try {
            const {refreshToken, ...info} = await accessService.signIn(req.body);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,  // Ngăn JavaScript truy cập cookie (bảo mật hơn)
                secure: true,   // Bắt buộc nếu dùng `SameSite=None` (Chỉ hoạt động trên HTTPS)
                sameSite: 'None', // Cho phép cookie hoạt động trên cross-site
                path: '/', // Đảm bảo cookie áp dụng cho toàn bộ backend
            });
            
            res.status(200).json({
                message: 'Sign in successfully',
                refreshToken,
                ...info,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Sign in failed'
            });
        }
    }

    static refreshToken = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            const {newAccessToken, newRefreshToken} = await accessService.refresh({refreshToken});
            // console.log(`newAccessToken: ${newAccessToken}`);
            // console.log(`newRefreshToken: ${newRefreshToken}`);
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,  // Ngăn chặn JavaScript đọc cookie
                secure: true,   // Bắt buộc nếu dùng `SameSite=None`
                path: '/',
            });
            
            res.status(200).json({
                message: 'Refresh token successfully',
                accessToken: newAccessToken
            });
        } catch(error) {
            res.status(500).json({
                message: error.message || 'Refresh token failed'
            });
        }
    }
    static signOut = async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            const account = req.user;
            await accessService.signOut({ refreshToken, account });
            res.clearCookie('refreshToken');
            res.status(200).json({
                message: 'Sign out successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Sign out failed'
            });
        }
    }

    static resetPassword = async (req, res) => {
        try {
            const account = req.body;
            await accessService.resetPassword(account);
            res.status(200).json({
                message: 'Reset password successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Reset password failed'
            });
        }
    }

    static verifyEmail = async (req, res) => {
        try {
            const account = await accessService.verifyEmail( req.body );
            res.status(200).json({
                message: 'Verify email successfully',
                account: account
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Verify email failed'
            });
        }
    }
    
    static verifyPin = async (req, res) => {
        try {
            const {email, code} = req.body;
            await accessService.verifyPin({email, code});
            res.status(200).json({
                message: 'Verify pin successfully'
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Verify pin failed'
            });
        }
    }

    static forgotPassWord = async (req, res) => {
        try {
            await accessService.forgotPassWord(req.body);
            res.status(200).json({
                message: 'Change password successfully'
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || 'Change password failed'
            });
        }
    }
}
