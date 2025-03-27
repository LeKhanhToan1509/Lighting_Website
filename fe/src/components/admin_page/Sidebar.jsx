import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  UserOutlined,
  LineChartOutlined,
  SearchOutlined,
  FileOutlined,
  AppstoreOutlined,
  GiftOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Assuming you're using React Router

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={80}
      className="bg-orange-500 min-h-screen fixed left-0 top-0 bottom-0"
    >
      <div className="logo p-4 text-center">
        <Link to="/">
          <div className="text-white text-xl font-bold">Lumo</div>
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        className="bg-orange-500 border-r-0 mt-6"
      >
        <Menu.Item key="1" icon={<div className="bg-orange-600 p-2 rounded-lg"><HomeOutlined className="text-orange-500" /></div>}>
          <Link to="/admin/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<div className="bg-orange-600 p-2 rounded-lg"><FileTextOutlined className="text-white" /></div>}>
          <Link to="/admin/orders">Orders</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<div className="bg-orange-600 p-2 rounded-lg"><ShoppingOutlined className="text-white" /></div>}>
          <Link to="/admin/products">Products</Link>
        </Menu.Item>
        <Menu.Item key="4" icon={<div className="bg-orange-600 p-2 rounded-lg"><UserOutlined className="text-white" /></div>}>
          <Link to="/admin/customers">Customers</Link>
        </Menu.Item>
        <Menu.Item key="7" icon={<div className="bg-orange-600 p-2 rounded-lg"><AppstoreOutlined className="text-white" /></div>}>
          <Link to="/">Apps</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;