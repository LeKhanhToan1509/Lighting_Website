import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      console.log('Request sent:', values);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('Email khôi phục mật khẩu đã được gửi!');
      setEmailSent(true);
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau!');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quên mật khẩu</h2>
          <p className="text-gray-600">
            {!emailSent 
              ? 'Nhập email của bạn để nhận liên kết đặt lại mật khẩu' 
              : 'Kiểm tra email của bạn để tiếp tục'
            }
          </p>
        </div>

        {!emailSent ? (
          <Form
            form={form}
            name="forgot_password"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />} 
                placeholder="Địa chỉ email" 
                size="large"
              />
            </Form.Item>

            <Form.Item className="mb-2">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Gửi liên kết đặt lại
              </Button>
            </Form.Item>
            
            <div className="text-center">
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Quay lại đăng nhập
              </a>
            </div>
          </Form>
        ) : (
          <div className="text-center">
            <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
              <KeyOutlined className="text-2xl mb-2" />
              <p>Email khôi phục đã được gửi đến địa chỉ email của bạn.</p>
              <p className="text-sm mt-2">Nếu bạn không nhận được email, hãy kiểm tra thư mục spam.</p>
            </div>
            
            <Button 
              onClick={() => setEmailSent(false)} 
              className="text-blue-600 hover:text-blue-800"
              type="link"
            >
              Thử lại với email khác
            </Button>
            
            <div className="mt-4">
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Quay lại đăng nhập
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;