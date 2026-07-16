import { BsTicketPerforatedFill } from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";
import { IoBus, IoNotifications, IoSearch } from "react-icons/io5";
import { LuTicket } from "react-icons/lu";
import { MdManageAccounts } from "react-icons/md";
import { RiAccountCircleLine } from "react-icons/ri";
import { TiThMenu } from "react-icons/ti";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Drawer,
  Dropdown,
  Menu,
  Modal,
  Tooltip,
  MenuProps,
} from "antd";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import {
  getAllNotifications,
  markNotificationAsRead,
} from "./services/notificationService";
import { Notification } from "./types";
import { GoDotFill } from "react-icons/go";

const Layout: React.FC = () => {
  const nav = useNavigate();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const { user, authenticated, logout } = useAuth();
  const [listNoti, setListNoti] = useState<Notification[]>([]);
  const [notiCount, setNotiCount] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedNoti, setSelectedNoti] = useState<Notification | null>(null);

  const toggleMenu = (): void => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const notifications = await getAllNotifications();
        setListNoti(notifications);
        const count = notifications.filter((item) => !item.read).length;
        setNotiCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const showModal = (item: Notification): void => {
    setSelectedNoti(item);
    setIsModalVisible(true);
  };

  const handleClose = async (): Promise<void> => {
    if (!selectedNoti) return;

    if (selectedNoti.read === true) {
      setIsModalVisible(false);
    } else {
      try {
        await markNotificationAsRead(selectedNoti.id);
        const updatedListNoti = listNoti.map((item) =>
          item.id === selectedNoti.id ? { ...item, read: true } : item
        );
        setListNoti(updatedListNoti);
        setNotiCount((prev) => Math.max(0, prev - 1));
        setIsModalVisible(false);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const itemsDrop: MenuProps["items"] = [
    {
      label: <Link to="/my-profile">Hồ sơ cá nhân</Link>,
      key: "0",
    },
    {
      label: <Link to="/change-password">Đổi mật khẩu</Link>,
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: (
        <Link onClick={() => logout()} to="/login">
          Đăng xuất
        </Link>
      ),
      key: "3",
    },
  ];

  const itemsNoti: MenuProps["items"] = listNoti
    .flatMap((item, index) => [
      {
        label: (
          <p
            onClick={() => {
              if (!item.read) {
                setNotiCount((prev) => Math.max(0, prev - 1));
              }
              showModal(item);
            }}
            className="flex items-center justify-between gap-2"
          >
            <span>
              Có 1 yêu cầu mở nhà xe từ{" "}
              <span className="font-bold">{item?.email}</span>
            </span>
            {!item?.read ? <GoDotFill className="text-red-500" /> : ""}
          </p>
        ),
        key: index.toString(),
      },
      {
        type: "divider" as const,
      },
    ])
    .slice(0, -1);

  return (
    <div>
      <div className="flex justify-between bg-[#1677ff] text-white text-[16px] p-4 font-semibold">
        <Link className="flex items-center text-3xl gap-1 cursor-pointer" to="">
          <TiThMenu
            onClick={toggleMenu}
            className="hidden max-md:block max-md:mr-4"
          />
          <IoBus className="text-yellow-300" />
          BusBooker
        </Link>
        {menuVisible && (
          <Drawer
            placement="left"
            closable={true}
            onClose={toggleMenu}
            open={menuVisible}
            width={"100%"}
            style={{ top: 80 }}
          >
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              className="w-full !border-white"
              items={[]}
            />
          </Drawer>
        )}
        <div className="flex items-center gap-5">
          <Link
            to="/my-storage"
            className="flex items-center gap-2 cursor-pointer max-md:hidden"
          >
            <BsTicketPerforatedFill className="text-xl" />
            Đơn hàng của tôi
          </Link>
          {user?.role === "Customer" && (
            <Link
              to="register-sale"
              className="flex items-center gap-2 cursor-pointer max-md:hidden"
            >
              Mở bán vé trên BusBooker
            </Link>
          )}
          {(user?.role === "Admin" || user?.role === "Operator") && (
            <>
              <Link
                to="/manager"
                className="flex items-center gap-1 cursor-pointer max-md:hidden"
              >
                <MdManageAccounts className="text-xl" />
                Quản lý
              </Link>
              <Dropdown
                menu={{ items: itemsNoti }}
                trigger={["click"]}
                placement="bottomRight"
                arrow={{
                  pointAtCenter: true,
                }}
              >
                <Badge count={notiCount}>
                  <IoNotifications className="text-2xl text-white cursor-pointer" />
                </Badge>
              </Dropdown>
            </>
          )}
          <Tooltip
            placement="bottomRight"
            title={
              <div className="text-black">
                <p>
                  <span className="cursor-pointer text-blue-600">
                    0981155865
                  </span>{" "}
                  - Để đặt vé qua điện thoại (24/7)
                </p>
                <p>
                  <span className="cursor-pointer text-blue-600">
                    0985511568
                  </span>{" "}
                  - Để phản hồi về dịch vụ và xử lý sự cố
                </p>
              </div>
            }
            color="white"
            trigger={["click"]}
          >
            <button className="flex items-center max-md:hidden bg-white text-blue-900 py-2 px-3 rounded-md gap-2">
              <FaPhoneAlt />
              Hotline 24/7
            </button>
          </Tooltip>
          {authenticated ? (
            <Dropdown menu={{ items: itemsDrop }} trigger={["click", "hover"]}>
              <img
                src={user?.avatar}
                className="w-10 h-10 rounded-full cursor-pointer"
                alt="User avatar"
              />
            </Dropdown>
          ) : (
            <button
              className="flex items-center bg-white text-blue-900 py-2 px-3 rounded-md"
              onClick={() => {
                nav("/login");
              }}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-around fixed w-full z-40 py-2 border-grey border-t-2 bottom-0 bg-white font-semibold md:hidden">
        <button className="flex flex-col items-center">
          <IoSearch className="text-2xl" />
          Tìm kiếm
        </button>
        <Link to="/my-storage">
          <button className="flex flex-col items-center">
            <LuTicket className="text-2xl" />
            Vé của tôi
          </button>
        </Link>
        <button className="flex flex-col items-center">
          <RiAccountCircleLine className="text-2xl" />
          Tài khoản
        </button>
      </div>
      <Modal
        title="Thông tin"
        open={isModalVisible}
        footer={[
          <Button key="close" onClick={handleClose}>
            Đóng
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-2">
          <p>
            Tên:{" "}
            {selectedNoti ? (
              <span className="font-semibold">{selectedNoti.username}</span>
            ) : (
              ""
            )}
          </p>
          <p>
            Email:{" "}
            {selectedNoti ? (
              <span className="font-semibold">{selectedNoti.email}</span>
            ) : (
              ""
            )}
          </p>
          <p>
            Số điện thoại:{" "}
            {selectedNoti ? (
              <span className="font-semibold">{selectedNoti.phoneNumber}</span>
            ) : (
              ""
            )}
          </p>
          <p>
            Tên nhà xe đăng kí:{" "}
            {selectedNoti ? (
              <span className="font-semibold">{selectedNoti.garage}</span>
            ) : (
              ""
            )}
          </p>
        </div>
      </Modal>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
