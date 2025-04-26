import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, InputNumber, Divider, Rate, Skeleton, notification, Badge, Tooltip } from 'antd';
import { PlusOutlined, MinusOutlined, ShoppingCartOutlined, HeartOutlined, HeartFilled, ShareAltOutlined, ZoomInOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { addToCart } from '../../redux/apiRequest';
import axiosInstance from '../../axiosInstance';

const DetailProduct = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [productId, setProductId] = useState(id);

  const sampleGalleryImages = [
    [
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1287&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1170&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534189752081-032166836210?q=80&w=1287&auto=format&fit=crop"
    ],
    [
      "https://images.unsplash.com/photo-1540932787667-95f20e59dfaf?q=80&w=1287&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558559580-0c68b21e4d9a?q=80&w=1170&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558560249-d10e4278e6d1?q=80&w=1170&auto=format&fit=crop"
    ],
    [
      "https://images.unsplash.com/photo-1558559552-2dd403185512?q=80&w=1170&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542089565-cc26e9f23f28?q=80&w=1170&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540932787227-24ec55fb45d7?q=80&w=1287&auto=format&fit=crop"
    ],
    [
      "https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?q=80&w=1287&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567459169668-95d355371bda?q=80&w=1287&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558559629-7ba337e26428?q=80&w=1170&auto=format&fit=crop"
    ]
  ];
  
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/elk/product/${productId}`);
        setProduct(response.data);
        setSelectedColorIndex(0);
        setCurrentGalleryIndex(0);
        setQuantity(1);
      } catch (error) {
        console.error('Error fetching product:', error);
        notification.error({
          message: 'Failed to load product',
          description: 'There was an error loading the product details. Please try again later.',
          placement: 'bottomRight'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);

  const handleColorChange = (index) => {
    setSelectedColorIndex(index);
    setCurrentGalleryIndex(0); // Reset gallery index when color changes
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const productToAdd = {
      ...product,
      color: product.colors[selectedColorIndex],
      quantity
    };
    
    addToCart(productToAdd, dispatch);
    
    notification.success({
      message: 'Added to Cart',
      description: `${quantity} ${product.name} added to your cart.`,
      placement: 'bottomRight',
      style: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
    });
  };

  const toggleWishlist = () => {
    setWishlist(!wishlist);
    notification.info({
      message: wishlist ? 'Removed from Wishlist' : 'Added to Wishlist',
      description: wishlist ? 'This item has been removed from your wishlist.' : 'This item has been added to your wishlist.',
      placement: 'bottomRight',
      style: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
    });
  };

  const handleShare = () => {
    notification.info({
      message: 'Share Product',
      description: 'Sharing functionality would be implemented here.',
      placement: 'bottomRight',
      style: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(price);
  };

  const handleImageMouseMove = (e) => {
    if (!zoomActive) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePosition({ x, y });
  };

  // Color mapping - you can expand this to handle more colors with better visual appearance
  const getColorStyle = (colorName) => {
    const colorMap = {
      'chrome': 'linear-gradient(145deg, #FFFFFF 0%, #D1D1D1 100%)',
      'yellow': 'linear-gradient(145deg, #FFD700 0%, #FFA500 100%)',
      'bronze': 'linear-gradient(145deg, #CD7F32 0%, #A46628 100%)',
      'gold': 'linear-gradient(145deg, #FFD700 0%, #B8860B 100%)'
    };
    
    return colorMap[colorName] || colorName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <Skeleton.Image className="w-full h-96 rounded-lg" active />
              <div className="flex gap-2 mt-4">
                {[0, 1, 2].map(i => (
                  <Skeleton.Image key={i} className="w-24 h-24 rounded-md" active />
                ))}
              </div>
            </div>
            <div className="lg:w-2/5">
              <Skeleton active paragraph={{ rows: 10 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-6">Sorry, we couldn't find the product you're looking for.</p>
          <Link to="/shop">
            <Button type="primary">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Ensure we have arrays even if the backend sends something unexpected
  const colors = Array.isArray(product.colors) ? product.colors : [];
  
  // Get the gallery for the current color
  const currentGallery = sampleGalleryImages[selectedColorIndex] || sampleGalleryImages[0] || [];
  const currentImage = currentGallery[currentGalleryIndex];
  
  // Calculate total price
  const totalPrice = product.price * quantity;
  
  // Derive the discount percentage (for UI purposes)
  const discountPercent = 15; // Example: 15% off

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link to="/shop" className="text-gray-500 hover:text-gray-700 ml-1 md:ml-2">Shop</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="text-gray-500 ml-1 md:ml-2">{product.category}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Product Gallery */}
          <div className="lg:w-3/5 space-y-6">
            {/* Main image with zoom effect */}
            <div 
              className="relative rounded-2xl overflow-hidden bg-white shadow-xl h-96 cursor-zoom-in"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={handleImageMouseMove}
              style={{ height: '500px' }}
            >
              <div 
                className={`absolute inset-0 bg-no-repeat transition-transform duration-200 ${zoomActive ? 'scale-125' : 'scale-100'}`}
                style={{
                  backgroundImage: `url(${currentImage})`,
                  backgroundPosition: zoomActive ? `${mousePosition.x}% ${mousePosition.y}%` : 'center',
                  backgroundSize: 'cover'
                }}
              />
              <div className="absolute top-4 right-4 space-x-2">
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={wishlist ? <HeartFilled /> : <HeartOutlined />} 
                  onClick={toggleWishlist}
                  className={wishlist ? 'bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600' : 'bg-white/80 backdrop-blur-sm text-gray-700 border-none hover:bg-white/90'}
                />
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<ShareAltOutlined />} 
                  onClick={handleShare}
                  className="bg-white/80 backdrop-blur-sm text-gray-700 border-none hover:bg-white/90"
                />
                <Button 
                  type="primary" 
                  shape="circle" 
                  icon={<ZoomInOutlined />} 
                  className="bg-white/80 backdrop-blur-sm text-gray-700 border-none hover:bg-white/90"
                />
              </div>
              {product.stock <= 5 && product.stock > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge count={`Only ${product.stock} left!`} style={{ backgroundColor: '#ff4d4f' }} />
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute bottom-4 left-4">
                  <Badge 
                    count={`${discountPercent}% OFF`} 
                    style={{ 
                      backgroundColor: '#52c41a',
                      padding: '0 10px',
                      fontSize: '14px',
                      height: '28px',
                      lineHeight: '28px',
                      fontWeight: 'bold'
                    }} 
                  />
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {currentGallery.map((image, idx) => (
                <button
                  key={idx}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    currentGalleryIndex === idx 
                      ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentGalleryIndex(idx)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} view ${idx + 1}`} 
                    className="w-24 h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Product header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <Rate disabled value={product.rating || 0} className="text-yellow-500 text-sm" />
                  <span className="text-gray-500 text-sm">
                    {product.rating}/5 ({Math.floor(Math.random() * 100) + 50} reviews)
                  </span>
                </div>
              </div>
              
              {/* Price section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-800">
                    {formatPrice(product.price)}
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(Math.round(product.price * (1 + discountPercent/100)))}
                    </span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <p className="text-green-600 font-medium mt-1">
                    You save {formatPrice(Math.round(product.price * (discountPercent/100)))} ({discountPercent}%)
                  </p>
                )}
                {product.stock > 0 ? (
                  <p className="text-green-600 font-medium mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                    In Stock
                  </p>
                ) : (
                  <p className="text-red-500 font-medium mt-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                    Out of Stock
                  </p>
                )}
              </div>
              
              <Divider className="my-6" />
              
              {/* Color selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color, index) => (
                    <Tooltip title={color} key={color}>
                      <button
                        className={`w-14 h-14 rounded-full cursor-pointer transition-all duration-300 ${
                          selectedColorIndex === index 
                            ? 'ring-4 ring-blue-500 scale-110 z-10' 
                            : 'ring-1 ring-gray-300 hover:ring-blue-300'
                        }`}
                        style={{ 
                          background: getColorStyle(color),
                          boxShadow: selectedColorIndex === index ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none',
                          transform: selectedColorIndex === index ? 'scale(1.1)' : 'scale(1)'
                        }}
                        onClick={() => handleColorChange(index)}
                        aria-label={`Select ${color} color`}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
              
              {/* Quantity selection */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Quantity</h3>
                <div className="flex items-center">
                  <div className="flex items-center border border-gray-300 rounded-l-lg overflow-hidden">
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-12 w-12 border-0 flex items-center justify-center"
                    />
                    <InputNumber
                      min={1}
                      max={product.stock || 99}
                      value={quantity}
                      onChange={handleQuantityChange}
                      controls={false}
                      className="w-16 text-center border-0 h-12"
                      style={{ boxShadow: 'none' }}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                      disabled={quantity >= (product.stock || 99)}
                      className="h-12 w-12 border-0 flex items-center justify-center"
                    />
                  </div>
                  <div className="ml-4 text-gray-500">
                    {product.stock > 0 ? `${product.stock} available` : 'Currently unavailable'}
                  </div>
                </div>
              </div>
              
              {/* Total and actions */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <Divider className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="h-14 text-lg"
                  disabled={product.stock === 0}
                  style={{ 
                    background: 'linear-gradient(to right, #1890ff, #0050b3)',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(24, 144, 255, 0.25)'
                  }}
                >
                  Add to Cart
                </Button>
                
                <Button 
                  size="large" 
                  block 
                  className="h-14 text-lg" 
                  style={{ borderWidth: '2px' }}
                  icon={wishlist ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                  onClick={toggleWishlist}
                >
                  {wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>
              
              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                  </div>
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </div>
                  <span className="text-sm">Easy Returns</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-sm">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product description */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Premium quality materials for long-lasting performance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Multiple color options to match any interior design</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Energy-efficient lighting technology</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Easy installation with included mounting hardware</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Material</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Metal, Glass</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Dimensions</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35 × 15 × 10 cm</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Weight</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1.2 kg</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Warranty</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 years</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">Bulb Type</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LED (included)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-2xl shadow-xl p-4">
                <img 
                  src={`https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1287&auto=format&fit=crop`} 
                  alt={`Related Product ${item}`} 
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">Product Name {item}</h3>
                <p className="text-gray-500 mb-4">Short description of the product goes here.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">{formatPrice(199.99)}</span>
                  <Button type="primary" icon={<ShoppingCartOutlined />} size="small" />
                </div>
              </div>

            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;