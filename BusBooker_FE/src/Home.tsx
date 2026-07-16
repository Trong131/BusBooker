import React, { useEffect } from "react";
import ListRoutes from "./RouteDetail/ListRoutes";
import ListVoucher from "./ListVoucher";
import ListBestComment from "./ListBestComment";
import Flexin from "./Flexin";
import Footer from "./Footer";
import { clearBookingStorage } from "./utils/storageUtils";

const Home: React.FC = () => {
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

export default Home;
