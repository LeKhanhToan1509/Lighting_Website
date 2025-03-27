import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Tag, 
  Image, 
  message, 
  Popconfirm, 
  Form, 
  Input, 
  Descriptions,
  Typography,
  DatePicker,
  Space
} from 'antd';
import { 
  EyeOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  SearchOutlined,
  CloseOutlined as ClearIcon
} from '@ant-design/icons';

import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return 'Không có thông tin';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Status mapping for order statuses
const statusMap = {
  'pending_payment': { color: 'default', text: 'Chờ Thanh Toán' },
  'paid_pending_confirmation': { color: 'orange', text: 'Đã Thanh Toán Chờ Xác Nhận' },
  'pending_confirmation': { color: 'orange', text: 'Chờ Xác Nhận' },
  'confirmed': { color: 'green', text: 'Đã Xác Nhận' },
  'shipping': { color: 'blue', text: 'Đang Vận Chuyển' },
  'completed': { color: 'green', text: 'Hoàn Thành' },
  'cancelled': { color: 'red', text: 'Đã Hủy' }
};

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [dateRange, setDateRange] = useState(null);
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const user = useSelector(state => state.auth.login.currentUser);

  const filterOrders = () => {
    let result = orders;

    if (customerNameSearch) {
      result = result.filter(order => {
        const fullName = `${order.address.firstName} ${order.address.lastName}`.toLowerCase();
        return fullName.includes(customerNameSearch.toLowerCase());
      });
    }

    if (orderIdSearch) {
      result = result.filter(order => 
        order._id.substr(-6).includes(orderIdSearch)
      );
    }

    if (dateRange) {
      const [start, end] = dateRange;
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
    }

    setFilteredOrders(result);
  };

  useEffect(() => {
    filterOrders();
  }, [customerNameSearch, orderIdSearch, dateRange]);

  const renderOrderStatusTag = (status) => {
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const canRejectOrder = (order) => {
    const allowedStatuses = ['pending_payment', 'pending_confirmation'];
    return order && allowedStatuses.includes(order.status);
  };

  const canConfirmOrder = (order) => {
    const allowedStatuses = ['pending_payment', 'pending_confirmation', 'paid_pending_confirmation'];
    return order && allowedStatuses.includes(order.status);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredOrders.map(order => ({
        'Mã Đơn Hàng': order._id.substr(-6),
        'Khách Hàng': `${order.address.firstName} ${order.address.lastName}`,
        'Tổng Tiền': order.totalPrice,
        'Phương Thức Thanh Toán': order.paymentMethod,
        'Thời Gian Đặt Hàng': formatDate(order.createdAt),
        'Trạng Thái': statusMap[order.status]?.text || order.status
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đơn Hàng');
    
    XLSX.writeFile(workbook, `DonHang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleConfirmOrder = async (values) => {
    try {
      if (!canConfirmOrder(selectedOrder)) {
        Modal.error({
          title: 'Không Thể Xác Nhận Đơn Hàng',
          content: 'Trạng thái đơn hàng hiện tại không cho phép xác nhận.',
          okText: 'Đóng'
        });
        return;
      }

      await axiosInstance.post(`orders/update/${selectedOrder._id}`, {
        ...selectedOrder,
        status: 'confirmed',
        adminNote: values.adminNote || 'Đã xác nhận đơn hàng thành công'
      }, {
        headers: {
          token: `Bearer ${user.accessToken}`
        }
      });

      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, status: 'confirmed' } 
          : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      
      message.success({
        content: 'Đơn hàng đã được xác nhận thành công',
        duration: 2
      });
      
      setIsConfirmModalVisible(false);
      setIsDetailsModalVisible(false);
    } catch (error) {
      message.error({
        content: 'Có lỗi xảy ra khi xác nhận đơn hàng',
        duration: 2
      });
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (values) => {
    try {
      if (!canRejectOrder(selectedOrder)) {
        Modal.error({
          title: 'Không Thể Từ Chối Đơn Hàng',
          content: 'Trạng thái đơn hàng hiện tại không cho phép từ chối.',
          okText: 'Đóng'
        });
        return;
      }

      await axiosInstance.post(`orders/update/${selectedOrder._id}`, {
        ...selectedOrder,
        status: 'cancelled',
        adminRejectNote: values.adminRejectNote || 'Đơn hàng đã bị từ chối không rõ lý do'
      }, {
        headers: {
          token: `Bearer ${user.accessToken}`
        }
      });

      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, status: 'cancelled' } 
          : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      
      message.success({
        content: 'Đơn hàng đã bị từ chối',
        duration: 2
      });
      
      setIsRejectModalVisible(false);
      setIsDetailsModalVisible(false);
    } catch (error) {
      message.error({
        content: 'Có lỗi xảy ra khi từ chối đơn hàng',
        duration: 2
      });
    }
  };

  // Show order details modal
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã Đơn Hàng',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <Text code>{id.substr(-6)}</Text>,
      sorter: (a, b) => a._id.localeCompare(b._id)
    },
    {
      title: 'Khách Hàng',
      render: (record) => `${record.address.firstName} ${record.address.lastName}`,
      sorter: (a, b) => {
        const nameA = `${a.address.firstName} ${a.address.lastName}`;
        const nameB = `${b.address.firstName} ${b.address.lastName}`;
        return nameA.localeCompare(nameB);
      }
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalPrice',
      render: (price) => `₫${price.toLocaleString()}`,
      sorter: (a, b) => a.totalPrice - b.totalPrice
    },
    {
      title: 'Phương Thức Thanh Toán',
      dataIndex: 'paymentMethod',
      render: (method) => method.toUpperCase()
    },
    {
      title: 'Thời Gian Đặt Hàng',
      dataIndex: 'createdAt',
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      render: renderOrderStatusTag,
      filters: Object.keys(statusMap).map(status => ({
        text: statusMap[status].text,
        value: status
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hành Động',
      render: (record) => (
        <div className="flex space-x-2">
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => showOrderDetails(record)}
          >
            Xem Chi Tiết
          </Button>
        </div>
      )
    }
  ];

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await axiosInstance.get('/orders/all');
        setOrders(orderData.data.orders);
        setFilteredOrders(orderData.data.orders);
      } catch (error) {
        message.error({
          content: 'Có lỗi xảy ra khi lấy dữ liệu đơn hàng',
          duration: 2
        });
      }
    };
    fetchOrders();
  }, []);

  // Date range filter handler
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    
    if (dates) {
      const [start, end] = dates;
      const filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start && orderDate <= end;
      });
      setFilteredOrders(filtered);
    } else {
      // If no date range selected, show all orders
      setFilteredOrders(orders);
    }
  };

  return (
    <div className="admin-order-management p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản Lý Đơn Hàng</h1>
      
      <Space className="mb-4" direction="horizontal" wrap>
        <Input 
          placeholder="Tìm theo tên khách hàng" 
          value={customerNameSearch}
          onChange={(e) => setCustomerNameSearch(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
          suffix={customerNameSearch && (
            <ClearIcon 
              onClick={() => setCustomerNameSearch('')} 
              style={{ cursor: 'pointer' }} 
            />
          )}
        />
        
        <Input 
          placeholder="Tìm theo mã đơn hàng" 
          value={orderIdSearch}
          onChange={(e) => setOrderIdSearch(e.target.value)}
          style={{ width: 200 }}
          prefix={<SearchOutlined />}
          suffix={orderIdSearch && (
            <ClearIcon 
              onClick={() => setOrderIdSearch('')} 
              style={{ cursor: 'pointer' }} 
            />
          )}
        />
        
        <RangePicker 
          onChange={(dates) => {
            setDateRange(dates);
          }}
          placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
          value={dateRange}
          allowClear
        />
        
        <Button 
          icon={<FileExcelOutlined />} 
          onClick={exportToExcel}
        >
          Xuất Excel
        </Button>
      </Space>
      
      <Table 
        columns={columns} 
        dataSource={filteredOrders} 
        loading={loading}
        rowKey="_id"
        pagination={{ 
          pageSize: 10, 
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`
        }}
        className="shadow-md rounded-lg"
      />

      {/* Order Details Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <span>Chi Tiết Đơn Hàng</span>
            <Text code>#{selectedOrder?._id.substr(-6)}</Text>
          </div>
        }
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        width={800}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>
            In Đơn Hàng
          </Button>,
          canRejectOrder(selectedOrder || {}) && (
            <Button 
              key="reject" 
              danger 
              icon={<CloseCircleOutlined />}
              onClick={() => setIsRejectModalVisible(true)}
            >
              Từ Chối
            </Button>
          ),
          canConfirmOrder(selectedOrder || {}) && (
            <Button 
              key="confirm" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => setIsConfirmModalVisible(true)}
            >
              Xác Nhận
            </Button>
          )
        ]}
      >
        {selectedOrder && (
          <>
            <Descriptions 
              bordered 
              column={2} 
              className="mb-4"
            >
              <Descriptions.Item label="Khách Hàng">
                {selectedOrder.address.firstName} {selectedOrder.address.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.address.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số Điện Thoại">
                {selectedOrder.address.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa Chỉ">
                {selectedOrder.address.addressLine1}
              </Descriptions.Item>
              <Descriptions.Item label="Phương Thức Thanh Toán">
                {selectedOrder.paymentMethod.toUpperCase()}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng Thái">
                {renderOrderStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời Gian Đặt Hàng">
                {formatDate(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi Chú">
                {selectedOrder.note
                  ? selectedOrder.note
                  : 'Không có ghi chú'
                }
              </Descriptions.Item>
            </Descriptions>

            <Table 
              columns={[
                {
                  title: 'Sản Phẩm',
                  render: (record) => (
                    <div className="flex items-center">
                      <Image 
                        src={record.images[0]} 
                        width={50} 
                        height={50} 
                        className="mr-2 object-cover"
                      />
                      {record.name}
                    </div>
                  )
                },
                {
                  title: 'Màu Sắc',
                  dataIndex: 'color'
                },
                {
                  title: 'Số Lượng',
                  dataIndex: 'quantity'
                },
                {
                  title: 'Giá',
                  render: (record) => `₫${record.price.toLocaleString()}`
                }
              ]}
              dataSource={selectedOrder.items}
              pagination={false}
              summary={(pageData) => {
                const totalPrice = pageData.reduce((total, item) => total + (item.price * item.quantity), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3}>Tổng Cộng</Table.Summary.Cell>
                    <Table.Summary.Cell>₫{totalPrice.toLocaleString()}</Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </>
        )}
      </Modal>

      {/* Confirm Order Modal */}
      <Modal
        title="Xác Nhận Đơn Hàng"
        visible={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        footer={null}
      >
        <Form
          form={confirmForm}
          layout="vertical"
          onFinish={handleConfirmOrder}
        >
          <Form.Item 
            name="adminNote" 
            label="Ghi Chú Của Quản Trị Viên (Tùy Chọn)"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập ghi chú về đơn hàng (nếu có)"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => setIsConfirmModalVisible(false)}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
            >
              Xác Nhận Đơn Hàng
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Reject Order Modal */}
      <Modal
        title="Từ Chối Đơn Hàng"
        visible={isRejectModalVisible}
        onCancel={() => {
          setIsRejectModalVisible(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectOrder}
        >
          <Form.Item 
            name="adminRejectNote" 
            label="Lý Do Từ Chối"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập lý do từ chối đơn hàng'
              }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập lý do chi tiết cho việc từ chối đơn hàng"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setIsRejectModalVisible(false);
                rejectForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              danger
              htmlType="submit"
              icon={<CloseCircleOutlined />}
            >
              Xác Nhận Từ Chối
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdersTable;