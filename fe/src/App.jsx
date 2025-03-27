import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HomePage from "./components/client/HomePage";
import Shop from "./components/client/Shop";
import CommonLayout from "./Layouts/client/CommonLayout";
import Popular from "./components/client/Popular";
import Cart from "./components/client/Cart";
import Login from "./components/client/Login";
import Register from "./components/client/Register";
import TermAndPricy from "./components/client/TermsAndPricy";
import DetailProduct from "./components/client/DetailProduct";
import Wishlist from "./components/client/WishList";
import ForgotPasswordPage from "./components/client/ForgotPasswordPage";
import AdminLayout from "./Layouts/admin/AdminLayout";
import ProductDashboard from "./components/admin_page/ProductDashboard";
import DashboardContent from "./components/admin_page/Dashboard";
import OrdersTable from "./components/admin_page/OrdersTable";
import CustomersPage from "./components/admin_page/Customer";
import ProfilePage from "./components/client/ProfilePage";
import OrderPage from "./components/client/OrderPage";
import OrderDetailPage from "./components/client/OrderDetailPage";

const PrivateRoute = ({ element }) => {
  const user = useSelector((state) => state.auth.login.currentUser);
  return user ? element : <Navigate to="/login" />;
};

const AdminRoute = ({ element }) => {
  const user = useSelector((state) => state.auth.login.currentUser);
  console.log(user)

  return user && user.acc.role === 'admin' ? element : <Navigate to="/" />;

};

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdmin ? (
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<AdminRoute element={<CustomersPage />} />} />
            <Route path="/admin/dashboard" element={<AdminRoute element={<CustomersPage />} />} />
            <Route path="/admin/products" element={<AdminRoute element={<ProductDashboard />} />} />
            <Route path="/admin/orders" element={<AdminRoute element={<OrdersTable />} />} />
            <Route path="/admin/customers" element={<AdminRoute element={<CustomersPage />} />} />
          </Routes>
        </AdminLayout>
      ) : (
        <CommonLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms_and_pricing" element={<TermAndPricy />} />
            <Route path="/product_detail" element={<DetailProduct />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/forgot_pass" element={<ForgotPasswordPage />} />
            <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
            <Route path="/orders" element={<PrivateRoute element={<OrderPage />} />} />
            <Route path="/orders/:id" element={<PrivateRoute element={<OrderDetailPage />} />} />
          </Routes>
        </CommonLayout>
      )}
    </>
  );
};

export default App;
