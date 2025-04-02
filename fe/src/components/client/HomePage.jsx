import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Popular from "./Popular";
const HomePage = () => {

  return (
    <div className="w-full mt-4">
        <div className="container mx-auto">
            <Popular />
        </div>

    </div>
  );
};

export default HomePage;
