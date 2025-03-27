import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='py-12'>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 text-gray-700">
          {/* Left Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">LUMO</h3>
            <p className="mt-2 text-sm">We have a vision to make lighting evenly distributed to all parts of the earth.</p>
          </div>

          {/* About Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900">About</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="/about" className="text-sm hover:text-orange-500">About Us</a></li>
              <li><a href="/features" className="text-sm hover:text-orange-500">Features</a></li>
              <li><a href="/news" className="text-sm hover:text-orange-500">News & Blog</a></li>
            </ul>
          </div>

          {/* Movement Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Movement</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="/what-sunlight" className="text-sm hover:text-orange-500">What Sunlight</a></li>
              <li><a href="/support-us" className="text-sm hover:text-orange-500">Support Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900">Company</h4>
            <ul className="mt-4 space-y-2">
              <li><a href="/why-sunlight" className="text-sm hover:text-orange-500">Why Sunlight</a></li>
              <li><a href="/capital" className="text-sm hover:text-orange-500">Capital</a></li>
              <li><a href="/security" className="text-sm hover:text-orange-500">Security</a></li>
            </ul>
          </div>
          <div>
            <p className='text-lg font-semibold text-gray-900'>
                Follow Us
            </p>
            <div className="space-x-4 flex mt-4">
            <a href="https://facebook.com" className="text-gray-600 hover:text-orange-500">
                <FaFacebook />
            </a>
            <a href="https://instagram.com" className="text-gray-600 hover:text-orange-500">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" className="text-gray-600 hover:text-orange-500">
                <FaTwitter />
            </a>
          </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between items-center">
          <div className="text-sm text-gray-600">© Copyright LKT. All rights reserved</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
