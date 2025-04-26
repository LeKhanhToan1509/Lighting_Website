import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Space,
  Spin,
  Empty,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import axiosInstance from '../../axiosInstance';
import { useSelector } from 'react-redux';

// Lazy load xlsx
const loadXlsx = async () => {
  const XLSX = await import('xlsx');
  return XLSX;
};

const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

// Memoized ColorTag component
const ColorTag = memo(({ color }) => {
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
        color: getTextColor(color),
      }}
    >
      {color}
    </Tag>
  );
});

// Memoized ProductFormModal component
const ProductFormModal = memo(
  ({ visible, onCancel, onSubmit, editingProduct, form, fileList, setFileList }) => {
    const productTypeOptions = [
      { value: 'product-selling', label: 'Selling' },
      { value: 'product-rental', label: 'Rental' },
    ];

    const categoryOptions = [
      'Ceiling Lights',
      'Wall Lights',
      'Table Lamps',
      'Floor Lamps',
      'Outdoor Lighting',
    ];

    const colorOptions = [
      'blue',
      'gold',
      'grey',
      'white',
      'black',
      'red',
      'green',
      'silver',
    ];

    const handleImageUpload = ({ fileList: newFileList }) => {
      console.log('Updated file list:', newFileList);
      setFileList(newFileList);
    };

    return (
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={visible}
        onCancel={onCancel}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          initialValues={{
            name: '',
            type: undefined,
            category: undefined,
            price: undefined,
            colors: [],
            stock: undefined,
            description: '',
            images: [],
          }}
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
                  {productTypeOptions.map((type) => (
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
                  {categoryOptions.map((category) => (
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
                  formatter={(value) => `$ ${value}`}
                  parser={(value) => value.replace(/\$\s?/g, '')}
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
                <Select mode="multiple" placeholder="Select colors">
                  {colorOptions.map((color) => (
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
            rules={[
              { required: true, message: 'Please enter product description!' },
              {
                min: 10,
                max: 1000,
                message: 'Description must be between 10 and 1000 characters',
              },
            ]}
          >
            <TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>

          <Form.Item name="images" label="Product Images">
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
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

const ProductDashboard = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isVisible: false,
    isPreviewVisible: false,
    editingProduct: null,
    fileList: [],
    modalLoading: false,
  });
  const [previewImages, setPreviewImages] = useState([]);
  const user = useSelector((state) => state.auth.login.currentUser);
  const [form] = Form.useForm();

  // Fetch products with pagination
  const fetchProducts = useCallback(
    async (page = 1, reset = false) => {
      if (!user?.accessToken || !hasMore) {
        console.log('Cannot fetch products: No token or no more pages');
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching page ${page} with query: ${searchTerm}`);
        const params = {
          page,
          limit: 20,
          query: searchTerm || '',
          sort: 'newest',
        };

        const response = await axiosInstance.get('/elk/search', {
          params,
          headers: {
            token: `Bearer ${user.accessToken}`,
          },
        });

        console.log('API response:', response.data);

        const { products: newProducts, page: current, pages, total } = response.data;

        if (!newProducts || newProducts.length === 0) {
          console.log('No more products returned');
          setHasMore(false);
          setLoading(false);
          return;
        }

        setTotalPages(pages || Math.ceil(total / 20));
        setTotalProducts(total || newProducts.length);
        setHasMore(current < pages || newProducts.length === 20);
        setCurrentPage(current);

        if (reset) {
          console.log('Resetting products list');
          setProducts(newProducts);
        } else {
          console.log(`Appending ${newProducts.length} new products`);
          setProducts((prev) => [...prev, ...newProducts]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        message.error('Failed to fetch products: ' + (err.response?.data?.message || err.message));
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [user, searchTerm, hasMore]
  );

  // Infinite scroll handler
  useEffect(() => {
    if (modalState.isVisible) return; // Disable scroll when modal is open

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const pageBottom = document.documentElement.offsetHeight - 200; // Increased buffer
      console.log(`Scroll position: ${scrollPosition}, Page bottom: ${pageBottom}, hasMore: ${hasMore}, loading: ${loading}`);

      if (!loading && hasMore && scrollPosition >= pageBottom) {
        console.log(`Triggering fetch for page ${currentPage + 1}`);
        fetchProducts(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, currentPage, fetchProducts, modalState.isVisible]);

  // Initial fetch and search handler
  useEffect(() => {
    if (user?.accessToken) {
      console.log('Initial fetch or search triggered');
      setCurrentPage(1);
      setHasMore(true);
      setProducts([]);
      fetchProducts(1, true);
    }
  }, [user, searchTerm, fetchProducts]);

  // Search handler
  const handleSearch = (value) => {
    console.log(`Search term updated: ${value}`);
    setSearchTerm(value);
    setCurrentPage(1);
    setHasMore(true);
    setProducts([]);
  };

  // Load more manually
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      console.log(`Manual load more triggered for page ${currentPage + 1}`);
      fetchProducts(currentPage + 1);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await loadXlsx();
      const exportData = products.map((product) => ({
        Name: product.name,
        Type: product.type === 'product-selling' ? 'Selling' : 'Rental',
        Category: product.category,
        Price: `$${(product.price / 100).toFixed(2)}`,
        Stock: product.stock,
        Colors: product.colors.join(', '),
        Description: product.description,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      XLSX.writeFile(workbook, 'product_list.xlsx');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Failed to export products');
    }
  };

  // Preview images
  const handlePreviewImages = (images) => {
    console.log('Previewing images:', images);
    setPreviewImages(images);
    setModalState((prev) => ({ ...prev, isPreviewVisible: true }));
  };

  // Add new product
  const handleAddProduct = async (values) => {
    try {
      console.log('Adding new product with values:', values);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', Number(values.price) * 100);
      formData.append('type', values.type);
      formData.append('category', values.category);
      formData.append('colors', values.colors.join(','));
      formData.append('stock', Number(values.stock));
      formData.append('description', values.description);

      modalState.fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      const response = await axiosInstance.post('/product/create_product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: `Bearer ${user.accessToken}`,
        },
        timeout: 30000,
      });

      console.log('New product added:', response.data.product);
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(1, true);
      setModalState({
        isVisible: false,
        isPreviewVisible: false,
        editingProduct: null,
        fileList: [],
        modalLoading: false,
      });
      form.resetFields();
      message.success('Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      message.error('Failed to add product: ' + (error.response?.data?.message || error.message));
    }
  };

  // Edit existing product
  const handleEditProduct = async (values) => {
    try {
      console.log('Editing product with values:', values);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('price', Number(values.price) * 100);
      formData.append('type', values.type);
      formData.append('category', values.category);
      formData.append('colors', values.colors.join(','));
      formData.append('stock', Number(values.stock));
      formData.append('description', values.description);

      modalState.fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      const response = await axiosInstance.post(
        `/product/edit_product/${modalState.editingProduct._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            token: `Bearer ${user.accessToken}`,
          },
          timeout: 30000,
        }
      );

      console.log('Product updated:', response.data.product);
      setProducts([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchProducts(1, true);
      setModalState({
        isVisible: false,
        isPreviewVisible: false,
        editingProduct: null,
        fileList: [],
        modalLoading: false,
      });
      form.resetFields();
      message.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      message.error('Failed to update product: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    try {
      await axiosInstance.delete(
        `/elk/product/${productId}`,
        {},
        {
          headers: {
            token: `Bearer ${user.accessToken}`,
          },
        }
      );
      setProducts((prev) => prev.filter((product) => product._id !== productId));
      message.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  const openProductModal = (product = null) => {
    console.log('Opening product modal, editing:', !!product);
    setModalState((prev) => ({
      ...prev,
      modalLoading: true,
    }));

    // Use setTimeout to allow state update before heavy operations
    setTimeout(() => {
      if (product) {
        form.setFieldsValue({
          ...product,
          price: product.price / 100,
          images: product.images
            ? product.images.map((img, index) => ({
                uid: index,
                name: img,
                status: 'done',
                url: img,
              }))
            : [],
        });
        setModalState((prev) => ({
          ...prev,
          isVisible: true,
          editingProduct: product,
          fileList: product.images
            ? product.images.map((img, index) => ({
                uid: index,
                name: img,
                status: 'done',
                url: img,
              }))
            : [],
          modalLoading: false,
        }));
      } else {
        form.resetFields();
        setModalState((prev) => ({
          ...prev,
          isVisible: true,
          editingProduct: null,
          fileList: [],
          modalLoading: false,
        }));
      }
    }, 0);
  };

  // Memoized table columns
  const tableColumns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name, record) => (
          <div>
            {name}
            {record.deletedAt && <Tag color="red" className="ml-2">Deleted</Tag>}
          </div>
        ),
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <Tag color={type === 'product-selling' ? 'green' : 'blue'}>
            {type === 'product-selling' ? 'Selling' : 'Rental'}
          </Tag>
        ),
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
        render: (price) => `$${(price / 100).toFixed(2)}`,
      },
      {
        title: 'Stock',
        dataIndex: 'stock',
        key: 'stock',
        render: (stock) => (
          <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock}</Tag>
        ),
      },
      {
        title: 'Colors',
        dataIndex: 'colors',
        key: 'colors',
        render: (colors) => (
          <Space>
            {colors.map((color) => (
              <ColorTag key={color} color={color} />
            ))}
          </Space>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (record) => (
          <Space>
            {record.images && record.images.length > 0 && (
              <Button icon={<EyeOutlined />} onClick={() => handlePreviewImages(record.images)}>
                Preview
              </Button>
            )}
            <Button
              icon={<EditOutlined />}
              onClick={() => openProductModal(record)}
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
              <Button danger icon={<DeleteOutlined />} disabled={record.deletedAt}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

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
                onClick={() => openProductModal()}
                loading={modalState.modalLoading}
              >
                Add Product
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
                Export
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Product Table */}
        {products.length === 0 && !loading ? (
          <Empty description="No products found" />
        ) : (
          <Table
            dataSource={products}
            columns={tableColumns}
            rowKey="_id"
            pagination={false}
            loading={loading}
          />
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center my-4">
            <Spin />
          </div>
        )}

        {/* Load More button */}
        {!loading && hasMore && products.length > 0 && (
          <div className="flex justify-center my-4">
            <Button onClick={handleLoadMore}>Load More</Button>
          </div>
        )}

        {/* No more products */}
        {!hasMore && products.length > 0 && (
          <div className="text-center my-4">
            <p>No more products to load</p>
          </div>
        )}

        {/* Image Preview Modal */}
        <Modal
          title="Product Images"
          open={modalState.isPreviewVisible}
          onCancel={() =>
            setModalState((prev) => ({ ...prev, isPreviewVisible: false }))
          }
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
        <ProductFormModal
          visible={modalState.isVisible}
          onCancel={() =>
            setModalState({
              isVisible: false,
              isPreviewVisible: false,
              editingProduct: null,
              fileList: [],
              modalLoading: false,
            })
          }
          onSubmit={modalState.editingProduct ? handleEditProduct : handleAddProduct}
          editingProduct={modalState.editingProduct}
          form={form}
          fileList={modalState.fileList}
          setFileList={(fileList) =>
            setModalState((prev) => ({ ...prev, fileList }))
          }
        />
      </div>
    </Content>
  );
};

export default ProductDashboard;