import Header from "../components/Header";
import Footer from "../components/Footer";

const DefaultLayouts = ({ children }) => {
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url(./assets/backgrounds/image.png)",
        backgroundSize: "cover",
      }}
    >
      <div className="fixed w-full z-50">
        <Header />
      </div>
      {children}
      <Footer />
    </div>
  );
};

export default DefaultLayouts;
