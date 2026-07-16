import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu, MenuProps } from "antd";
import { FaBusSimple, FaTicket, FaUser } from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";
import { PiSealPercentFill } from "react-icons/pi";
import { CiRoute } from "react-icons/ci";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { BiSolidCarGarage } from "react-icons/bi";

const Manager: React.FC = () => {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (user?.role === "Customer") {
      nav("/");
    }
    if (user?.role === "Admin") {
      nav("/manager/users");
    }
    if (user?.role === "Operator") {
      nav("/manager/bus");
    }
  }, [user, nav]);

  const items: MenuProps["items"] = [
    {
      key: "users",
      label: "Danh sách người dùng",
      icon: <FaUser />,
    },
    {
      key: "bus",
      label: "Quản lý xe",
      icon: <FaBusSimple />,
    },
    {
      key: "schedules",
      label: "Quản lý lịch trình",
      icon: <RiCalendarScheduleFill />,
    },
    {
      key: "tickets",
      label: "Quản lý vé",
      icon: <FaTicket />,
    },
    {
      key: "routes",
      label: "Quản lý tuyến đường",
      icon: <CiRoute />,
    },
    {
      key: "vouchers",
      label: "Quản lý voucher",
      icon: <PiSealPercentFill />,
    },
    {
      key: "garage",
      label: "Thêm nhà xe",
      icon: <BiSolidCarGarage />,
    },
  ];

  const onClick: MenuProps["onClick"] = (e) => {
    nav(`/manager/${e.key}`);
  };

  const keysToRemoveForOperator = ["users", "garage", "vouchers"];

  const filteredItems = items?.filter(
    (item) => user?.role !== "Operator" || !keysToRemoveForOperator.includes(item?.key as string)
  );

  return (
    <div className="h-[calc(100vh-72px)] flex">
      <Menu
        onClick={onClick}
        style={{
          width: 256,
          height: "100%",
        }}
        defaultSelectedKeys={user?.role === "Operator" ? ["bus"] : ["users"]}
        mode="inline"
        items={filteredItems}
      />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default Manager;

