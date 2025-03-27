import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, InputNumber, Divider, Rate } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { addToCart } from '../../redux/apiRequest';

const DetailProduct = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();
  const product = {
    id: 1,
    name: "Signal Grande Pendant",
    price: 1.343,
    colors: ["blue", "gold", "grey", "white"],
    category: "Ceiling Lights",
    images: [
      "./assets/products/pendant_blue.png",
      "./assets/products/pendant_gold.png",
      "./assets/products/pendant_grey.png",
      "./assets/products/pendant_white.png",
    ],
    description: "This is a detailed description of the Signal Grande Pendant. It is designed with a modern style and is perfect for illuminating your living room or dining area. The pendant light is made of high-quality materials, ensuring durability and a long lifespan. With a beautiful combination of colors, it fits various interior designs and offers a sophisticated touch to your home decor.",
    rating: 4.5,
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Modern Table Lamp",
      price: 0.899,
      colors: ["blue", "gold", "grey", "white"],
      category: "Table Lamps",
      images: [
        "./assets/products/pendant_blue.png",
        "./assets/products/pendant_gold.png",
        "./assets/products/pendant_grey.png",
        "./assets/products/pendant_white.png",
      ],
    },
    {
      id: 3,
      name: "Elegant Wall Light",
      price: 1.199,
      colors: ["blue", "gold", "grey", "white"],
      category: "Table Lamps",
      images: [
        "./assets/products/pendant_blue.png",
        "./assets/products/pendant_gold.png",
        "./assets/products/pendant_grey.png",
        "./assets/products/pendant_white.png",
      ],
    },
    // Thêm các sản phẩm khác ở đây
  ];

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = () => {
    addToCart({ ...product, color: selectedColor, quantity }, dispatch);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{product.name}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-center mb-6">
                <Link to='/product_detail'>
                    <img
                        src={product.images[product.colors.indexOf(selectedColor)]}
                        alt={product.name}
                        className="max-w-full h-auto object-cover rounded-md"
                    />
                </Link>
            </div>

            <div className="flex justify-center mb-6">
              {product.colors.map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ml-2 ${
                    selectedColor === color ? 'ring-4 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </div>

            <Divider />
            <h3 className="text-xl font-semibold mb-4">Mô tả sản phẩm</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Tổng quan</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá sản phẩm</span>
                  <span>{product.price}$</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá</span>
                  <span>
                    <Rate disabled value={product.rating} />
                  </span>
                </div>
              </div>

              <Divider />

              <div className="flex justify-between mb-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    onClick={() => setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                  />
                  <InputNumber
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={handleQuantityChange}
                    controls={false}
                    className="w-12 text-center border-0"
                  />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= 99}
                  />
                </div>
                <p className="text-lg font-semibold">
                  {(product.price * quantity).toLocaleString()}$
                </p>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleAddToCart}
                className="mb-4"
              >
                Thêm vào giỏ hàng
              </Button>

              <Link to="/shop">
                <Button size="large" block>
                  Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <Divider />
        <h2 className="text-2xl font-bold mt-8 mb-6">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {relatedProducts.map((relatedProduct) => (
            <div key={relatedProduct.id} className="bg-white rounded-lg shadow-sm p-4">
              <Link to={`/product_detail/${relatedProduct.id}`}>
                <img
                  src={relatedProduct.images[0]}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-semibold">{relatedProduct.name}</h3>
                <p className="text-gray-500">{relatedProduct.price}$</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailProduct;