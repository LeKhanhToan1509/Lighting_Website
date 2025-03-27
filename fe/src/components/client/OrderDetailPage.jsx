import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Typography, 
    Divider, 
    Button, 
    Tag, 
    Descriptions,
    Image,
    Space,
    Alert,
    Steps,
    Modal,
    Radio,
    message
} from 'antd';
import { 
    ArrowLeftOutlined, 
    FileTextOutlined,
    PrinterOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    CheckCircleOutlined,
    SendOutlined,
    ClockCircleOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

const { Title, Text, Paragraph } = Typography;


let ORDER_STATUS_MAP = {
    COD: {
        pending_confirmation: {
            label: 'Chờ Xác Nhận',
            color: 'orange',
            step: 0
        },
        confirmed: {
            label: 'Đã Xác Nhận',
            color: 'blue',
            step: 1
        },
        shipping: {
            label: 'Đang Vận Chuyển',
            color: 'processing',
            step: 2
        },
        completed: {
            label: 'Hoàn Thành',
            color: 'green',
            step: 3
        },
        cancelled: {
            label: 'Đã Hủy',
            color: 'red',
            step: -1
        }
    },
    TRANSFER: {
        pending_payment: {
            label: 'Chờ Thanh Toán',
            color: 'orange',
            step: 0
        },
        paid_pending_confirmation: {
            label: 'Đã Thanh Toán Thành Công Chờ Xác Nhận',
            color: 'orange',
            step: 1
        },
        confirmed: {
            label: 'Đã Xác Nhận',
            color: 'blue',
            step: 2
        },
        shipping: {
            label: 'Đang Vận Chuyển',
            color: 'processing',
            step: 3
        },
        completed: {
            label: 'Hoàn Thành',
            color: 'green',
            step: 4
        },
        cancelled: {
            label: 'Đã Hủy',
            color: 'red',
            step: -1
        }
    }
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    
    useEffect(() => {
        const getDataByUserId = async () => {
            try {
                const res = await axiosInstance.get(`/orders/id/${id}`);
                setOrder(res.data.order);
            } catch (error) {
                console.error(error);
                message.error('Không thể tải chi tiết đơn hàng');
            }
        }
        getDataByUserId();
    }, [id]);

    const handleGoBack = () => {
        navigate('/orders');
    };

    const showPaymentModal = () => {
        setIsPaymentModalVisible(true);
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePaymentConfirm = async () => {
        if (!paymentMethod) {
            message.warning('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            await axiosInstance.post(`/orders/${id}/payment`, {
                paymentMethod: paymentMethod
            });

            message.success('Thanh toán thành công');
            
            // Refresh order data
            const res = await axiosInstance.get(`/orders/id/${id}`);
            setOrder(res.data.order);
            
            setIsPaymentModalVisible(false);
        } catch (error) {
            console.error('Payment error:', error);
            message.error('Thanh toán thất bại. Vui lòng thử lại.');
        }
    };

    const renderOrderStatus = () => {
        const statusInfo = ORDER_STATUS_MAP[order.paymentMethod][order.status] || {};
        return (
            <Tag color={statusInfo.color} style={{ fontSize: '16px', padding: '5px 10px', marginTop: '20px' }}>
                {statusInfo.label || order.status}
            </Tag>
        );
    };

    const renderProductCard = (item, index) => {
        const itemTotal = item.price * item.quantity;
        return (
            <Card 
                key={index} 
                className="mb-4"
                hoverable
            >
                <div className="flex items-center space-x-6">
                    <Image 
                        width={120} 
                        height={120} 
                        src={item.images[0]} 
                        className="object-cover rounded"
                    />
                    <div className="flex-grow">
                        <Text strong className="text-lg block mb-2">
                            {item.name}
                        </Text>
                        <div className="space-y-1">
                            <Text>Màu: <span style={{ color: item.color === 'Xanh Dương' ? 'blue' : 'black' }}>{item.color}</span></Text>
                            <Text className="block">
                                Số Lượng: {item.quantity}
                            </Text>
                            <div className="flex justify-between">
                                <Text strong>
                                    Đơn Giá: {item.price.toLocaleString()}đ
                                </Text>
                                <Text strong className="text-green-600 text-lg">
                                    Thành Tiền: {itemTotal.toLocaleString()}đ
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const renderOrderTracking = () => {
        const statusInfo = ORDER_STATUS_MAP[order.paymentMethod][order.status] || {};
        console.log('statusInfo:', statusInfo);
        const currentStep = statusInfo.step;
        console.log('currentStep:', currentStep);

        let steps = [];
        if (order.paymentMethod == 'TRANSFER') {
            steps = [
                {
                    title: 'Chờ Thanh Toán',
                    description: 'Đơn hàng chưa được thanh toán',
                    icon: <ClockCircleOutlined />,
                    successTitle: 'Đã Thanh Toán',
                    successDescription: 'Đơn hàng đã được thanh toán'

                },
                {
                    title: 'Chờ Xác Nhận',
                    description: 'Đơn hàng đang chờ được xác nhận',
                    icon: <ClockCircleOutlined />,
                    successTitle: 'Đã Xác Nhận',
                    successDescription: 'Đơn hàng đã được xác nhận'
                },
                {
                    title: 'Tìm Đơn Vị Vận Chuyển',
                    description: 'Đơn hàng đã được xác nhận',
                    icon: <ClockCircleOutlined />,
                    successTitle: 'Đã Xác Nhận',
                    successDescription: 'Đơn hàng đã được xác nhận'
                },
                {
                    title: 'Đang Vận Chuyển',
                    description: 'Đơn hàng đang được giao',
                    icon: <SendOutlined />,
                    successTitle: 'Đã Giao Hàng',
                    successDescription: 'Đơn hàng đã giao thành công'
                },
                {
                    title: 'Hoàn Thành',
                    description: 'Đơn hàng đã giao thành công',
                    icon: <CheckCircleOutlined />,
                    successTitle: 'Hoàn Thành',
                    successDescription: 'Đơn hàng đã hoàn thành'
                }
            ];
        } else {
            steps = [
                {
                    title: 'Chờ Xác Nhận',
                    description: 'Đơn hàng đang chờ được xác nhận',
                    icon: <ClockCircleOutlined />,
                    successTitle: 'Đã Xác Nhận',
                    successDescription: 'Đơn hàng đã được xác nhận'
                },
                {
                    title: 'Tìm Đơn Vị Vận Chuyển',
                    description: 'Đơn hàng đã được xác nhận',
                    icon: <ClockCircleOutlined />,
                    successTitle: 'Đã Xác Nhận',
                    successDescription: 'Đơn hàng đã được xác nhận'
                },
                {
                    title: 'Đang Vận Chuyển',
                    description: 'Đơn hàng đang được giao',
                    icon: <SendOutlined />,
                    successTitle: 'Đã Giao Hàng',
                    successDescription: 'Đơn hàng đã giao thành công'
                },
                {
                    title: 'Hoàn Thành',
                    description: 'Đơn hàng đã giao thành công',
                    icon: <CheckCircleOutlined />,
                    successTitle: 'Hoàn Thành',
                    successDescription: 'Đơn hàng đã hoàn thành'
                }

            ]
        }

        return (
            <Card title="Trạng Thái Đơn Hàng" className="mb-6">
                <Steps 
                    current={currentStep} 
                    status={order.status === 'cancelled' ? 'error' : 'process'}
                >
                    {steps.map((step, index) => (
                        <Steps.Step 
                            key={index} 
                            title={index >= currentStep ? step.title: step.successTitle} 
                            description={index >= currentStep ? step.description: step.successDescription}
                            icon={step.icon}
                        />
                    ))}
                </Steps>
            </Card>
        );
    };

    const renderPaymentModal = () => (
        <Modal
            title="Thanh Toán Đơn Hàng"
            visible={isPaymentModalVisible}
            onOk={handlePaymentConfirm}
            onCancel={() => setIsPaymentModalVisible(false)}
            okText="Xác Nhận Thanh Toán"
            cancelText="Hủy"
        >
            <div className="mb-4">
                <Title level={4}>Chọn Phương Thức Thanh Toán</Title>
                <Radio.Group 
                    onChange={handlePaymentMethodChange} 
                    value={paymentMethod}
                    className="w-full"
                >
                    <Space direction="vertical" className="w-full">
                        <Radio value="TRANSFER" className="w-full">
                            <div className="flex items-center">
                                <CreditCardOutlined className="mr-2" />
                                Chuyển Khoản Ngân Hàng
                            </div>
                        </Radio>
                        <Radio value="CREDIT_CARD" className="w-full">
                            <div className="flex items-center">
                                <CreditCardOutlined className="mr-2" />
                                Thanh Toán Bằng Thẻ Tín Dụng
                            </div>
                        </Radio>
                        <Radio value="COD" className="w-full">
                            <div className="flex items-center">
                                <CreditCardOutlined className="mr-2" />
                                Thanh Toán Khi Nhận Hàng (COD)
                            </div>
                        </Radio>
                    </Space>
                </Radio.Group>
            </div>
            <div className="bg-blue-50 p-3 rounded">
                <Text type="secondary">
                    Tổng Thanh Toán: 
                    <Text strong className="ml-2 text-green-600 text-lg">
                        {order.totalPrice.toLocaleString()}đ
                    </Text>
                </Text>
            </div>
        </Modal>
    );

    if (!order) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <div className="flex justify-between items-center mb-6">
                    <Space>
                        <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined />} 
                            onClick={handleGoBack}
                        >
                            Quay Lại
                        </Button>
                        <Title level={3} className="mb-0">
                            <FileTextOutlined className="mr-2 text-blue-500" />
                            Chi Tiết Đơn Hàng #{order._id}
                        </Title>
                    </Space>
                    <Button 
                        icon={<PrinterOutlined />} 
                        onClick={() => window.print()}
                    >
                        In Hóa Đơn
                    </Button>
                </div>

                {renderOrderTracking()}

                {order.status === "pending_payment" && order.paymentMethod !== 'COD' &&(
                    <Alert 
                        message="Đơn hàng chưa được thanh toán"
                        description="Vui lòng thanh toán để hoàn tất đơn hàng"
                        type="warning"
                        showIcon
                        action={
                            <Button 
                                size="small" 
                                type="primary" 
                                onClick={showPaymentModal}
                            >
                                Thanh Toán Ngay
                            </Button>
                        }
                        className="mb-4"
                    />
                )}

                {order.isPaid && (
                    <Alert 
                        message="Đã Thanh Toán" 
                        type="success" 
                        showIcon 
                        className="mb-4"
                    />
                )}

                {/* Order Status */}
                <div className="mb-4 text-center">
                    {renderOrderStatus()}
                </div>

                {/* Order Information */}
                <Descriptions 
                    bordered 
                    column={{ xs: 1, sm: 2, md: 2 }} 
                    className="mb-6"
                >
                    <Descriptions.Item label="Mã Đơn Hàng">
                        <Text strong>#{order._id}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày Đặt">
                        {new Date(order.createdAt).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương Thức Thanh Toán">
                        {order.paymentMethod || 'Chưa Thanh Toán'}
                    </Descriptions.Item>
                </Descriptions>

                {/* Shipping Information */}
                <Card 
                    title="Thông Tin Giao Hàng" 
                    className="mb-6"
                    headStyle={{ backgroundColor: '#f0f2f5', fontWeight: 'bold' }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center mb-2">
                                <HomeOutlined className="mr-2 text-blue-500" />
                                <Text strong>
                                    Họ và Tên: {order.address.firstName} {order.address.lastName}
                                </Text>
                            </div>
                            <div className="flex items-center mb-2">
                                <PhoneOutlined className="mr-2 text-green-500" />
                                <Text>Điện Thoại: {order.address.phone}</Text>
                            </div>
                            <div className="flex items-center mb-2">
                                <MailOutlined className="mr-2 text-red-500" />
                                <Text>Email: {order.address.email}</Text>
                            </div>
                        </div>
                        <div>
                            <Paragraph strong className="mb-1">
                                Địa Chỉ Chi Tiết:
                            </Paragraph>
                            <Paragraph>
                                {order.address.addressLine1}, 
                                {` ${order.address.ward}, `}
                                {` ${order.address.district}, `}
                                {` ${order.address.province}`}
                            </Paragraph>
                        </div>
                    </div>
                </Card>

                {/* Product Details */}
                <Divider orientation="left">
                    <Title level={4}>Chi Tiết Sản Phẩm</Title>
                </Divider>

                {order.items.map(renderProductCard)}

                {/* Total Price */}
                <div className="text-right mt-6 pt-4 border-t">
                    <div className="flex justify-between">
                        <Text strong className="text-lg">
                            Tổng Số Lượng: {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                        </Text>
                        <div>
                            <Text strong className="text-xl mr-4">
                                Tổng Cộng:
                            </Text>
                            <Text strong className="text-2xl text-green-600">
                                {order.totalPrice.toLocaleString()}đ
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            {renderPaymentModal()}
        </div>
    );
};

export default OrderDetailPage;