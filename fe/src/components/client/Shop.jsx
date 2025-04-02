import React, { useState, useEffect } from 'react';
import { Card, Badge, message, Button, Row, Col } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { addToCart } from '../../redux/apiRequest';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addProductToWishList, deleteProductFromWishList } from '../../redux/apiRequest';
import { useSelector } from 'react-redux';
import axiosInstance from '../../axiosInstance';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await axiosInstance.get('/product/all', {}, {
        headers: {
          'token': `Bearer ${user.accessToken}`
        }
      });
      setProducts(res.data.products.reverse());
    };
    fetchProducts();
  }, []);

  const colorStyles = {
    blue: "bg-blue-500",
    gold: "bg-yellow-500",
    grey: "bg-gray-500",
    white: "bg-gray-100"
  };

  const add = (product) => {
    addToCart(product, dispatch);
  };

  const toggleWishlist = (product) => {
    if (wishlist.find((item) => item._id === product._id)) {
      deleteProductFromWishList(product, dispatch);
      message.info('Đã xóa khỏi danh sách yêu thích!');
    } else {
      addProductToWishList(product, dispatch);
      message.success('Đã thêm vào danh sách yêu thích!');
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const ProductCard = ({ product }) => {
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative">
          <Link to='/product_detail'>
            <img
              src={product.images[selectedColorIndex]}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
              }}
            />
          </Link>
          <button 
            onClick={() => toggleWishlist(product)}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
          >
            {wishlist.find((item) => item._id === product._id) ? 
              <HeartFilled className="text-red-500 text-lg" /> : 
              <HeartOutlined className="text-gray-500 text-lg" />}
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <p className="text-lg font-bold text-gray-900 mb-3">{product.price.toLocaleString()}đ</p>
        
        <div className="flex space-x-2 mb-3">
          {product.colors.map((color, index) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${selectedColorIndex === index ? 'border-blue-600' : 'border-gray-200'} ${colorStyles[color]}`}
              onClick={() => setSelectedColorIndex(index)}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
        
        <Button 
          type="primary" 
          icon={<ShoppingCartOutlined />}
          onClick={() => add({...product, color: product.colors[selectedColorIndex]})}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Thêm vào giỏ
        </Button>
      </div>
    </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cửa hàng</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Danh mục sản phẩm</h2>
        <div className="flex overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tất cả
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${selectedCategory === 'Ceiling Lights' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedCategory('Ceiling Lights')}
          >
            Đèn trần
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${selectedCategory === 'Table Lamps' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedCategory('Table Lamps')}
          >
            Đèn bàn
          </button>
          <button
            className={`px-4 py-2 mr-2 rounded-md whitespace-nowrap ${selectedCategory === 'Wall Lights' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
            onClick={() => setSelectedCategory('Wall Lights')}
          >
            Đèn tường
          </button>
        </div>
      </div>
      
      <Row gutter={[16, 16]}>
        {filteredProducts.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
              <ProductCard product={product} />
          </Col>
        ))}
      </Row>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp với danh mục đã chọn.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;