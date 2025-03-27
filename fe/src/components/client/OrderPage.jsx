import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Typography,
  Card,
  Image,
  Button,
  Modal,
  message,
} from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  WarningOutlined 
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosInstance";

const { Text, Title } = Typography;

const OrderPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state) => state.auth.login.currentUser);
  const userAccessToken = user?.accessToken;
  const userId = user?.acc?._id;

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!userId || !userAccessToken) {
        message.error("Vui lòng đăng nhập để xem đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/orders/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${userAccessToken}`,
          },
        });

        if (response.data && response.data.orders) {
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrderData(sortedOrders);
        } else {
          setOrderData([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        message.error("Không thể tải đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [userId, userAccessToken]);

  const showAllItems = (items) => {
    setSelectedOrderItems(items);
    setIsModalVisible(true);
  };

  const getOrderStatusInfo = (status) => {
    const statusMap = {
      pending_confirmation: {
        color: "orange",
        text: "Chờ Xác Nhận",
        icon: <ClockCircleOutlined />,
      },
      paid_pending_confirmation: {
        color: "orange",
        text: "Chờ Xác Nhận",
        icon: <ClockCircleOutlined />,
      },
      processing: {
        color: "blue",
        text: "Đang Xử Lý",
        icon: <ClockCircleOutlined />,
      },
      confirmed: {
        color: "blue",
        text: "Đã Xác Nhận",
        icon: <ClockCircleOutlined />,
      },
      shipped: {
        color: "green",
        text: "Đã Giao Hàng",
        icon: <ShoppingCartOutlined />,
      },
      pending_payment: {
        color: "red",
        text: "Chờ Thanh Toán",
        icon: <ClockCircleOutlined />,
      },
      cancelled: {
        color: "red",
        text: "Đã Hủy",
        icon: <WarningOutlined />
      },
    };
    return (
      statusMap[status] || {
        color: "default",
        text: "Không Xác Định",
        icon: null,
      }
    );
  };

  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "_id",
      key: "_id",
      width: 150,
      render: (text) => (
        <div className="flex items-center space-x-2">
          <ShoppingCartOutlined className="text-blue-500 text-lg" />
          <Text strong className="text-gray-800 text-sm tracking-wider">
            #{text.slice(-6)}
          </Text>
        </div>
      ),
    },

    {
      title: "Sản Phẩm",
      dataIndex: "items",
      key: "items",
      width: 300,
      render: (items) => {
        const displayItems = items.slice(0, 2);
        return (
          <div className="space-y-2">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white border border-gray-100 p-2 rounded-lg shadow-sm"
              >
                <Image
                  src={item.images[0]}
                  width={50}
                  height={50}
                  className="rounded-md object-cover border border-gray-100"
                  preview={false}
                />
                <div className="flex-grow">
                  <Text className="font-semibold text-gray-900 text-xs block mb-1 truncate">
                    {item.name}
                  </Text>
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>
                      Màu: <span className="font-medium">{item.color}</span>
                    </span>
                    <span>
                      SL: <span className="font-medium">{item.quantity}</span>
                    </span>
                  </div>
                  <Text className="text-green-600 font-semibold text-right text-xs block">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </Text>
                </div>
              </div>
            ))}
            {items.length > 2 && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => showAllItems(items)}
                className="w-full mt-1 text-blue-600 border-blue-600 text-xs py-1"
              >
                Xem thêm {items.length - 2} sản phẩm
              </Button>
            )}
          </div>
        );
      },
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 120,
      render: (price) => (
        <Text strong className="text-green-700 text-sm">
          {price.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 200,
      render: (status, record) => {
        const { color, text, icon } = getOrderStatusInfo(status);
        console.log(status);
        return (
          <div>
            <Tag
              icon={icon}
              color={color}
              className="font-medium px-2 py-1 rounded-full text-xs"
            >
              {text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Ngày Đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <Text className="text-gray-600 font-medium text-xs">
          {new Date(date).toLocaleDateString("vi-VN")}
        </Text>
      ),
    },
    {
      title: "Chi Tiết",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record._id}`)}
          className="flex items-center text-xs py-1 px-2 hover:border-blue-500 hover:text-blue-500"
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  // Modal for displaying all items in an order
  const renderOrderItemsModal = () => (
    <Modal
      title="Chi Tiết Sản Phẩm Trong Đơn Hàng"
      visible={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={700}
    >
      <div className="grid grid-cols-2 gap-3">
        {selectedOrderItems.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex items-center space-x-3"
          >
            <Image
              src={item.images[0]}
              width={80}
              height={80}
              className="rounded-md object-cover border border-gray-100"
              preview={false}
            />
            <div className="flex-grow">
              <Text className="font-semibold text-gray-900 text-sm block mb-2 truncate">
                {item.name}
              </Text>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Màu: <span className="font-medium">{item.color}</span>
                  </span>
                  <span>
                    Số lượng:{" "}
                    <span className="font-medium">{item.quantity}</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Giá:{" "}
                    <span className="font-medium">
                      {item.price.toLocaleString()}đ
                    </span>
                  </span>
                  <Text strong className="text-green-600 text-sm">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </Text>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Title level={3} className="mb-0 text-gray-800 font-light">
            Đơn Hàng Của Tôi
          </Title>
        </div>
        <Card className="shadow-md rounded-xl overflow-hidden" bordered={false}>
          <Table
            columns={columns}
            dataSource={orderData}
            rowKey="_id"
            loading={loading}
            locale={{
              emptyText: "Bạn chưa có đơn hàng nào",
            }}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 15],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn hàng`,
            }}
            className="w-full"
          />
        </Card>
      </div>

      {renderOrderItemsModal()}
    </div>
  );
};

export default OrderPage;
