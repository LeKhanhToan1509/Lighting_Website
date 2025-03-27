import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Empty, Button, InputNumber, Divider, Modal, Radio, Space, Image, Form, Select, Spin, Alert } from 'antd';
import { DeleteOutlined, MinusOutlined, PlusOutlined, QrcodeOutlined, CarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { deleteProduct, updateProduct } from '../../redux/apiRequest';
import { removeAllProduct } from '../../redux/apiRequest';
import { message, Popconfirm } from 'antd';
import axiosInstance from '../../axiosInstance';
import { provinces, districtData } from '../../data/city';

const { Option } = Select;

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cart);
  const user = useSelector((state) => state.auth.login.currentUser);
  const bankId = '970422';
  const accNo = '150910112004';
  const template = 'qr_only';
  const [totalPrice, setTotalPrice] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [addressType, setAddressType] = useState('default');
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrStep, setQrStep] = useState(false);
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  const confirm = () => {
    removeAllProduct(dispatch);
  };

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  useEffect(() => {
    qrStep === true && setQrCode(`https://img.vietqr.io/image/${bankId}-${accNo}-${template}.png?amount=${totalPrice}&addInfo=${description}`);
  }, [totalPrice, bankId, accNo, template, qrStep, description]);
  
  useEffect(() => {
    if (user && user.acc && user.acc._id) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/user/get_detail_user/${user.acc._id}`);
      const currentUser = response.data.user[0];
      
      if (currentUser) {
        setDefaultAddress({
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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await axiosInstance.get(`/payment/${paymentId}`, {}, {
          headers : {
            'token': `Bearer ${user.accessToken}`
          }
        });
        setDescription(response?.data?.transactions?.description);
        return response.data;
      } catch (error) {
        console.error("Error fetching payment data:", error);
      }
    };
    if(paymentId){
      fetchPaymentData();
      setQrStep(true);
    }
  }, [paymentId]);

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotalPrice(total);
  };

  const incrementQuantity = (item) => {
    const existingCartItem = cartItems.find(
        (cartItem) => cartItem.id === item.id && cartItem.color === item.color
    );

    if (existingCartItem) {
        updateProduct(
            {
                id: existingCartItem._id,
                color: existingCartItem.color,
                quantity: existingCartItem.quantity + 1
            },
            dispatch
        );
    }
  };

  const decrementQuantity = (item) => {
    const existingCartItem = cartItems.find(
        (cartItem) => cartItem.id === item.id && cartItem.color === item.color
    );

    if (existingCartItem && existingCartItem.quantity > 1) {
        updateProduct(
            {
                id: existingCartItem._id,
                color: existingCartItem.color,
                quantity: existingCartItem.quantity - 1
            },
            dispatch
        );
    }
  };

  const updateQuantity = (item, value) => {
    updateProduct({
      id: item._id,
      color: item.color,
      quantity: value
    }, dispatch);
  };

  const removeItem = (item) => {
    deleteProduct({
      id: item._id,
      color: item.color
    }, dispatch);
  };

  const showModal = () => {
    if (defaultAddress) {
      if (addressType === 'default') {
        form.setFieldsValue(defaultAddress);
      }
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const orderData = {
        items: cartItems,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod.toUpperCase(),
        addressType: addressType,
        address: values,
      };
      const res = await axiosInstance.post('/orders/create', orderData, {
        headers: {
          'token': `Bearer ${user.accessToken}`
        }
      });      
      setOrderId(res.data.order._id)
      setPaymentId(res.data.order.payment_id)

      if (paymentMethod === 'transfer') {
        showQrCodeModal();
      } else {
        message.success('Đơn hàng COD của bạn đã được tạo thành công!');
        removeAllProduct(dispatch);
      }
      setIsModalVisible(false);
    }).catch(errorInfo => {
      console.log('Validate Failed:', errorInfo);
    });
  };

  const handleCancel = async () => {
    setIsModalVisible(false);
  };

  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  const showQrCodeModal = () => {
    setIsQrModalVisible(true);
  };

  const handleQrOk = async () => {
    setPaymentStatus({ loading: true, success: false, error: false, message: '' });

    try {
      const res = await axiosInstance.post(`/payment/ispaid`, {
        'transactionId': paymentId,
        'amount': totalPrice
      }, {
        headers: {
          token: `Bearer ${user.accessToken}`
        }
      });

      if (res.data.status.status === 'pending') {
        setPaymentStatus({
          loading: false,
          success: false,
          error: true,
          message: 'Thanh toán chưa được xác nhận. Vui lòng thử lại sau.'
        });

        setTimeout(() => {
          setPaymentStatus({ loading: false, success: false, error: false, message: '' });
        }, 2000);
      }

      if (res.data.status.status === 'success') {
        setPaymentStatus({
          loading: false,
          success: true,
          error: false,
          message: 'Thanh toán thành công!'
        });

        setTimeout(() => {
          removeAllProduct(dispatch);
          setIsQrModalVisible(false);
        }, 1000);
      }
    } catch (error) {
      setPaymentStatus({
        loading: false,
        success: false,
        error: true,
        message: 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      });

      setTimeout(() => {
        setPaymentStatus({ loading: false, success: false, error: false, message: '' });
      }, 2000);
    }
  };

  const handleQrCancel = async () => {
    await axiosInstance.post(`/orders/delete/${orderId}`, {}, {
      headers: { 
        token: `Bearer ${user.accessToken}`
      }
    });
    setIsQrModalVisible(false);
  };

  const onPaymentMethodChange = e => {
    setPaymentMethod(e.target.value);
  };

  const onAddressTypeChange = e => {
    setAddressType(e.target.value);
    
    if (e.target.value === 'default' && defaultAddress) {
      form.setFieldsValue(defaultAddress);
    } else if (e.target.value === 'new') {
      form.resetFields();
    }
  };

  const renderQrModalContent = () => {
    if (paymentStatus.loading) {
      return (
        <div className="text-center space-y-4">
          <Spin size="large" />
          <p>Đang xác nhận thanh toán...</p>
        </div>
      );
    }

    if (paymentStatus.success) {
      return (
        <div className="text-center space-y-4">
          <CheckCircleOutlined className="text-6xl text-green-500" />
          <p className="text-xl font-semibold text-green-600">Thanh toán thành công!</p>
        </div>
      );
    }

    if (paymentStatus.error) {
      return (
        <div className="text-center space-y-4">
          <Alert 
            message="Thanh toán thất bại" 
            description={paymentStatus.message} 
            type="error" 
            showIcon 
          />
          <div className="text-center space-y-4">
            <p>Quét mã QR để thanh toán số tiền: <strong>{totalPrice.toLocaleString()}đ</strong></p>
            <div className="flex justify-center">
              <Image
                src={qrCode}
                alt="QR Code Payment"
                width={250}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-left">
              <p className="text-sm"><strong>Thông tin chuyển khoản:</strong></p>
              <p className="text-sm">Ngân hàng: <strong>MBBank</strong></p>
              <p className="text-sm">Số tài khoản: <strong>{accNo}</strong></p>
              <p className="text-sm">Nội dung: <strong>Thanh toán đơn hàng {orderId}</strong></p>
            </div>
            <p className="text-red-500 text-sm">* Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán.</p>
          </div>
        </div>
      );
    }

    // Default QR code view
    return (
      <div className="text-center space-y-4">
        <p>Quét mã QR để thanh toán số tiền: <strong>{totalPrice.toLocaleString()}đ</strong></p>
        <div className="flex justify-center">
          <Image
            src={qrCode}
            alt="QR Code Payment"
            width={250}
          />
        </div>
        <div className="bg-gray-50 p-4 rounded-md text-left">
          <p className="text-sm"><strong>Thông tin chuyển khoản:</strong></p>
          <p className="text-sm">Ngân hàng: <strong>MBBank</strong></p>
          <p className="text-sm">Số tài khoản: <strong>{accNo}</strong></p>
          <p className="text-sm">Nội dung: <strong>Thanh toán đơn hàng {orderId}</strong></p>
        </div>
        <p className="text-red-500 text-sm">* Đơn hàng sẽ được xử lý sau khi xác nhận thanh toán.</p>
      </div>
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-center mb-8">Giỏ hàng của bạn</h1>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống</span>
            }
          >
            <div className='flex flex-col items-center'>
              <Link to="/shop">
                <Button type="primary" size="large" className="mt-4">
                  Tiếp tục mua sắm
                </Button>
              </Link>
              <Link to="/orders">
                <Button type="link" size="large" className="mt-4">
                  Xem đơn hàng của bạn
                </Button>
              </Link>
            </div>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Giỏ hàng của bạn</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Sản phẩm ({cartItems.length})</h2>
              <Popconfirm
                title="Xóa Tất cả"
                description="Bạn có muốn xóa tất cả không ?"
                onConfirm={confirm}
                okText="Có"
                cancelText="Không"
              >
                <Button danger>Xóa Tất Cả</Button>
              </Popconfirm>
            </div>
            
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.color}`} className="flex flex-col sm:flex-row py-6 border-b border-gray-200">
                <div className="sm:w-1/4 mb-4 sm:mb-0">
                  <img 
                    src={item.images ? item.images[item.color.indexOf(item.color)] : ''}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                <div className="sm:w-3/4 sm:pl-6 flex flex-col justify-between">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeItem(item)}
                    />
                  </div>
                  
                  {item.color && (
                    <p className="text-sm text-gray-500 mb-2">
                      Màu: {item.color}
                    </p>
                  )}
                  
                  {item.size && (
                    <p className="text-sm text-gray-500 mb-2">
                      Size: {item.size}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <Button 
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={() => decrementQuantity(item)}
                        disabled={item.quantity <= 1}
                      />
                      <InputNumber
                        min={1}
                        max={item.stock || 99}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item, value)}
                        controls={false}
                        className="w-12 text-center border-0"
                      />
                      <Button 
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => incrementQuantity(item)}
                        disabled={item.quantity >= (item.stock || 99)}
                      />
                    </div>
                    <p className="text-lg font-semibold">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{totalPrice.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
              </div>
              
              <Divider />
              
              <div className="flex justify-between mb-6">
                <span className="text-lg font-semibold">Tổng cộng</span>
                <span className="text-lg font-bold">{totalPrice.toLocaleString()}đ</span>
              </div>
              
              <Button 
                type="primary" 
                size="large" 
                block
                className="mb-4"
                onClick={showModal}
                loading={loading}
              >
                Thanh toán ngay
              </Button>
              
              <Link to="/shop">
                <Button size="large" block>
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Thông tin thanh toán"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        width={700}
      >
        <Form form={form} layout="vertical">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Địa chỉ giao hàng</h3>
              
              {defaultAddress && (
                <Radio.Group onChange={onAddressTypeChange} value={addressType}>
                  <Space direction="vertical">
                    <Radio value="default">
                      <span>Sử dụng địa chỉ mặc định</span>
                    </Radio>
                    <Radio value="new">
                      <span>Thêm địa chỉ mới</span>
                    </Radio>
                  </Space>
                </Radio.Group>
              )}
              
              <div className="space-y-3 mt-4">
                <div className="flex gap-4">
                  <Form.Item
                    name="firstName"
                    label="Họ"
                    className="w-1/2"
                    rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập họ"
                    />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label="Tên"
                    className="w-1/2"
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập tên"
                    />
                  </Form.Item>
                </div>
                
                <div className="flex gap-4">
                  <Form.Item
                    name="email"
                    label="Email"
                    className="w-1/2"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập email"
                    />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    className="w-1/2"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="addressLine1"
                  label="Địa chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                </Form.Item>
                
                <div className="flex gap-4">
                  <Form.Item
                    name="province"
                    label="Tỉnh/Thành phố"
                    className="w-1/3"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành!' }]}
                  >
                    <Select placeholder="Chọn tỉnh/thành">
                      <Option value="Hà Nội">Hà Nội</Option>
                      <Option value="TP HCM">TP HCM</Option>
                      {/* Add more provinces as needed */}
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="district"
                    label="Quận/Huyện"
                    className="w-1/3"
                    rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                  >
                    <Select placeholder="Chọn quận/huyện">
                      <Option value="Quận 1">Quận 1</Option>
                      <Option value="Quận 2">Quận 2</Option>
                      
                    </Select>
                  </Form.Item>
                  
                  <Form.Item
                    name="ward"
                    label="Phường/Xã"
                    className="w-1/3"
                    rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                  >
                    <Select placeholder="Chọn phường/xã">
                      <Option value="Phường 1">Phường 1</Option>
                      <Option value="Phường 2">Phường 2</Option>
                      {/* Add more wards as needed */}
                    </Select>
                  </Form.Item>
                </div>
                
                <div className="flex gap-4">
                  <Form.Item
                    name="postalCode"
                    label="Mã bưu điện"
                    className="w-1/2"
                  >
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập mã bưu điện (nếu có)"
                    />
                  </Form.Item>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    className="w-1/2"
                  >
                    <Select placeholder="Chọn giới tính">
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="addressNote"
                  label="Ghi chú (tùy chọn)"
                >
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Ghi chú thêm cho đơn hàng"
                  ></textarea>
                </Form.Item>
              </div>
            </div>

            <Divider />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Phương thức thanh toán</h3>
              <Radio.Group onChange={onPaymentMethodChange} value={paymentMethod}>
                <Space direction="vertical">
                  <Radio value="transfer">
                    <div className="flex items-center">
                      <QrcodeOutlined className="text-lg mr-2" />
                      <span>Chuyển khoản ngân hàng (QR Code)</span>
                    </div>
                  </Radio>
                  <Radio value="cod">
                    <div className="flex items-center">
                      <CarOutlined className="text-lg mr-2" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            <Divider />

            <div className="flex justify-between font-medium">
              <span>Tổng thanh toán:</span>
              <span className="text-lg text-red-600">{totalPrice.toLocaleString()}đ</span>
            </div>
          </div>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title="Thanh toán chuyển khoản"
        open={isQrModalVisible}
        onOk={handleQrOk}
        onCancel={handleQrCancel}
        okText="Đã thanh toán"
        cancelText="Hủy"
        confirmLoading={paymentStatus.loading}
        okButtonProps={{
          disabled: paymentStatus.loading || paymentStatus.success
        }}
      >
        {renderQrModalContent()}
      </Modal>
    </div>
  );
};

export default Cart;