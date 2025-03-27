import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '../../components/admin_page/SideBar';

const { Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      <Layout>
        <Content className="p-6 bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;