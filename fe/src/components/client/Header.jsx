import { IoMdMenu } from "react-icons/io";
import { Link } from "react-router-dom";
import { Dropdown, Badge, Avatar } from "antd";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { logoutUser } from "../../redux/apiRequest";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

const Header = () => {
  const user = useSelector((state) => state.auth.login.currentUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    setIsLoggedIn(user !== null);
  }, [user]);

  const cartItemsCount = useSelector((state) => state.cart.cart.length);
  const wishlistCount = useSelector((state) => state.wishlist?.wishlist?.length || 0);
  
  const [current, setCurrent] = useState("/");
  const location = useLocation();
  
  useEffect(() => {
    setCurrent(location.pathname);
  }, [location]);

  const handleLogout = () => {
    console.log(1)
    logoutUser(user, dispatch, navigate);
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to="/profile" className="font-medium text-base">
          Tài khoản
        </Link>
      ),
    },
    {
      key: 'orders',
      label: (
        <Link to="/orders" className="font-medium text-base">
          Đơn hàng
        </Link>
      ),
    },
    
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <button 
          className="font-medium text-base text-red-500 w-full text-left" 
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      ),
    },
  ];
  
  const menuItems = [
    {
      label: (
        <Link
          to="/"
          className="font-semibold text-lg transition-colors hover:text-primary-600"
        >
          Trang chủ
        </Link>
      ),
      key: "home",
      isValid: true,
    },
    {
      label: (
        <Link
          to="/shop"
          className="font-semibold text-lg transition-colors hover:text-primary-600"
        >
          Cửa hàng
        </Link>
      ),
      key: "shop",
      isValid: true,
    },
    {
      label: (
        <Link
          to="/wishlist"
          className="font-semibold text-lg transition-colors hover:text-primary-600"
        >
          Yêu thích
        </Link>
      ),
      key: "wishlist",
      isValid: true,
    },
    {
      label: (
        <Link
          to="/cart"
          className="font-semibold text-lg transition-colors hover:text-primary-600"
        >
          Giỏ hàng
        </Link>
      ),
      key: "cart",
      isValid: true,
    },
    {
      type: "divider",
      className: "my-2 border-t-2 border-gray-200",
    },
    {
      label: isLoggedIn ? (
        <button
          className="font-semibold text-lg transition-colors hover:text-primary-600"
          onClick={() => handleLogout()}
        >
          Đăng xuất
        </button>
      ) : (
        <Link
          to="/login"
          className="font-semibold text-lg transition-colors hover:text-primary-600"
        >
          Đăng nhập
        </Link>
      ),
      key: "auth",
      isValid: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <Dropdown
              menu={{
                items: menuItems,
                className: "min-w-[180px] p-4 rounded-lg shadow-lg",
              }}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <IoMdMenu className="text-2xl" />
              </button>
            </Dropdown>
          </div>

          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <h1 className="text-3xl md:text-4xl font-krona text-gray-800 hover:text-gray-600 transition-colors duration-300">
                Lumo
              </h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.slice(0, 4).map((item) => (
              item.type !== "divider" && item?.isValid && (
                <div key={item.key} className="relative">
                  <Link
                    to={`/${item.key === "home" ? "" : item.key}`}
                    className={`font-medium text-base transition-colors ${
                      current === `/${item.key === "home" ? "" : item.key}` 
                        ? "text-gray-900 border-b-2 border-gray-900" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label.props.children}
                  </Link>
                  
                  {item.key === "cart" && cartItemsCount > 0 && (
                    <Badge
                      count={cartItemsCount}
                      size="small"
                      className="absolute -top-2 -right-1"
                    />
                  )}
                  
                  {item.key === "wishlist" && wishlistCount > 0 && (
                    <Badge
                      count={wishlistCount}
                      size="small"
                      className="absolute -top-2 -right-1"
                    />
                  )}
                </div>
              )
            ))}
          </nav>

          <div className="flex items-center space-x-4 md:space-x-6">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    className: "min-w-[180px] p-2 rounded-lg shadow-lg",
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    <Avatar 
                      icon={<UserOutlined />} 
                      className="bg-gray-800" 
                      size="default"
                    />
                  </button>
                </Dropdown>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:block px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;