import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/apiRequest";

const Product = (payload) => {
  payload = payload.payload;
  const [idx, setIdx] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState({
    color: (payload.color && payload.color[idx]) || "",
    image: (payload.images && payload.images[idx]) || "" 
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (payload.color && payload.images) {
      setSelectedProduct({
        color: payload.color[idx],
        image: payload.images[idx]
      });
    }
  }, [idx, payload]);

  const handleAddToCart = () => {
    console.log("Adding product to cart:", selectedProduct);
    addToCart({ ...payload, ...selectedProduct }, dispatch);
  };

  return (
    <div>
      {payload.type === "product-selling" && (
        <div className="ml-3.5 bg-white max-w-[330px] min-h-[500px] xl:max-w-[330px] xl:min-h-[450px] flex flex-col items-center border-2 border-[#ece8e8] rounded-t-[80px] select-none cursor-pointer">
          <div className="bg-gradient-to-r from-[#c9c3c0] to-[#585857] max-w-[350px] min-h-[270px] xl:max-w-[300px] xl:min-h-[250px] rounded-t-[80px] relative m-6 flex items-center justify-center">
            <img
              src={selectedProduct.image}
              alt="product"
              className="w-[80%] object-cover"
            />
            <div className="absolute top-15 right-3 flex flex-col space-y-2">
              {payload.color.map((color, index) => (
                <div
                  key={index}
                  className={`w-[18px] h-[18px] rounded-full cursor-pointer border-[#000000] ${
                    idx === index ? "ring-4 ring-[#2c2c2c]" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setIdx(index)}
                ></div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xl font-montserrat font-semibold text-[#4a4a4a] p-0.5">
              {payload.name}
            </p>
            <p className="font-montserrat text-sm letter p-0.5">
              {payload.category}
            </p>
            <p className="text-large font-montserrat text-[#4a4a4a] p-0.5">
              {payload.price.toLocaleString("vi-VN")} vnđ
            </p>
          </div>
          <div
            onClick={handleAddToCart}
            className="border-2 px-2 py-1 my-1.5 rounded-3xl font-montserrat font-bold cursor-pointer hover:bg-gray-200 select-none"
          >
            ADD TO CART
          </div>
        </div>
      )}

      {payload.type === "product-adds" && (
        <div className="ml-3.5 max-w-[420px] min-h-[260px] xl:max-w-[330px] xl:max-h-[230px] flex flex-col items-center">
          <div className="bg-[#8D9698] max-w-[420px] max-h-[260px] xl:max-w-[320px] xl:max-h-[200px] rounded-4xl m-0.5 relative">
            <img
              src={selectedProduct.image}
              alt="product"
              className="max-w-[70%] max-h-[70%] object-contain mx-auto my-auto"
            />
            <div className="absolute top-1/2 right-3 flex flex-col space-y-2 transform -translate-y-1/2">
              {payload.color.map((color, index) => (
                <div
                  key={index}
                  className={`w-[18px] h-[18px] rounded-full cursor-pointer border-[#000000] ${
                    idx === index ? "ring-4 ring-[#2c2c2c]" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setIdx(index)}
                ></div>
              ))}
            </div>
          </div>
          <p className="text-xl font-mako">{payload.name}</p>
          <p className="font-lekton text-base font-semibold letter">
            ${payload.price.toLocaleString("vi-VN")}
          </p>
        </div>
      )}

      {payload.type === "product-featured" && (
        <div className="bg-gradient-to-r from-[#eb7439] to-[#F4BFA5] max-w-[400px] min-h-[870px] xl:max-w-[500px] xl:min-h-[600px] rounded-t-[300px] m-0.5 relative flex flex-col items-center">
          <img
            src={payload.image}
            alt="product"
            className="max-w-[70%] max-h-[50%] object-contain z-1"
          />
          <p
            className="absolute left-10 tracking-widest bottom-20 text-white text-8xl uppercase rotate-180 font-montserrat opacity-30"
            style={{ writingMode: "vertical-lr", textOrientation: "mixed" }}
          >
            Light
          </p>
          <div className="absolute bottom-[-25px] left-1/2 w-[80%] h-[15px] bg-red-300 rounded-full blur-xl transform -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default Product;
