import React from 'react';
import { Card, Form, Input, Row, Col, Select, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const categories = [
    'Celling Light',
    'Table Lamp',
    'Floor Lamp',
    'Wall Lamp',
    'Outdoor Lamp',
    'Chandelier',
]
const AddProductForm = () => {
  return (
    <Card title="Add Products" className="rounded-lg shadow-sm">
        

      <Form layout="vertical">
        <Form.Item label="Name Product">
          <Input placeholder="Placeholder content" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Categories">
              <Select defaultValue="chose">
                {categories.map((category, index) => (
                    <Option key={index} value={category}>{category}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Pricing">
              <Input placeholder="Placeholder content" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Author">
              <Input placeholder="Placeholder content" />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Description">
          <Input placeholder="Placeholder content" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Image">
              <Upload>
                <Button icon={<PlusOutlined />}>Add images</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Description">
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
      <Button type="primary" className="">
        Add Product
      </Button>
    </Card>
  );
};

export default AddProductForm;