import React, { useEffect } from "react";
import { clearBookingStorage } from "../../utils/storageUtils";
import ListRoutes from "../../components/routes/ListRoutes";
import ListVoucher from "../../components/vouchers/ListVoucher";
import ListBestComment from "../../components/comments/ListBestComment";
import Flexin from "../../components/home/Flexin";
import Footer from "../../components/layout/Footer";

const HomePage: React.FC = () => {
  useEffect(() => {
    clearBookingStorage();
  }, []);

  return (
    <div className="max-md:mb-[100px]">
      <ListRoutes />
      <ListVoucher />
      <ListBestComment />
      <Flexin />
      <Footer />
    </div>
  );
};

export default HomePage;

