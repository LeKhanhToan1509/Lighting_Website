import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const statsData = [
  { title: 'Total Sales', value: '$2,456', icon: <ShoppingOutlined style={{ color: '#ff6b00' }} /> },
  { title: 'Total Expenses', value: '$3,326', icon: <ShoppingOutlined style={{ color: '#8e44ad' }} /> },
  { title: 'Total Visitors', value: '5,325', icon: <UserOutlined style={{ color: '#2ecc71' }} /> },
  { title: 'Total Orders', value: '1,326', icon: <FileTextOutlined style={{ color: '#9b59b6' }} /> },
];

const StatsCards = () => {
  return (
    <Row gutter={16} className="mb-6">
      {statsData.map((stat, index) => (
        <Col span={6} key={index}>
          <Card bordered={false} className="rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="mr-4 p-3 rounded-full bg-gray-100">
                {stat.icon}
              </div>
              <div>
                <div className="text-gray-500 text-sm">{stat.title}</div>
                <div className="text-xl font-bold">{stat.value}</div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default StatsCards;

