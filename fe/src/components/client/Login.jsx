import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/apiRequest';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.login.isFetching);
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);
  
  const onFinish = async (values) => {
    const data = {
      email: values.email,
      password: values.password
    };
    loginUser(data, dispatch, navigate);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-4xl font-krona text-gray-800 mb-3">Lumo</h1>
            </Link>
            <p className="text-gray-500">Đăng nhập để tiếp tục mua sắm</p>
          </div>
          
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input 
                size="large"
                prefix={<MailOutlined className="text-gray-400" />} 
                placeholder="Email của bạn"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password 
                size="large"
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="Mật khẩu của bạn"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot_pass" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 rounded-lg bg-gray-900 hover:bg-gray-800 border-0"
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <Divider plain>
              <span className="text-gray-400 text-sm">Hoặc đăng nhập với</span>
            </Divider>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button 
                size="large" 
                icon={<GoogleOutlined />}
                className="flex items-center justify-center h-12 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Google
              </Button>
              <Button 
                size="large" 
                icon={<FacebookOutlined />}
                className="flex items-center justify-center h-12 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Facebook
              </Button>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Bạn chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Lumo. Tất cả quyền được bảo lưu.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-gray-700">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-gray-700">Chính sách bảo mật</Link>
            <Link to="/help" className="hover:text-gray-700">Trợ giúp</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;