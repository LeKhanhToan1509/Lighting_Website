import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Tabs, 
  Table, 
  Tag, 
  Card, 
  Avatar, 
  Empty, 
  Spin, 
  Button, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  message,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  ShoppingOutlined, 
  SettingOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  ManOutlined, 
  WomanOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const { TabPane } = Tabs;
const { Option } = Select;

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]);

  // Fetch user details and related data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.acc?._id) {
          throw new Error("User ID is missing");
        }

        // Fetch user details
        const userResponse = await axiosInstance.get(`/user/get_detail_user/${user.acc._id}`, {}, {
          headers: {
            token: `Bearer ${user.token}`
          }
        });
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

        const ordersResponse = await axiosInstance.get(`/order/user/${user.acc._id}`, {}, {
          headers: {
            token: `Bearer ${user.token}`
          }
        });
        console.log(ordersResponse.data);
        setOrders(ordersResponse.data.orders || []);
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
      const response = await axiosInstance.put(`/user/get_detail_user/${user.acc._id}`, values);
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
      await axiosInstance.post(`/user/change-password/${user.acc._id}`, values);
      message.success("Đổi mật khẩu thành công");
      form.resetFields();
    } catch (err) {
      console.error("Error changing password:", err);
      message.error("Không thể đổi mật khẩu");
    }
  };

  // Column definitions
  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <Link to={`/order/${text}`}>{text}</Link>,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.map(item => item.name).join(', ')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (total) => `${total.toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => (
        <Tag color="processing">Đang xử lý</Tag>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button type="link">Xem chi tiết</Button>
      ),
    },
  ];

  // Render user info form
  const renderUserInfo = () => (
    <Card className="mb-6 shadow-sm">
      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
          disabled={!editing}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <h3 className="text-lg font-medium mb-4">Thông tin cá nhân</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="firstName"
                    label="Tên"
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                  >
                    <Input placeholder="Nhập tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="lastName"
                    label="Họ"
                    rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                  >
                    <Input placeholder="Nhập họ" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" disabled />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
              
              <Form.Item
                name="gender"
                label="Giới tính"
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <h3 className="text-lg font-medium mb-4">Địa chỉ giao hàng</h3>
              
              <Form.Item
                name="addressLine1"
                label="Địa chỉ chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input.TextArea placeholder="Số nhà, đường, khu vực..." rows={3} />
              </Form.Item>
              
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="province"
                    label="Tỉnh/Thành phố"
                    rules={[{ required: true, message: 'Bắt buộc!' }]}
                  >
                    <Input placeholder="Tỉnh/Thành phố" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="district"
                    label="Quận/Huyện"
                    rules={[{ required: true, message: 'Bắt buộc!' }]}
                  >
                    <Input placeholder="Quận/Huyện" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="ward"
                    label="Phường/Xã"
                    rules={[{ required: true, message: 'Bắt buộc!' }]}
                  >
                    <Input placeholder="Phường/Xã" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="postalCode"
                    label="Mã bưu chính"
                  >
                    <Input placeholder="Mã bưu chính" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="addressNote"
                    label="Ghi chú"
                  >
                    <Input placeholder="Ghi chú cho người giao hàng" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <div className="flex justify-end mt-4">
            {editing ? (
              <>
                <Button onClick={handleCancelEdit} className="mr-2">
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </>
            ) : (
              <Button type="primary" onClick={handleEditProfile}>
                Chỉnh sửa thông tin
              </Button>
            )}
          </div>
        </Form>
      )}
    </Card>
  );

  // Render orders tab
  const renderOrdersTab = () => (
    loading ? (
      <div className="text-center py-12">
        <Spin size="large" />
      </div>
    ) : orders.length > 0 ? (
      <Table
        dataSource={orders}
        columns={orderColumns}
        rowKey="_id"
      />
    ) : (
      <Empty
        description="Bạn chưa có đơn hàng nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className="py-12"
      >
        <Link to="/shop">
          <Button type="primary">Mua sắm ngay</Button>
        </Link>
      </Empty>
    )
  );

  // Render settings tab
  const renderSettingsTab = () => (
    <Card className="mb-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Cài đặt tài khoản</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Đổi mật khẩu</h4>
          <Form 
            layout="vertical" 
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
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
              <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Cập nhật mật khẩu</Button>
          </Form>
        </div>
        
        <Divider />
        
        <div>
          <h4 className="font-medium mb-2">Xóa tài khoản</h4>
          <p className="text-gray-500 mb-4">
            Xóa tài khoản sẽ xóa tất cả dữ liệu của bạn khỏi hệ thống. Hành động này không thể hoàn tác.
          </p>
          <Button danger>Xóa tài khoản</Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gray-800 text-white p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0">
            <div className="flex-shrink-0">
              <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                className="border-4 border-white"
              />
            </div>
            <div className="ml-0 md:ml-6 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userData?.firstName} {userData?.lastName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  <span>{userData?.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" />
                  <span>{userData?.phone}</span>
                </div>
                <div className="flex items-center">
                  {userData?.gender === 'male' ? <ManOutlined className="mr-2" /> : <WomanOutlined className="mr-2" />}
                  <span>{userData?.gender === 'male' ? 'Nam' : userData?.gender === 'female' ? 'Nữ' : 'Khác'}</span>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <HomeOutlined className="mr-2" />
                <span className="text-sm">{userData?.addressLine1}, {userData?.ward}, {userData?.district}, {userData?.province}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="px-6 pt-4"
          tabBarStyle={{ marginBottom: 24 }}
        >
          <TabPane
            tab={
              <span className="flex items-center">
                <UserOutlined className="mr-2" />
                Thông tin cá nhân
              </span>
            }
            key="1"
          >
            {renderUserInfo()}
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <ShoppingOutlined className="mr-2" />
                Đơn hàng
              </span>
            }
            key="2"
          >
            {renderOrdersTab()}
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center">
                <SettingOutlined className="mr-2" />
                Cài đặt
              </span>
            }
            key="3"
          >
            {renderSettingsTab()}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;