import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Tabs, 
  Card, 
  Avatar, 
  Spin, 
  Button, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  message
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined,
  LockOutlined,
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined, 
  MailOutlined, 
  ManOutlined, 
  WomanOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axiosInstance from '../../axiosInstance';

const { TabPane } = Tabs;
const { Option } = Select;

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({});

  // Fetch user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.acc?._id) {
          throw new Error("User ID is missing");
        }

        const userResponse = await axiosInstance.get(
          `/user/get_detail_user/${user.acc._id}`, 
          {
            headers: {
              token: `Bearer ${user.token}`
            }
          }
        );
        
        const currentUser = userResponse.data.user[0];
        setUserData(currentUser);

        // Populate form with user details
        form.setFieldsValue({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          gender: currentUser.gender,
          addressLine1: currentUser.addressLine1,
          province: currentUser.province,
          district: currentUser.district,
          ward: currentUser.ward,
          postalCode: currentUser.postalCode,
          addressNote: currentUser.addressNote || '',
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        message.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, form]);

  // Profile editing handlers
  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      const response = await axiosInstance.put(
        `/user/get_detail_user/${user.acc._id}`, 
        values,
        {
          headers: {
            token: `Bearer ${user.token}`
          }
        }
      );
      
      setUserData(response.data.user);
      setEditing(false);
      message.success("Cập nhật thông tin thành công");
    } catch (err) {
      console.error("Error updating profile:", err);
      message.error("Không thể cập nhật thông tin");
    }
  };

  const handleCancelEdit = () => {
    form.resetFields();
    setEditing(false);
  };

  // Password change handler
  const handleChangePassword = async (values) => {
    try {
      await axiosInstance.post(
        `/user/change-password/${user.acc._id}`, 
        values,
        {
          headers: {
            token: `Bearer ${user.token}`
          }
        }
      );
      
      message.success("Đổi mật khẩu thành công");
      passwordForm.resetFields();
    } catch (err) {
      console.error("Error changing password:", err);
      message.error("Không thể đổi mật khẩu");
    }
  };

  // Render user info form
  const renderUserInfo = () => (
    <Card 
      className="rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ 
        background: 'linear-gradient(to right, #f5f7fa 0%, #f5f7fa 100%)',
        border: 'none'
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin 
            size="large" 
            className="text-blue-500"
          />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          className="p-2"
        >
          <Row gutter={[24, 16]}>
            {/* Left Column: Personal Info */}
            <Col xs={24} md={12} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                  <UserOutlined className="mr-3 text-blue-500" />
                  Thông tin cá nhân
                </h3>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="firstName"
                      label={<span className="text-gray-600">Tên</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                      <Input 
                        className="rounded-xl" 
                        placeholder="Nhập tên" 
                        disabled={!editing}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName"
                      label={<span className="text-gray-600">Họ</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                    >
                      <Input 
                        className="rounded-xl" 
                        placeholder="Nhập họ" 
                        disabled={!editing}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label={<span className="text-gray-600">Email</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    className="rounded-xl" 
                    placeholder="Nhập email" 
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<span className="text-gray-600">Số điện thoại</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                  <Input 
                    className="rounded-xl" 
                    placeholder="Nhập số điện thoại" 
                    disabled={!editing}
                  />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label={<span className="text-gray-600">Giới tính</span>}
                >
                  <Select 
                    placeholder="Chọn giới tính" 
                    className="rounded-xl" 
                    disabled={!editing}
                  >
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </div>
            </Col>

            {/* Right Column: Address Info */}
            <Col xs={24} md={12} className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                  <HomeOutlined className="mr-3 text-blue-500" />
                  Địa chỉ giao hàng
                </h3>
                
                <Form.Item
                  name="addressLine1"
                  label={<span className="text-gray-600">Địa chỉ chi tiết</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input.TextArea 
                    className="rounded-xl" 
                    placeholder="Số nhà, đường, khu vực..." 
                    rows={3} 
                    disabled={!editing}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="province"
                      label={<span className="text-gray-600">Tỉnh/TP</span>}
                      rules={[{ required: true, message: 'Bắt buộc!' }]}
                    >
                      <Input 
                        className="rounded-xl" 
                        placeholder="Tỉnh/TP" 
                        disabled={!editing}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="district"
                      label={<span className="text-gray-600">Quận/Huyện</span>}
                      rules={[{ required: true, message: 'Bắt buộc!' }]}
                    >
                      <Input 
                        className="rounded-xl" 
                        placeholder="Quận/Huyện" 
                        disabled={!editing}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ward"
                      label={<span className="text-gray-600">Phường/Xã</span>}
                      rules={[{ required: true, message: 'Bắt buộc!' }]}
                    >
                      <Input 
                        className="rounded-xl" 
                        placeholder="Phường/Xã" 
                        disabled={!editing}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            {editing ? (
              <>
                <Button 
                  onClick={handleCancelEdit} 
                  className="rounded-xl border-red-500 text-red-500 hover:bg-red-50"
                >
                  <CloseOutlined /> Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <SaveOutlined /> Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button 
                type="primary" 
                onClick={handleEditProfile} 
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <EditOutlined /> Chỉnh sửa
              </Button>
            )}
          </div>
        </Form>
      )}
    </Card>
  );

  // Render settings tab
  const renderSettingsTab = () => (
    <Card 
      className="rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ 
        background: 'linear-gradient(to right, #f5f7fa 0%, #f5f7fa 100%)',
        border: 'none'
      }}
    >
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-xl font-semibold text-blue-600 mb-6 flex items-center">
          <LockOutlined className="mr-3 text-blue-500" />
          Đổi mật khẩu
        </h3>
        <Form 
          form={passwordForm}
          layout="vertical" 
          onFinish={handleChangePassword}
          className="space-y-4"
        >
          <Form.Item
            name="currentPassword"
            label={<span className="text-gray-600">Mật khẩu hiện tại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password 
              className="rounded-xl" 
              placeholder="Nhập mật khẩu hiện tại" 
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={<span className="text-gray-600">Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
            ]}
          >
            <Input.Password 
              className="rounded-xl" 
              placeholder="Nhập mật khẩu mới" 
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={<span className="text-gray-600">Xác nhận mật khẩu</span>}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password 
              className="rounded-xl" 
              placeholder="Xác nhận mật khẩu mới" 
            />
          </Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="rounded-xl bg-blue-600 hover:bg-blue-700 w-full"
          >
            <LockOutlined /> Cập nhật mật khẩu
          </Button>
        </Form>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-400 text-white p-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <Avatar 
              size={140} 
              icon={<UserOutlined />} 
              className="border-4 border-white shadow-lg transform transition-transform hover:scale-110"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">
                {userData?.firstName} {userData?.lastName}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                  <MailOutlined className="mr-2" />
                  <span>{userData?.email}</span>
                </div>
                <div className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                  <PhoneOutlined className="mr-2" />
                  <span>{userData?.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
          tabBarStyle={{ 
            marginBottom: 0, 
            padding: '16px 0',
            fontWeight: 600 
          }}
        >
          <TabPane
            tab={
              <span className="px-4 py-2 rounded-full">
                <UserOutlined className="mr-2" />
                Thông tin cá nhân
              </span>
            }
            key="1"
          >
            <div className="p-6">
              {renderUserInfo()}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="px-4 py-2 rounded-full">
                <SettingOutlined className="mr-2" />
                Cài đặt
              </span>
            }
            key="2"
          >
            <div className="p-6">
              {renderSettingsTab()}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;