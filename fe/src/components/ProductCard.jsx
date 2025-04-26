import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Mapping màu sắc chuẩn
const COLOR_MAP = {
  'Đỏ': '#FF0000',
  'Xanh lá': '#00FF00',
  'Xanh dương': '#0000FF',
  'Vàng': '#FFFF00',
  'Đen': '#000000',
  'Trắng': '#FFFFFF',
  'Hồng': '#FFC0CB',
  'Tím': '#800080',
  'Cam': '#FFA500',
  'Xám': '#808080',
  'Nâu': '#A52A2A',
  'Bạc': '#C0C0C0'
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const goToProductDetail = () => {
    navigate(`/product/${product._id}`);
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') + 'đ' : '0đ';
  };

  const addToCart = (e) => {
    e.stopPropagation();
    // Add to cart logic can be implemented here
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Get the first image or a placeholder
  const productImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://placehold.co/300x300/e2e8f0/64748b?text=No+Image';
    
  // Transform color names to hex codes for display
  const getColorHex = (colorName) => {
    return COLOR_MAP[colorName] || colorName;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
      onClick={goToProductDetail}
    >
      {/* Image container */}
      <div className="relative pt-[100%] overflow-hidden bg-gray-100">
        <img 
          src={productImage} 
          alt={product.name} 
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {product.stock <= 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-2 py-1 m-2 rounded">
            Hết hàng
          </div>
        )}
        
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-semibold px-2 py-1 m-2 rounded">
            Còn {product.stock} sản phẩm
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-gray-800 font-medium text-lg line-clamp-2 mb-1">{product.name}</h3>
        
        <div className="text-gray-500 text-sm mb-2 line-clamp-1">{product.category}</div>
        
        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1 mb-2">
            {product.colors.slice(0, 5).map((color, index) => (
              <div 
                key={index} 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <div className="text-xs text-gray-500 ml-1 flex items-center">
                +{product.colors.length - 5}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="text-gray-900 font-semibold">{formatPrice(product.price)}</div>
          
          <button 
            onClick={addToCart}
            disabled={product.stock <= 0}
            className={`px-3 py-1 rounded text-sm ${
              product.stock <= 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 