import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Divider,
  message,
  Select,
  Collapse,
  Steps,
  Card,
  Typography,
  Result,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  GoogleOutlined,
  FacebookOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { provinces, districtData } from '../../data/city.js';
import axiosInstance from "../../axiosInstance.jsx";

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [form] = Form.useForm();
  const [verificationForm] = Form.useForm();
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [step, setStep] = useState(0); // 0: Register, 1: Verify, 2: Success
  const [userData, setUserData] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Start countdown timer for code resend
  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return timer;
  };

  const onFinish = async (values) => {
    setLoading(true);
  
    const data = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      gender: values.gender,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2 || null,
      province: values.province,
      district: values.district,
      ward: values.ward,
      postalCode: values.postalCode || null,
      addressNote: values.addressNote || null,
      defaultAddress: values.defaultAddress || false,
    };

  
    try {
      const response = await axiosInstance.post('/signup', {
        'email': values.email, 
        'phone': values.phone
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.status === 200) {
        message.success("Đăng ký thành công! Vui lòng nhập mã xác thực được gửi đến email của bạn.");
        setUserData(data); 
        setStep(1);
        startCountdown(); 
      } else {
        message.error(response.data.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      message.error(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (values) => {
    if (!userData) {
      message.error("Không tìm thấy thông tin đăng ký. Vui lòng thử lại.");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/verify-email', {
        code: values.verificationCode,
        ...userData 
      });

      if (response.status === 200) {
        message.success("Xác thực tài khoản thành công!");
        setStep(2);

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Error during verification:", err);
      message.error(err.response?.data?.message || "Mã xác thực không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userData?.email) {
      message.error("Không tìm thấy email. Vui lòng thử lại.");
      return;
    }

    setResendLoading(true);
    try {
      const response = await axiosInstance.post('/resend-verification', {
        email: userData.email
      });

      if (response.status === 200) {
        message.success("Đã gửi lại mã xác thực. Vui lòng kiểm tra email của bạn.");
        const timer = startCountdown();
        return () => clearInterval(timer);
      }
    } catch (err) {
      console.error("Error resending code:", err);
      message.error(err.response?.data?.message || "Không thể gửi lại mã. Vui lòng thử lại sau.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleProvinceChange = (value) => {
    setDistricts(districtData[value] || []);
    form.setFieldsValue({ district: undefined });
  };

  const renderVerificationStep = () => {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <div className="text-center mb-8">
          <MailOutlined className="text-5xl text-blue-500" />
          <Title level={3} className="mt-4">Xác thực tài khoản</Title>
          <Paragraph className="text-gray-500">
            Chúng tôi đã gửi mã xác thực đến <Text strong>{userData?.email}</Text>
          </Paragraph>
        </div>

        <Form
          form={verificationForm}
          name="verification"
          onFinish={handleVerification}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="verificationCode"
            rules={[
              { required: true, message: "Vui lòng nhập mã xác thực" },
              { len: 6, message: "Mã xác thực phải có 6 chữ số" },
              { pattern: /^[0-9]+$/, message: "Mã xác thực chỉ bao gồm chữ số" }
            ]}
          >
            <Input
              size="large"
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="Nhập mã xác thực 6 chữ số"
              className="rounded-lg py-3"
              maxLength={6}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="h-12 rounded-lg bg-gray-900 hover:bg-gray-800 border-0"
            >
              Xác thực
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>
          <span className="text-gray-400 text-sm">Không nhận được mã?</span>
        </Divider>

        <div className="text-center">
          <Button
            type="link"
            icon={<ReloadOutlined />}
            loading={resendLoading}
            disabled={!canResend}
            onClick={handleResendCode}
            className="text-blue-600"
          >
            {canResend ? "Gửi lại mã" : `Gửi lại sau ${countdown} giây`}
          </Button>
        </div>

        <Divider />

        <div className="text-center">
          <Button
            type="text"
            onClick={() => setStep(0)}
            className="text-gray-500 hover:text-gray-700"
          >
            Quay lại trang đăng ký
          </Button>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => {
    return (
      <div className="bg-white shadow-lg rounded-2xl p-8">
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Đăng ký thành công!"
          subTitle="Tài khoản của bạn đã được xác thực. Đang chuyển hướng đến trang đăng nhập..."
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => navigate("/login")}
              className="h-12 rounded-lg bg-gray-900 hover:bg-gray-800 border-0"
            >
              Đăng nhập ngay
            </Button>
          ]}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-krona text-gray-800 mb-3">Lumo</h1>
          </Link>
          <p className="text-gray-500">
            {step === 0 && "Tạo tài khoản mới để trải nghiệm mua sắm tốt nhất"}
            {step === 1 && "Xác thực email của bạn để hoàn tất đăng ký"}
            {step === 2 && "Đăng ký thành công!"}
          </p>
        </div>

        <div className="mb-8">
          <Steps
            current={step}
            items={[
              {
                title: 'Đăng ký',
              },
              {
                title: 'Xác thực',
              },
              {
                title: 'Hoàn tất',
              },
            ]}
          />
        </div>

        {step === 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <Form
              form={form}
              name="register"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
              requiredMark={false}
              scrollToFirstError
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="firstName"
                  label="Họ"
                  rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Họ của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Tên của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
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
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Số điện thoại của bạn"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                  ]}
                  hasFeedback
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Mật khẩu của bạn"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error("Mật khẩu không khớp"));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Xác nhận mật khẩu"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Form.Item name="gender" label="Giới tính">
                <Select
                  size="large"
                  placeholder="Giới tính của bạn"
                  className="rounded-lg"
                >
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>

              {/* Phần thông tin địa chỉ */}
              <Collapse
                defaultActiveKey={["1"]}
                className="mb-6 border rounded-lg shadow-sm"
                expandIconPosition="end"
              >
                <Panel
                  header={
                    <div className="flex items-center">
                      <EnvironmentOutlined className="mr-2 text-gray-600" />
                      <span className="font-medium">Thông tin địa chỉ</span>
                    </div>
                  }
                  key="1"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="province"
                      label="Tỉnh/Thành phố"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn tỉnh/thành phố",
                        },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn tỉnh/thành phố"
                        className="rounded-lg"
                        showSearch
                        onChange={handleProvinceChange}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {provinces.map((province) => (
                          <Option key={province} value={province}>
                            {province}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="district"
                      label="Quận/Huyện"
                      rules={[
                        { required: true, message: "Vui lòng nhập quận/huyện" },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Chọn quận/huyện"
                        className="rounded-lg"
                        disabled={!districts.length}
                      >
                        {districts.map((district) => (
                          <Option key={district} value={district}>
                            {district}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="ward"
                      label="Phường/Xã"
                      rules={[
                        { required: true, message: "Vui lòng nhập phường/xã" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Phường/Xã"
                        className="rounded-lg"
                      />
                    </Form.Item>

                    <Form.Item name="postalCode" label="Mã bưu chính (tùy chọn)">
                      <Input
                        size="large"
                        placeholder="Mã bưu chính"
                        className="rounded-lg"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="addressLine1"
                    label="Địa chỉ"
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                  >
                    <Input
                      size="large"
                      prefix={<HomeOutlined className="text-gray-400" />}
                      placeholder="Số nhà, tên đường"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item name="addressNote" label="Ghi chú giao hàng (tùy chọn)">
                    <Input.TextArea
                      placeholder="Hướng dẫn giao hàng, mốc tham chiếu, v.v."
                      className="rounded-lg"
                      rows={3}
                    />
                  </Form.Item>

                  <Form.Item name="defaultAddress" valuePropName="checked">
                    <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                  </Form.Item>
                </Panel>
              </Collapse>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("Bạn phải đồng ý với điều khoản")
                          ),
                  },
                ]}
                className="mb-6"
              >
                <Checkbox>
                  Tôi đã đọc và đồng ý với{" "}
                  <Link to="/terms_and_pricy" className="text-primary-600">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/terms_and_pricing" className="text-primary-600">
                    Chính sách bảo mật
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  className="h-12 rounded-lg bg-gray-900 hover:bg-gray-800 border-0"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <Divider plain>
                <span className="text-gray-400 text-sm">Hoặc đăng ký với</span>
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
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        )}

        {step === 1 && renderVerificationStep()}
        {step === 2 && renderSuccessStep()}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Lumo. Tất cả quyền được bảo lưu.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-gray-700">
              Điều khoản
            </Link>
            <Link to="/privacy" className="hover:text-gray-700">
              Chính sách bảo mật
            </Link>
            <Link to="/help" className="hover:text-gray-700">
              Trợ giúp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;