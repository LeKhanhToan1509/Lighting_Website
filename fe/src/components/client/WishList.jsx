import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Empty, Button, message } from 'antd';
import { deleteProductFromWishList, addToCart } from '../../redux/apiRequest';
import { useState } from 'react';

const Wishlist = () => {
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const dispatch = useDispatch();
  const [selectedColors, setSelectedColors] = useState({});

  const colorStyles = {
    blue: "bg-blue-500",
    gold: "bg-yellow-500",
    grey: "bg-gray-500",
    white: "bg-gray-100"
  };

  // Xử lý chọn màu sản phẩm
  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color
    }));
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = (product) => {
    const selectedColor = selectedColors[product._id] || product.colors[0]; // Mặc định màu đầu tiên
    addToCart({
      ...product,
      _id: product._id,
      color: selectedColor,
    }, dispatch);
    message.success('Đã thêm vào giỏ hàng!');
  };

  // Xử lý xóa khỏi danh sách yêu thích
  const handleRemoveFromWishlist = (product) => {
    deleteProductFromWishList(product, dispatch);
    message.info('Đã xóa khỏi danh sách yêu thích!');
  };

  if (!wishlist.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-center mb-8">Danh sách yêu thích của bạn</h1>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="text-gray-500 text-lg">Danh sách yêu thích của bạn đang trống</span>}
          >
            <Link to="/shop">
              <Button type="primary" size="large" className="mt-4">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Danh sách yêu thích</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wishlist.map(product => {
          const selectedColor = selectedColors[product._id] || product.colors[0]; // Lấy màu đã chọn hoặc mặc định màu đầu tiên

          return (
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col justify-center items-center" key={product._id}>
              <img
                src={product.images[product.colors.indexOf(selectedColor)] || product.images[0]} // Đổi ảnh theo màu
                alt={product.name}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-4">{product.name}</h3>
              <p className="text-gray-500">{product.price.toLocaleString()}đ</p>
              <div className="flex space-x-2 mb-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(product._id, color)}
                    className={`w-6 h-6 rounded-full border-2 
                      ${selectedColor === color ? 'border-blue-600 scale-110' : 'border-gray-200'} 
                      ${colorStyles[color]} transition transform duration-200`}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <Button 
                type="primary" 
                className="w-full mt-4"
                onClick={() => handleAddToCart(product)}
              >
                Thêm vào giỏ
              </Button>
              <Button 
                type="primary" 
                danger 
                className="w-full mt-2"
                onClick={() => handleRemoveFromWishlist(product)}
              >
                Xóa khỏi yêu thích
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
