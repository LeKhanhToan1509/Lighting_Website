// Order Status Tag Component
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Input, 
  Button, 
  Tag, 
  Dropdown, 
  Menu, 
  Select, 
  DatePicker, 
  Tabs,
  Avatar,
  notification
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axiosInstance from '../../axiosInstance';

// Order Status Tag Component
const OrderStatusTag = ({ status }) => {
  const colors = {
    confirmed: 'blue',
    cancelled: 'red',
    paid_pending_confirmation: 'orange',
    completed: 'green'
  };
  
  return (
    <Tag color={colors[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
    </Tag>
  );
};

// Customer Status Tag Component
const CustomerStatusTag = ({ status }) => {
  const colors = {
    active: 'green',
    inactive: 'gray',
    new: 'blue',
    vip: 'purple',
    blocked: 'red'
  };
  
  return (
    <Tag color={colors[status] || 'default'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Tag>
  );
};

const CustomerRoleTag = ({ role }) => {
  const colors = {
    admin: 'red',
    user: 'blue',
    default: 'gray'
  };
  
  return (
    <Tag color={colors[role] || 'default'}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Tag>
  );
};

// Customer Stats Component
const CustomerStats = ({ users, orders }) => {
  const stats = [
    { 
      title: 'Total Customers', 
      value: users.length, 
      icon: <TeamOutlined />,
      color: 'blue'
    },
    { 
      title: 'Total Orders', 
      value: orders.length, 
      icon: <ShoppingOutlined />,
      color: 'green' 
    },
    { 
      title: 'Total Revenue', 
      value: `₫${orders.reduce((total, order) => total + order.totalPrice, 0).toLocaleString()}`, 
      icon: <DollarOutlined />,
      color: 'orange'
    },
  ];

  return (
    <Row gutter={16} className="mb-6">
      {stats.map((stat, index) => (
        <Col span={8} key={index}>
          <Card className="shadow-sm">
            <div className="flex items-center">
              <div className={`mr-4 p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-500`}>
                {React.cloneElement(stat.icon, { style: { fontSize: 24 } })}
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.title}</div>
                <div className="text-xl font-bold">{stat.value}</div>
               </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// Orders List Component
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const user = useSelector(state => state.auth.login.currentUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/orders/all', {
          headers: { token: `Bearer ${user.accessToken}` }
        });
        setOrders(res.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        notification.error({
          message: 'Orders Fetch Error',
          description: 'Could not load order list.'
        });
      }
    };
    fetchOrders();
  }, [user]);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      render: (id) => id.slice(-6).toUpperCase(),
    },
    {
      title: 'Customer',
      dataIndex: 'address',
      key: 'customer',
      render: (address) => `${address.firstName} ${address.lastName}`,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => method.charAt(0).toUpperCase() + method.slice(1).toLowerCase(),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `₫${price.toLocaleString()}`,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.map(item => `${item.name} (x${item.quantity})`).join(', '),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <OrderStatusTag status={status} />,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Dropdown 
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<EditOutlined />}>View Details</Menu.Item>
              <Menu.Item key="cancel" icon={<DeleteOutlined />} danger>Cancel Order</Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">Orders</div>
        <Button icon={<ExportOutlined />}>Export Orders</Button>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex space-x-2">
          <Input 
            prefix={<SearchOutlined />}
            placeholder="Search orders" 
            allowClear 
            className="w-64" 
          />
          <Select defaultValue="all" style={{ width: 150 }}>
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="paid_pending_confirmation">Pending</Select.Option>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <DatePicker.RangePicker className="w-64" />
          <Button icon={<FilterOutlined />}>More Filters</Button>
        </div>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={orders.map(order => ({...order, key: order._id}))} 
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }} 
      />
    </Card>
  );
};

// Customer List Component
const CustomerList = ({ users }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            className="mr-3"
            style={{ 
              backgroundColor: record.avatar ? undefined : '#87d068',
              verticalAlign: 'middle' 
            }}
          >
            {record.firstName[0].toUpperCase()}
          </Avatar>
          <div>
            <div className="font-medium">{`${record.firstName} ${record.lastName}`}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'Role',
      key: 'Role',
      render: (text, record) => <CustomerRoleTag role={record.role || 'user'} />
    },
    {
      title: 'Location',
      dataIndex: 'address',
      key: 'address',
      render: (address, record) => `${record.district}, ${record.province}`,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role.charAt(0).toUpperCase() + role.slice(1),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Dropdown overlay={
          <Menu>
            <Menu.Item key="1" icon={<EditOutlined />}>Edit</Menu.Item>
            <Menu.Item key="2" icon={<MailOutlined />}>Send Email</Menu.Item>
            <Menu.Item key="3" icon={<PhoneOutlined />}>Call</Menu.Item>
            <Menu.Item key="4" icon={<DeleteOutlined />} danger>Delete</Menu.Item>
          </Menu>
        }>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-medium">Customers</div>
        <div className="flex space-x-2">
          <Button type="primary" icon={<UserAddOutlined />} className="bg-blue-500">
            Add Customer
          </Button>
          <Button icon={<ExportOutlined />}>Export</Button>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div className="flex space-x-2">
          <Input 
            prefix={<SearchOutlined />}
            placeholder="Search customers..." 
            allowClear 
            className="w-64" 
          />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
            <Select.Option value="new">New</Select.Option>
            <Select.Option value="vip">VIP</Select.Option>
            <Select.Option value="blocked">Blocked</Select.Option>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <DatePicker.RangePicker className="w-64" />
          <Button icon={<FilterOutlined />}>
            More Filters
          </Button>
        </div>
      </div>
      
      <div className="mb-3">
        {selectedRowKeys.length > 0 && (
          <div className="bg-blue-50 p-2 rounded flex justify-between items-center">
            <span>{selectedRowKeys.length} customers selected</span>
            <div className="space-x-2">
              <Button size="small">Tag Selected</Button>
              <Button size="small">Send Email</Button>
              <Button size="small" danger>Delete</Button>
            </div>
          </div>
        )}
      </div>
      
      <Table 
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={users.map(u => ({...u, key: u._id, name: `${u.firstName} ${u.lastName}`}))} 
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} customers`,
        }} 
      />
    </Card>
  );
};

// Customers Page
const CustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const currentUser = useSelector(state => state.auth.login.currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          axiosInstance.get('/user/all', {
            headers: { token: `Bearer ${currentUser.accessToken}` }
          }),
          axiosInstance.get('/orders/all', {
            headers: { token: `Bearer ${currentUser.accessToken}` }
          })
        ]);
        
        setUsers(usersRes.data.users);
        setOrders(ordersRes.data.orders || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        notification.error({
          message: 'Data Fetch Error',
          description: 'Could not load customer and order statistics.'
        });
      }
    };
    
    fetchData();
  }, [currentUser]);

  return (
    <div className="customers-page p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-medium mb-2">Customers & Orders</h1>
          <p className="text-sm text-gray-500">Manage and analyze your customer base and orders</p>
        </div>
        <Select defaultValue="last30" style={{ width: 150 }}>
          <Select.Option value="last7">Last 7 days</Select.Option>
          <Select.Option value="last30">Last 30 days</Select.Option>
          <Select.Option value="last90">Last 90 days</Select.Option>
          <Select.Option value="year">This year</Select.Option>
          <Select.Option value="custom">Custom range</Select.Option>
        </Select>
      </div>
      
      <CustomerStats users={users} orders={orders} />
      
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Customers" key="1">
          <CustomerList users={users} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Orders" key="2">
          <OrderList />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CustomersPage;