import React from 'react';
import { Card, Row, Col, Button, Table, Progress } from 'antd';
import { AreaChartOutlined, RightOutlined } from '@ant-design/icons';

const StatsCard = ({ title, value, percent, trend, color }) => {
  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
        <div className={`flex items-center text-${color}-500`}>
          <span className={`${trend === 'up' ? 'text-green-500' : 'text-red-500'} text-xs font-medium`}>
            {percent}%
          </span>
          <div className="ml-2">
            {trend === 'up' ? (
              <svg width="60" height="24" viewBox="0 0 60 24">
                <path
                  d="M1,16 L10,8 L20,18 L30,4 L40,12 L50,6 L59,16"
                  fill="none"
                  stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg width="60" height="24" viewBox="0 0 60 24">
                <path
                  d="M1,8 L10,16 L20,6 L30,18 L40,10 L50,14 L59,6"
                  fill="none"
                  stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const SectionHeader = ({ title, hasMore = true }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-base font-medium">{title}</h2>
      {hasMore && (
        <Button type="text" size="small" className="flex items-center">
          More <RightOutlined className="text-xs ml-1" />
        </Button>
      )}
    </div>
  );
};

const BarChart = () => {
  const data = [
    { value: 40, color: 'orange' },
    { value: 60, color: 'orange' },
    { value: 30, color: 'orange' },
    { value: 70, color: 'red' },
    { value: 40, color: 'orange' },
    { value: 20, color: 'orange' },
    { value: 50, color: 'orange' },
    { value: 80, color: 'orange' },
    { value: 30, color: 'orange' },
    { value: 60, color: 'orange' },
    { value: 40, color: 'orange' },
    { value: 70, color: 'orange' },
  ];

  return (
    <div className="flex items-end justify-between h-48 w-full mt-6">
      {data.map((item, index) => (
        <div 
          key={index} 
          className={`w-4 bg-${item.color}-500`} 
          style={{ height: `${item.value}%` }}
        ></div>
      ))}
    </div>
  );
};
const CircleProgress = ({ percent }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Progress
        type="circle"
        percent={percent}
        width={120}
        strokeColor="#6366f1"
        strokeWidth={6}
        className="mb-6"
      />
      <div className="text-center">
        <p className="text-sm text-gray-500">Abandoned Cart</p>
        <p className="text-sm font-medium">126</p>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">Abandoned Revenue</p>
        <p className="text-sm font-medium">$2,850</p>
      </div>
    </div>
  );
};

const BestsellersTable = () => {
  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full mr-2 bg-${record.color}-500`}></div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Sold',
      dataIndex: 'sold',
      key: 'sold',
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
    },
  ];

  const data = [
    { key: '1', product: 'Basic sneakers', price: '$32.00', sold: 498, profit: '$859.87', color: 'gray' },
    { key: '2', product: 'Walking shoes', price: '$53.45', sold: 350, profit: '$926.00', color: 'blue' },
    { key: '3', product: 'Blue sneakers', price: '$58.20', sold: 783, profit: '$912.03', color: 'red' },
    { key: '4', product: 'Formatting & Clean', price: '$15.75', sold: 648, profit: '$507.97', color: 'green' },
  ];

  return <Table columns={columns} dataSource={data} pagination={false} size="small" />;
};

const TrafficStats = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <SectionHeader title="Traffic" />
      <div className="flex justify-between">
        <div>
          <div className="flex items-center">
            <span className="text-green-500 text-xs mr-1">+25%</span>
            <span className="text-xl font-bold">8050</span>
          </div>
          <p className="text-xs text-gray-500">Online Visitors</p>
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-red-500 text-xs mr-1">-65%</span>
            <span className="text-xl font-bold">1520</span>
          </div>
          <p className="text-xs text-gray-500">Offline Visitors</p>
        </div>
      </div>
      <div className="my-4">
        <p className="text-xs text-gray-500">SEE THE REPORT FOR MORE DETAILS</p>
      </div>
      <div className="mt-4 h-24">
        <svg width="100%" height="100%" viewBox="0 0 100 24">
          <path
            d="M0,12 C5,10 10,18 15,16 C20,14 25,4 30,6 C35,8 40,22 45,20 C50,18 55,8 60,6 C65,4 70,10 75,12 C80,14 85,16 90,14 C95,12 100,6 100,4"
            fill="none"
            stroke="#ff9800"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

// SalesForecast Component
const SalesForecast = () => {
  const forecasts = [
    { title: "Today's", percent: "+24.2%", trend: "up", color: "orange" },
    { title: "Yesterday's", percent: "-2.5%", trend: "down", color: "red" },
    { title: "This Week", percent: "+32.8%", trend: "up", color: "green" },
    { title: "This Month", percent: "+60%", trend: "up", color: "yellow" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <SectionHeader title="Sales forecast" />
      <Row gutter={[16, 16]}>
        {forecasts.map((forecast, index) => (
          <Col span={12} key={index}>
            <Card className="border shadow-sm" size="small">
              <p className="text-xs text-gray-500">{forecast.title}</p>
              <div className="flex items-center">
                <span className={`${forecast.trend === 'up' ? 'text-green-500' : 'text-red-500'} font-bold`}>
                  {forecast.percent}
                </span>
                <svg className="ml-2" width="60" height="24" viewBox="0 0 60 24">
                  <path
                    d={forecast.trend === 'up' ? 
                      "M1,16 L10,12 L20,14 L30,4 L40,12 L50,6 L59,10" : 
                      "M1,8 L10,12 L20,8 L30,16 L40,10 L50,14 L59,12"}
                    fill="none"
                    stroke={forecast.trend === 'up' ? '#10b981' : '#ef4444'}
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const OrdersTable = () => {
  const columns = [
    {
      title: 'Products',
      dataIndex: 'product',
      key: 'product',
      render: (text, record) => (
        <div className="flex items-center">
          <div className={`w-6 h-6 rounded-full mr-2 bg-${record.color}-500`}></div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'QTY',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Tax Paid',
      dataIndex: 'tax',
      key: 'tax',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <span 
          className={`px-2 py-1 text-xs rounded ${
            text === 'Completed' ? 'bg-green-100 text-green-600' : 
            text === 'Pending' ? 'bg-orange-100 text-orange-600' : 
            'bg-gray-100 text-gray-600'
          }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <div className="flex space-x-2">
          <Button type="text" size="small" icon={<AreaChartOutlined />} />
          <Button type="text" size="small" icon={<RightOutlined />} />
        </div>
      ),
    },
  ];

  const data = [
    { 
      key: '1', 
      product: 'Wrong Shale Gucci', 
      qty: '+3', 
      date: 'Dec 5, 2020', 
      amount: '$125.00', 
      tax: '$11.10', 
      status: 'Pending',
      color: 'gray'
    },
    { 
      key: '2', 
      product: 'Beard with benefits', 
      qty: '+3', 
      date: 'Feb 8, 2023', 
      amount: '$350.14', 
      tax: '$32.14', 
      status: 'Shipping',
      color: 'black'
    },
    { 
      key: '3', 
      product: 'iWatch Series 6', 
      qty: '+2', 
      date: 'Oct 21, 2023', 
      amount: '$175.20', 
      tax: '$20.49', 
      status: 'Completed',
      color: 'blue'
    },
    { 
      key: '4', 
      product: 'Black Sunglasses', 
      qty: '+2', 
      date: 'Aug 15, 2020', 
      amount: '$126.41', 
      tax: '$14.20', 
      status: 'Completed',
      color: 'red'
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <SectionHeader title="Latest Orders" />
      <Table columns={columns} dataSource={data} pagination={false} size="small" />
    </div>
  );
};


const DashboardContent = () => {
    return (
      <div className="dashboard-content">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-medium">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, Admin</p>
          </div>
          <div className="text-sm text-gray-500">Jan 01 - Jan 30</div>
        </div>
  
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col span={6}>
            <StatsCard title="TOTAL REVENUE" value="$7,825" percent="4.55" trend="up" color="orange" />
          </Col>
          <Col span={6}>
            <StatsCard title="TOTAL ORDERS" value="920" percent="1.25" trend="down" color="red" />
          </Col>
          <Col span={6}>
            <StatsCard title="TOTAL VISITORS" value="15.5K" percent="4.60" trend="up" color="green" />
          </Col>
          <Col span={6}>
            <StatsCard title="CONVERSION RATE" value="28%" percent="1.45" trend="up" color="orange" />
          </Col>
        </Row>
  
        {/* Cart and Chart Section */}
        <Row gutter={16} className="mb-6">
          <Col span={16}>
            <Card className="shadow-sm h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-medium">Dashboard</h2>
                <Button type="link" size="small">Advanced Report</Button>
              </div>
              <BarChart />
            </Card>
          </Col>
          <Col span={8}>
            <Card className="shadow-sm h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-base font-medium mb-4">Cart</h2>
                <CircleProgress percent={36} />
              </div>
            </Card>
          </Col>
        </Row>
  
        {/* Bestsellers and Traffic */}
        <Row gutter={16} className="mb-6">
          <Col span={16}>
            <Card className="shadow-sm">
              <SectionHeader title="Bestsellers" />
              <BestsellersTable />
            </Card>
          </Col>
          <Col span={8}>
            <TrafficStats />
          </Col>
        </Row>
  
        {/* Sales Forecast and Orders */}
        <Row gutter={16} className="mb-6">
          <Col span={16}>
            <SalesForecast />
          </Col>
        </Row>
  
        {/* Latest Orders */}
        <Row gutter={16}>
          <Col span={24}>
            <OrdersTable />
          </Col>
        </Row>
      </div>
    );
  };
  
  // We need to export all the components
  export { 
    DashboardContent,
    StatsCard,
    SectionHeader,
    BarChart,
    CircleProgress,
    BestsellersTable,
    TrafficStats,
    SalesForecast,
    OrdersTable
  };
  
  export default DashboardContent;