import React from 'react';
import { Table, Card, Button, Pagination } from 'antd';

const productData = Array(9).fill().map((_, index) => ({
  key: index,
  name: 'Gunnar Pendant',
  price: '$1,089',
  description: [
    'The Visual Comfort Modern, forme',
    'Commodo eget scelerisque',
    'Tortor habitant sit',
    'Quam semper quis',
    'Egestas non sociis',
    'Pellentesque facilisis massa',
    'Ut feugiat egestas',
    'Pharetra id sit',
    'Pharetra id sit'
  ][index % 9]
}));

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Descriptions',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => (
      <div className="flex space-x-2">
        <Button type="primary" size="small" className="bg-blue-500">
          Edit
        </Button>
        <Button type="primary" danger size="small">
          Delete
        </Button>
      </div>
    ),
  },
];

const ProductsTable = () => {
  return (
    <Card 
      title="All Products" 
      className="mb-6 rounded-lg shadow-sm"
      extra={<Button type="link">View All</Button>}
    >
      <p className="text-gray-500 mb-4">
        Sed tortor, sad velit ridiculus ipsum pharetra lacus odio gravida augue enim.
      </p>
      <Table 
        columns={columns} 
        dataSource={productData} 
        pagination={false} 
        className="mb-4"
      />
      <Pagination defaultCurrent={2} total={50} />
    </Card>
  );
};

export default ProductsTable;