import React, { useState } from 'react';

const TermAndPricy = () => {
  const [activeTab, setActiveTab] = useState('terms');
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="flex border-b border-gray-300 w-full md:w-1/2">
          <button 
            className={`flex-1 py-3 font-medium text-center ${activeTab === 'terms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('terms')}
          >
            Điều Khoản Sử Dụng
          </button>
        </div>
      </div>
      
      {/* Terms Content */}
      {activeTab === 'terms' && (
        <div className="terms-content">
          <h1 className="text-3xl font-bold mb-6 text-center">ĐIỀU KHOẢN SỬ DỤNG</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Giới thiệu</h2>
            <p className="mb-4">
              Chào mừng bạn đến với dịch vụ của chúng tôi. Khi bạn sử dụng dịch vụ này, 
              bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện sau đây.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Định nghĩa</h2>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">"Dịch vụ" nghĩa là tất cả các sản phẩm, dịch vụ, nội dung, tính năng, công nghệ hoặc chức năng được cung cấp bởi chúng tôi.</li>
              <li className="mb-2">"Người dùng" nghĩa là bất kỳ cá nhân hoặc tổ chức nào đăng ký và sử dụng Dịch vụ.</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Đăng ký tài khoản</h2>
            <p className="mb-2">Để sử dụng dịch vụ của chúng tôi, bạn phải:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
              <li className="mb-2">Cập nhật thông tin khi có thay đổi</li>
              <li className="mb-2">Bảo mật thông tin đăng nhập của bạn</li>
              <li className="mb-2">Chịu trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của bạn</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Quyền sở hữu trí tuệ</h2>
            <p className="mb-4">
              Tất cả quyền sở hữu trí tuệ liên quan đến Dịch vụ thuộc sở hữu của chúng tôi hoặc các bên cấp phép. 
              Không nội dung nào của Dịch vụ có thể được sao chép, phân phối, xuất bản lại mà không có sự cho phép bằng văn bản của chúng tôi.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Hạn chế sử dụng</h2>
            <p className="mb-2">Bạn đồng ý không:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Vi phạm luật pháp hiện hành</li>
              <li className="mb-2">Thu thập dữ liệu người dùng trái phép</li>
              <li className="mb-2">Can thiệp vào hoạt động bình thường của dịch vụ</li>
              <li className="mb-2">Tải lên, đăng tải hoặc truyền tải nội dung vi phạm quyền sở hữu trí tuệ</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Chấm dứt dịch vụ</h2>
            <p className="mb-4">
              Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm các điều khoản này.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Từ chối bảo đảm</h2>
            <p className="mb-4">
              Dịch vụ được cung cấp "nguyên trạng" và "như có sẵn" mà không có bất kỳ bảo đảm nào, rõ ràng hay ngụ ý.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Giới hạn trách nhiệm</h2>
            <p className="mb-4">
              Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Thay đổi điều khoản</h2>
            <p className="mb-4">
              Chúng tôi có quyền sửa đổi các điều khoản này vào bất kỳ lúc nào. 
              Việc bạn tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận điều khoản mới.
            </p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">10. Luật áp dụng</h2>
            <p className="mb-4">
              Các điều khoản này được điều chỉnh và giải thích theo luật pháp Việt Nam.
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default TermAndPricy;
