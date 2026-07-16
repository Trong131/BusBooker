import React, { useEffect, useState } from "react";
import { RiDiscountPercentFill } from "react-icons/ri";
import { getAllVouchers } from "./services/voucherService";
import { Voucher } from "./types";

const ListVoucher: React.FC = () => {
  const [listVouchers, setListVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const vouchers = await getAllVouchers();
        setListVouchers(Array.isArray(vouchers) ? vouchers : []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-md:w-[90%] w-[70%] mt-[50px]">
      <p className="text-2xl font-semibold">Khuyến mãi không thể bỏ lỡ</p>
      <div className="flex overflow-x-auto whitespace-nowrap gap-4 p-4 snap-x snap-mandatory">
        {listVouchers.map((item, index) => {
          return (
            <div
              key={index}
              className="max-md:h-40 max-md:w-[220px] w-[300px] flex-shrink-0 rounded-lg shadow-lg bg-white flex flex-col overflow-hidden snap-start cursor-pointer pb-1"
            >
              <div className="w-full flex items-center justify-center text-4xl h-32 max-md:h-[160px] bg-[#fef32a]">
                <RiDiscountPercentFill />
              </div>
              <div className="flex flex-col h-[80px] max-md:h-full md:justify-between">
                <p className="px-4 py-2 whitespace-normal">{item?.name}</p>
                <p className="px-4 font-semibold whitespace-normal pb-1">
                  {item?.code}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListVoucher;

