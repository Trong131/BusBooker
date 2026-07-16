import React, { useEffect, useState } from "react";
import { RiDiscountPercentFill } from "react-icons/ri";
import { getAllVouchers } from "../../services/voucherService";
import { Voucher } from "../../types";
import SectionContainer from "../common/SectionContainer";
import SectionTitle from "../common/SectionTitle";
import HorizontalScrollContainer from "../common/HorizontalScrollContainer";
import Card from "../common/Card";
import Loading from "../common/Loading";

const ListVoucher: React.FC = () => {
  const [listVouchers, setListVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const vouchers = await getAllVouchers();
        setListVouchers(Array.isArray(vouchers) ? vouchers : []);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SectionContainer>
      <SectionTitle>Khuyến mãi không thể bỏ lỡ</SectionTitle>
      <Loading loading={loading} tip="Đang tải dữ liệu...">
        <HorizontalScrollContainer>
          {listVouchers.map((item, index) => {
          return (
            <Card
              key={index}
              width="w-[300px]"
              height="max-md:h-40"
              className="max-md:w-[220px]"
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
            </Card>
          );
        })}
        </HorizontalScrollContainer>
      </Loading>
    </SectionContainer>
  );
};

export default ListVoucher;

