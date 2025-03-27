import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(
  subject,
  verificationCode,
  email_recipient
) {
  try {
    const email_recipient_string = `${email_recipient}`;

    // HTML template với thiết kế đẹp hơn
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LUMO Light Store - Verification Code</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8d568;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #333;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border-left: 1px solid #eeeeee;
            border-right: 1px solid #eeeeee;
        }
        .verification-code {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 4px;
            letter-spacing: 5px;
            color: #333;
        }
        .message {
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-radius: 0 0 5px 5px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #f8d568;
            color: #333333;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
        }
        .light-icon {
            font-size: 24px;
            margin-right: 5px;
        }

        /* Responsive Design */
        @media only screen and (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .header {
                padding: 15px;
            }
            .logo {
                font-size: 24px;
            }
            .content {
                padding: 20px;
            }
            .verification-code {
                font-size: 24px;
                padding: 10px;
            }
            .button {
                padding: 8px 16px;
                font-size: 14px;
            }
            .footer {
                font-size: 10px;
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="light-icon">💡</span> LUMO LIGHT STORE
            </div>
        </div>
        <div class="content">
            <h2>Xác nhận tài khoản của bạn</h2>
            <div class="message">
                <p>Chào bạn,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại LUMO Light Store. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã xác nhận dưới đây:</p>
            </div>
            <div class="verification-code">${verificationCode}</div>
            <div class="message">
                <p>Mã xác nhận này sẽ hết hạn trong vòng 10 phút.</p>
                <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc <a href="#">liên hệ với chúng tôi</a> nếu bạn có bất kỳ thắc mắc nào.</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://lumo.com" class="button">Truy cập trang web</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2025 LUMO Light Store. Tất cả các quyền được bảo lưu.</p>
            <p>Địa chỉ: Học viện công nghệ bưu chính</p>
            <p>Email: toanxm1509@gmail.com | Điện thoại: (+84) 343 150904</p>
        </div>
    </div>
</body>
</html>
`;

    const info = await transporter.sendMail({
      from: '"LUMO Light Store" <' + process.env.EMAIL_USER + ">",
      to: email_recipient_string,
      subject: subject,
      text: `${verificationCode}`,
      html: htmlContent,
    });

    return info;
  } catch (err) {
    console.log(err);
    throw err; // Re-throw để xử lý lỗi ở cấp cao hơn
  }
}
