import React from "react";
import { AiOutlineTag } from "react-icons/ai";
import { BiBus } from "react-icons/bi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { LuTicket } from "react-icons/lu";

const Flexin: React.FC = () => {
  return (
    <div className="mx-auto max-md:w-[90%] w-[70%] mt-[50px]">
      <p className="text-2xl font-semibold mb-2">
        Nền tảng kết nối người dùng và nhà xe
      </p>
      <div className="grid grid-cols-4 gap-2 max-md:grid-cols-2">
        <div className="border-2 border-gray-200 shadow py-4 px-2 rounded-md gap-2 flex justify-between h-full">
          <BiBus className="text-blue-600 text-5xl flex-grow" />
          <div className="w-2/3">
            <p className="font-bold text-lg">2000+ nhà xe chất lượng cao</p>
            <p className="font-semibold text-gray-500 text-sm">
              5000+ tuyến đường trên toàn quốc, chủ động và đa dạng lựa chọn.
            </p>
          </div>
        </div>
        <div>
          <div className="border-2 border-gray-200 shadow py-4 px-2 rounded-md gap-2 flex justify-between h-full">
            <LuTicket className="text-yellow-400 text-5xl flex-grow" />
            <div className="w-2/3">
              <p className="font-bold text-lg">Đặt vé dễ dàng</p>
              <p className="font-semibold text-gray-500 text-sm">
                Đặt vé chỉ với 60s. Chọn xe yêu thích cực nhanh và thuận tiện.
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="border-2 border-gray-200 shadow py-4 px-2 rounded-md gap-2 flex justify-between h-full">
            <FaRegCircleCheck className="text-green-500 text-5xl flex-grow" />
            <div className="w-2/3">
              <p className="font-bold text-lg">Chắc chắn có chỗ</p>
              <p className="font-semibold text-gray-500 text-sm">
                Hoàn ngay 150% nếu nhà xe không cung cấp dịch vụ vận chuyển, mang
                đến hành trình trọn vẹn.
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="border-2 border-gray-200 shadow py-4 px-2 rounded-md gap-2 flex justify-between h-full">
            <AiOutlineTag className="text-red-500 text-5xl flex-grow" />
            <div className="w-2/3">
              <p className="font-bold text-lg">Nhiều ưu đãi</p>
              <p className="font-semibold text-gray-500 text-sm">
                Hàng ngàn ưu đãi cực chất độc quyền tại BusBooker.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flexin;

