import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Product from "./Product";
import { CgAddR } from "react-icons/cg";
import { Button } from "antd";


const Popular = () => {

  const product_featured = [
    {
      image: "./assets/products/lamp_1.png",
      type: "product-featured",
    },
    {
      image: "./assets/products/lamp_2.png",
      type: "product-featured",
    },
    {
      image: "./assets/products/lamp_3.png",
      type: "product-featured",
    },
  ];
  const ref1 = useRef(null);
  const inView1 = useInView(ref1, { triggerOnce: false });

  const ref2 = useRef(null);
  const inView2 = useInView(ref2, { triggerOnce: false });

  const ref3 = useRef(null);
  const inView3 = useInView(ref3, { triggerOnce: false });

  const ref4 = useRef(null);
  const inView4 = useInView(ref4, { triggerOnce: false });

  return (
    <div className="ml-7">
      <motion.div
        ref={ref1}
        className="mt-10 flex justify-around"
        initial={{ opacity: 0, y: 50 }}
        animate={inView1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div>
          <Product payload={product_featured[0]} />
        </div>
        <div className="max-w-[500px] mt-10">
          <p className="text-4xl font-bold mb-6">Why Choose Us</p>
          <p className="font-thin mt-5">
            Our products have won numerous awards and we can guarantee the
            unlimited quality of our products.
          </p>
          <p className="flex mt-10 text-2xl font-semibold">
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#eb7439] to-[#F4BFA5] pb-1 px-2 rounded-xl text-white text-2xl font-bold mr-2.5">
              +
            </span>
            Frequently New Design
          </p>
          <div>
            <div className="flex items-center mt-10">
              <span className="text-amber-600 text-xl mr-5 font-bold">x</span>
              <p className="text-amber-600 font-semibold text-2xl">
                Original Production
              </p>
            </div>
            <p className="ml-8 opacity-70">
              We are the industrial chain of quality lighting products and offer
              the most advantageous price.
            </p>
          </div>
          <p className="flex mt-10 text-2xl font-semibold">
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#eb7439] to-[#F4BFA5] pb-1 px-2 rounded-xl text-white text-2xl font-bold mr-2.5">
              +
            </span>
            Production With Large Stock
          </p>
          <p className="flex mt-10 text-2xl font-semibold">
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-[#eb7439] to-[#F4BFA5] pb-1 px-2 rounded-xl text-white text-2xl font-bold mr-2.5">
              +
            </span>
            Professional Quality Control
          </p>
        </div>
      </motion.div>

      <motion.div
        ref={ref2}
        className="flex justify-around mt-10 select-none"
        initial={{ opacity: 0, y: 50 }}
        animate={inView2 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex flex-col items-center text-center mt-20">
          <h2 className="text-5xl font-bold text-gray-900">Latest Features</h2>
          <p className="text-gray-500 max-w-xl mt-3">
            We always provide the latest and best features for your customer,
            don't worry, we provide the latest technology for you.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white shadow-md rounded-lg p-6 w-50 h-35 flex items-center justify-center text-gray-800 font-semibold transition-all text-xl">
              Voltage Settings
            </div>

            <div className="text-xl bg-white shadow-xl border-2 border-orange-500 rounded-lg p-6 w-50 h-35 flex items-center justify-center text-orange-500 font-semibold transition-all">
              Application Control
            </div>

            <div className="text-xl bg-white shadow-md rounded-lg p-6 w-50 h-35 flex items-center justify-center text-gray-800 font-semibold transition-all">
              Voice Control
            </div>

            <div className="text-xl bg-white shadow-md rounded-lg p-6 w-50 h-35 flex items-center justify-center text-gray-800 font-semibold transition-all">
              Schedule Settings
            </div>
          </div>
        </div>
        <div>
          <Product payload={product_featured[2]} />
        </div>
      </motion.div>

      <motion.div
        ref={ref3}
        className="flex justify-center items-center min-h-screen"
        initial={{ opacity: 0, y: 50 }}
        animate={inView3 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row justify-center items-center w-[80%] gap-10">
          <Product payload={product_featured[1]} />

          <div className="flex flex-col items-center rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-5xl font-bold text-gray-900 text-center mb-5">
              Get Started
            </h2>
            <p className="text-gray-500 mt-2 text-center">
              Do not miss it, join us and get interesting discounts with us.
            </p>

            <div className="mt-5 flex items-center rounded-2xl p-2 w-[80%]">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent w-full px-4 py-2 outline-none text-gray-700 shadow-lg"
              />
              <button className="bg-gradient-to-r text-sm from-[#eb7439] to-[#e3936a] text-white px-4 rounded-full  transition-all cursor-pointer">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      
    </div>
  );
};

export default Popular; 