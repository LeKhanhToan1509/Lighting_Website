import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // Thêm useLocation từ react-router-dom
import Footer from "../../components/client/Footer";
import Header from "../../components/client/Header";

const CommonLayout = ({ children }) => {
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const headerRef = useRef(null);
    const location = useLocation(); // Sử dụng hook useLocation để theo dõi thay đổi route

    // Xử lý cuộn khi scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) {
                setShowHeader(false); // Cuộn xuống -> Ẩn Header
            } else {
                setShowHeader(true); // Cuộn lên -> Hiện Header
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Cuộn lên đầu trang mỗi khi URL thay đổi
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Cuộn lên đầu trang khi component được mount lần đầu tiên
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#f4f4f4] min-h-screen flex flex-col">
            <div
                ref={headerRef}
                className={`fixed w-full z-50 top-0 transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
            >
                <Header />
            </div>
            <div
                className="flex-grow"
                style={{ 
                    marginTop: headerRef.current ? `${headerRef.current.offsetHeight}px` : '64px' // Fallback value nếu headerRef chưa khởi tạo
                }}
            >
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default CommonLayout;