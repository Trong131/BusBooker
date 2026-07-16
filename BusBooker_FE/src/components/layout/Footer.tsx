import React from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <div className="bg-[#F2F4F7] mt-16 py-8 hidden md:block">
      <div className="mx-[200px] px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Thông tin liên hệ</h3>
            <ul className="text-gray-500">
              <li className="mb-2">Địa chỉ: 123 Đường ABC, Hà Nội</li>
              <li className="mb-2">Email: busbooker@gmail.com</li>
              <li className="mb-2">Số điện thoại: 123-456-789</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Theo dõi chúng tôi</h3>
            <div className="flex space-x-8">
              <a href="#" aria-label="Facebook">
                <FaFacebook className="text-blue-600 text-4xl" />
              </a>
              <a href="#" aria-label="TikTok">
                <FaTiktok className="text-black text-4xl" />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram className="text-red-600 text-4xl" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Bản quyền</h3>
            <p className="text-gray-500">
              &copy; 2024 Công ty BusBooker. Mọi quyền lợi được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;

