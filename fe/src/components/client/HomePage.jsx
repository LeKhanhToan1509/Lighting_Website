import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import Popular from "./Popular";
const HomePage = () => {

  return (
    <div className="w-full mt-4">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="w-full h-[400px]"
      >
        <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="./assets/slider/bg1.png"
              alt="Lighting Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex top-[20%] left-[10%] pl-30">
              <div className="text-white space-y-2 flex flex-col items-center">
                <h2 className="text-5xl font-bold  text-black mb-7">
                  Why Choose Us
                </h2>
                <p className="text-xl text-black font-medium">
                  Frequently New Design
                </p>
                <p className="text-xl text-black font-medium">
                  Production With Large Stock
                </p>
                <p className="text-xl text-black font-medium">
                  Original Production
                </p>
                <Link
                  to="/shop"
                  className="text-black text-xl font-medium mt-3 relative inline-block group"
                >
                  <span className="underline transition-all duration-300 group-hover:underline-offset-8">
                    Shop Now
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 scale-x-0 transition-all duration-300 group-hover:scale-x-100"></span>
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="./assets/slider/bg1.png"
              alt="Lighting Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex top-[20%] left-[10%] pl-30">
              <div className="text-white space-y-2 flex flex-col items-center">
                <h2 className="text-5xl font-bold  text-black mb-7">
                  Why Choose Us
                </h2>
                <p className="text-xl text-black font-medium">
                  Frequently New Design
                </p>
                <p className="text-xl text-black font-medium">
                  Production With Large Stock
                </p>
                <p className="text-xl text-black font-medium">
                  Original Production
                </p>
                <Link
                  to="/shop"
                  className="text-black text-xl font-medium mt-3 relative inline-block group"
                >
                  <span className="underline transition-all duration-300 group-hover:underline-offset-8">
                    Shop Now
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 scale-x-0 transition-all duration-300 group-hover:scale-x-100"></span>
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full">
            <img
              src="./assets/slider/bg1.png"
              alt="Lighting Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex top-[20%] left-[10%] pl-30">
              <div className="text-white space-y-2 flex flex-col items-center">
                <h2 className="text-5xl font-bold  text-black mb-7">
                  Why Choose Us
                </h2>
                <p className="text-xl text-black font-medium">
                  Frequently New Design
                </p>
                <p className="text-xl text-black font-medium">
                  Production With Large Stock
                </p>
                <p className="text-xl text-black font-medium">
                  Original Production
                </p>
                <Link
                  to="/shop"
                  className="text-black text-xl font-medium mt-3 relative inline-block group"
                >
                  <span className="underline transition-all duration-300 group-hover:underline-offset-8">
                    Shop Now
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 scale-x-0 transition-all duration-300 group-hover:scale-x-100"></span>
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
        <div className="container mx-auto">
            <Popular />
        </div>

    </div>
  );
};

export default HomePage;
