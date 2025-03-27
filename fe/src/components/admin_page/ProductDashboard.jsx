import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message, 
  Upload, 
  Popconfirm,
  Row,
  Col,
  Image,
  Tag,
  Space
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  UploadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  EyeOutlined,
  InboxOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ProductDashboard = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImages, setPreviewImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const user = useSelector(state => state.auth.login.currentUser);
  // Modal and form states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();

  // Product Type, Category, and Color Options
  const productTypeOptions = [
    { value: 'product-selling', label: 'Selling' },
    { value: 'product-rental', label: 'Rental' }
  ];

  const categoryOptions = [
    'Ceiling Lights', 
    'Wall Lights', 
    'Table Lamps', 
    'Floor Lamps', 
    'Outdoor Lighting'
  ];

  const colorOptions = [
    'blue', 'gold', 'grey', 'white', 
    'black', 'red', 'green', 'silver'
  ];

  // Color Tag Component
  const ColorTag = ({ color }) => {
    const getTextColor = (bgColor) => {
      const lightColors = ['white', 'grey', 'silver', 'gold', 'blue'];
      return lightColors.includes(bgColor) ? 'black' : 'white';
    };
  
    const getBorderStyle = (bgColor) => {
      const lightColors = ['white', 'grey', 'silver', 'gold'];
      return lightColors.includes(bgColor) 
        ? { border: '1px solid #d9d9d9', color: 'black' }
        : {};
    };
  
    return (
      <Tag 
        color={color} 
        style={{
          ...getBorderStyle(color),
          color: getTextColor(color)
        }}
      >
        {color}
      </Tag>
    );
  };

  // Fetch products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/product/all', {
          headers: {
            token: `Bearer ${user.accessToken}`
          }
        });
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } catch(err) {
        console.error(err);
        message.error('Failed to fetch products');
      }
    };
    
    if (user?.accessToken) {
      fetchData();
    }
  }, [user]);

  // Search functionality
  const handleSearch = (value) => {
    const searchValue = value.toLowerCase();
    setSearchTerm(searchValue);
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchValue) ||
      product.category.toLowerCase().includes(searchValue)
    );
    
    setFilteredProducts(filtered);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredProducts.map(product => ({
      Name: product.name,
      Type: product.type === 'product-selling' ? 'Selling' : 'Rental',
      Category: product.category,
      Price: `$${(product.price / 100).toFixed(2)}`,
      Stock: product.stock,
      Colors: product.colors.join(', '),
      Description: product.description
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "product_list.xlsx");
  };

  // Preview images
  const handlePreviewImages = (images) => {
    console.log(images);
    setPreviewImages(images);
    setIsPreviewModalVisible(true);
  };

  // Image upload handling
  const handleImageUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      // API call to delete product
      await axiosInstance.post(`/product/delete_product/${productId}`, {
        headers: {
          token: `Bearer ${user.accessToken}`
        }
      });

      // Update local state
      const updatedProducts = products.filter(product => product._id !== productId);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      
      message.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // Add new product
  const handleAddProduct = async (values) => {
    try {
      // Prepare product data
      const formData = new FormData();
      
      // Iterate through values and append each key-value pair
      Object.keys(values).forEach(key => {
        if (key !== 'images') {
          if (key === 'colors' && Array.isArray(values[key])) {
            // If colors is an array, append each color separately
            values[key].forEach(color => {
              formData.append('colors', color);
            });
          } else {
            // For other fields, append normally
            formData.append(key, values[key]);
          }
        }
      });
  
      // Append images
      fileList.forEach(file => {
        formData.append('images', file.originFileObj);
      });
  
      // Optional: Log form data to verify
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
  
      // Send to backend
      const response = await axiosInstance.post('/product/create_product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${user.accessToken}`
        }
      });
  
      const newProduct = response.data.product;
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
  
      // Reset form and modal
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      message.success('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      message.error('Failed to add product');
    }
  };

  // Edit existing product
  const handleEditProduct = async (values) => {
    try {
      // Prepare form data
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key !== 'images') {
          formData.append(key, values[key]);
        }
      });

      // Append images
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      // Send to backend
      const response = await axiosInstance.put(`/product/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${user.accessToken}`
        }
      });

      // Update local state
      const updatedProduct = response.data.product;
      const updatedProducts = products.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      );

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

      // Reset modal and form
      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
      setFileList([]);
      message.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('Failed to update product');
    }
  };

  // Table columns configuration
  const tableColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          {name}
          {record.deletedAt && <Tag color="red" className="ml-2">Deleted</Tag>}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'product-selling' ? 'green' : 'blue'}>
          {type === 'product-selling' ? 'Selling' : 'Rental'}
        </Tag>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${(price / 100).toFixed(2)}`
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Colors',
      dataIndex: 'colors',
      key: 'colors',
      render: (colors) => (
        <Space>
          {colors.map(color => (
            <ColorTag key={color} color={color} />
          ))}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          {record.images && record.images.length > 0 && (
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => handlePreviewImages(record.images)}
            >
              Preview
            </Button>
          )}
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingProduct(record);
              form.setFieldsValue({
                ...record,
                price: record.price / 100,
                images: record.images ? record.images.map((img, index) => ({
                  uid: index,
                  name: img,
                  status: 'done',
                  url: img
                })) : []
              });
              setFileList(record.images ? record.images.map((img, index) => ({
                uid: index,
                name: img,
                status: 'done',
                url: img
              })) : []);
              setIsModalVisible(true);
            }}
            disabled={record.deletedAt}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDeleteProduct(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.deletedAt}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Content className="p-6 bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Header and Search Section */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12}>
            <h1 className="text-2xl font-bold">Product Management</h1>
          </Col>
          <Col xs={24} sm={12} className="text-right">
            <Space>
              <Input
                placeholder="Search products"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 250 }}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingProduct(null);
                  form.resetFields();
                  setFileList([]);
                  setIsModalVisible(true);
                }}
              >
                Add Product
              </Button>
              <Button 
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
              >
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Product Table */}
        <Table 
          dataSource={filteredProducts} 
          columns={tableColumns}
          rowKey="_id"
          pagination={{ 
            total: filteredProducts.length, 
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`
          }}
        />

        {/* Image Preview Modal */}
        <Modal
          title="Product Images"
          visible={isPreviewModalVisible}
          onCancel={() => setIsPreviewModalVisible(false)}
          footer={null}
          width={800}
        >
          <div className="grid grid-cols-3 gap-4">
            {previewImages.map((img, index) => (
              <Image
                key={index}
                width="100%"
                src={img}
                alt={`Product Image ${index + 1}`}
              />
            ))}
          </div>
        </Modal>

        {/* Add/Edit Product Modal */}
        <Modal
          title={editingProduct ? "Edit Product" : "Add Product"}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingProduct(null);
            form.resetFields();
            setFileList([]);
          }}
          width={800}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingProduct ? handleEditProduct : handleAddProduct}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={[{ required: true, message: 'Please input product name!' }]}
                >
                  <Input placeholder="Enter product name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Product Type"
                  rules={[{ required: true, message: 'Please select product type!' }]}
                >
                  <Select placeholder="Select product type">
                    {productTypeOptions.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category!' }]}
                >
                  <Select placeholder="Select category">
                    {categoryOptions.map(category => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: 'Please input price!' }]}
                >
                  <InputNumber 
                    formatter={value => `$ ${value}`}
                    parser={value => value.replace(/\$\s?/g, '')}
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="Enter price"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="colors"
                  label="Colors"
                  rules={[{ required: true, message: 'Please select colors!' }]}
                >
                  <Select 
                    mode="multiple" 
                    placeholder="Select colors"
                  >
                    {colorOptions.map(color => (
                      <Option key={color} value={color}>
                        {color}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label="Stock Quantity"
                  rules={[{ required: true, message: 'Please input stock quantity!' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0} 
                    placeholder="Enter stock quantity"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea 
                rows={4} 
                placeholder="Enter product description"
              />
            </Form.Item>

            <Form.Item
              name="images"
              label="Product Images"
            >
              <Dragger
                multiple
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageUpload}
                beforeUpload={() => false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to upload product images
                </p>
              </Dragger>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Content>
  );
};

export default ProductDashboard;