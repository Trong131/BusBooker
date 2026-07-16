import { Button, Carousel, Modal, Timeline } from "antd";
import React, { useState } from "react";
import { FaCircleDot, FaLocationDot } from "react-icons/fa6";
import { PiArmchairFill } from "react-icons/pi";
import { TbArmchair2, TbArmchair2Off } from "react-icons/tb";
import SeatMap from "./SeatMap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ReviewCard from "./ReviewCard";
import { ScheduleWithSeats } from "../types";
import { formatDate, formatTimeFromDB, formatDateForAPI } from "../utils/dateUtils";
import { STORAGE_KEYS } from "../constants";
import dayjs from "dayjs";
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from "../utils/storageUtils";
 
interface ScheduleCardProps {
  item: ScheduleWithSeats;
  endTime: string | null;
}
 
const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, endTime }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [more, setMore] = useState<boolean>(false);
  const [rv, setRv] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [warning, setWarning] = useState<boolean>(false);
  const [login, setLogin] = useState<boolean>(false);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
 
  const toggleModal = (): void => {
    setVisible((prevVisible) => !prevVisible);
  };
 
  const onClickButton = (): void => {
    setMore((pre) => !pre);
  };
 
  const onClickReview = (): void => {
    setRv((pre) => !pre);
  };
 
  const handleImageClick = (index: number): void => {
    setSelectedImageIndex(index);
  };
 
  const handleSeatClick = (seatNumber: string): void => {
    setSelectedSeats((prevSelectedSeats) => {
      const updatedSeats = prevSelectedSeats.includes(seatNumber)
        ? prevSelectedSeats.filter((seat) => seat !== seatNumber)
        : [...prevSelectedSeats, seatNumber];
 
      return updatedSeats.sort((a, b) => {
        const numA = parseInt(a.slice(1), 10);
        const numB = parseInt(b.slice(1), 10);
        return numA - numB;
      });
    });
  };
 
  const calculateTotalPrice = (): number => {
    return selectedSeats.reduce((total, seatNumber) => {
      const seat = item?.seats?.find((seat) => seat.seatNumber === seatNumber);
      const seatPrice = seat?.price || 0;
      const finalPrice = seatPrice < 1000 ? seatPrice * 1000 : seatPrice;
      return total + finalPrice;
    }, 0);
  };
 
  const totalPrice = calculateTotalPrice();
 
  const onLogin = (): void => {
    setLogin((pre) => !pre);
  };
 
  const onClickNext = (): void => {
    if (user === null) {
      setLogin(true);
      return;
    }
    if (selectedSeats.length === 0) {
      setWarning((pre) => !pre);
      return;
    }
 
    const existingChieuDi = getStorageItem<any>(STORAGE_KEYS.CHIEU_DI);
    const existingChieuVe = getStorageItem<any>(STORAGE_KEYS.CHIEU_VE);
    const isReturnTrip =
      existingChieuDi !== null && existingChieuVe === null && endTime !== null;
 
    console.log("ScheduleCard - onClickNext Debug:");
    console.log("  - existingChieuDi:", existingChieuDi);
    console.log("  - existingChieuVe:", existingChieuVe);
    console.log("  - endTime:", endTime);
    console.log("  - isReturnTrip:", isReturnTrip);
    console.log("  - item.id (scheduleId hiện tại):", item.id);
 
    const originParam = searchParams.get("origin");
    const destiParam = searchParams.get("destination");
 
    const bookingData = {
      scheduleId: item.id,
      startTime: item.startTime,
      busId: item.busId.id,
      licensePlate: item.busId.licensePlate,
      totalSeats: item.busId.totalSeats,
      seatNumber: selectedSeats,
      origin: originParam || "",
      destination: destiParam || "",
    };
 
    if (endTime === null) {
      setStorageItem(STORAGE_KEYS.CHIEU_DI, JSON.stringify(bookingData));
      setStorageItem(STORAGE_KEYS.GIA_CHIEU_DI, totalPrice.toString());
      nav("/payment");
    } else {
      if (!isReturnTrip) {
        if (existingChieuVe) {
          console.log(
            "ScheduleCard - Xóa chiều về cũ trước khi lưu chiều đi mới"
          );
          removeStorageItem(STORAGE_KEYS.CHIEU_VE);
          removeStorageItem(STORAGE_KEYS.GIA_CHIEU_VE);
        }
 
        console.log("ScheduleCard - Lưu chiều đi (riêng biệt):", bookingData);
        console.log("ScheduleCard - scheduleId chiều đi:", item.id);
        setStorageItem(STORAGE_KEYS.CHIEU_DI, JSON.stringify(bookingData));
        setStorageItem(STORAGE_KEYS.GIA_CHIEU_DI, totalPrice.toString());
 
        const verifyChieuDi = getStorageItem<any>(STORAGE_KEYS.CHIEU_DI);
        console.log(
          "ScheduleCard - Verify chieuDi sau khi lưu:",
          verifyChieuDi
        );
        console.log(
          "ScheduleCard - scheduleId chieuDi:",
          verifyChieuDi?.scheduleId
        );
 
        if (originParam && destiParam && endTime) {
          const newParams = new URLSearchParams();
          newParams.set("origin", destiParam);
          newParams.set("destination", originParam);
          const returnDateOnly = formatDateForAPI(dayjs(endTime));
          newParams.set("date", returnDateOnly);
          newParams.set("returnDate", returnDateOnly);
          nav(`/route-details?${newParams.toString()}`);
        } else {
          nav("/route-details");
        }
      } else {
        const chieuVeData = {
          scheduleId: item.id,
          startTime: item.startTime,
          busId: item.busId.id,
          licensePlate: item.busId.licensePlate,
          totalSeats: item.busId.totalSeats,
          seatNumber: selectedSeats,
          origin: destiParam || "",
          destination: originParam || "",
        };
 
        console.log("ScheduleCard - Lưu chiều về (riêng biệt):", chieuVeData);
        console.log("ScheduleCard - scheduleId chiều về:", item.id);
        console.log(
          "ScheduleCard - originParam:",
          originParam,
          "destiParam:",
          destiParam
        );
 
        const existingChieuDiData = getStorageItem<any>(STORAGE_KEYS.CHIEU_DI);
        console.log(
          "ScheduleCard - scheduleId chiều đi (đã lưu):",
          existingChieuDiData?.scheduleId
        );
        console.log(
          "ScheduleCard - scheduleId chiều về (sắp lưu):",
          chieuVeData.scheduleId
        );
 
        setStorageItem(STORAGE_KEYS.CHIEU_VE, JSON.stringify(chieuVeData));
        setStorageItem(STORAGE_KEYS.GIA_CHIEU_VE, totalPrice.toString());
 
        const verifyChieuDi = getStorageItem<any>(STORAGE_KEYS.CHIEU_DI);
        const verifyChieuVe = getStorageItem<any>(STORAGE_KEYS.CHIEU_VE);
        console.log(
          "ScheduleCard - Verify chieuDi sau khi lưu chieuVe:",
          verifyChieuDi
        );
        console.log(
          "ScheduleCard - Verify chieuVe sau khi lưu:",
          verifyChieuVe
        );
        console.log(
          "ScheduleCard - scheduleId chieuDi:",
          verifyChieuDi?.scheduleId
        );
        console.log(
          "ScheduleCard - scheduleId chieuVe:",
          verifyChieuVe?.scheduleId
        );
        console.log(
          "ScheduleCard - Hai scheduleId có khác nhau không?",
          verifyChieuDi?.scheduleId !== verifyChieuVe?.scheduleId
        );
 
        nav("/payment");
      }
    }
  };
 
  return (
    <div className="bg-white rounded-md shadow-md px-3">
      <div className="flex gap-5 pt-3">
        <img
          src={item?.busId?.img?.[3] ?? ""}
          className="w-40 h-40 cursor-pointer"
          onClick={toggleModal}
          alt="Bus"
        />
        <div className="font-semibold">
          <p className="text-lg">{item?.busId?.owner}</p>
          <p className="text-gray-600">
            Limousine {item?.busId?.totalSeats} chỗ{" "}
          </p>
          <p className="text-gray-600 my-2">{formatDate(item?.startTime)}</p>
          <Timeline
            items={[
              {
                children: (
                  <p className="text-lg">{formatTimeFromDB(item?.startTime)}</p>
                ),
                dot: <FaCircleDot className="text-md mt-1" />,
              },
              {
                children: (
                  <p className="text-lg">{formatTimeFromDB(item?.endTime)}</p>
                ),
                dot: <FaLocationDot className="text-lg mt-1" />,
              },
            ]}
          />
        </div>
        <div className="flex justify-between flex-col mb-12 items-end">
          <p className="text-[#1677ff] font-bold text-xl">
            Từ{" "}
            {item?.seats?.[0]?.price
              ? item.seats[0].price.toLocaleString()
              : ""}
            đ
          </p>
          <div className="flex flex-col items-end gap-2">
            <p className="font-semibold text-gray-600">
              Còn {item?.availableSeats} chỗ trống
            </p>
            <div className="flex gap-4 items-center">
              <p
                className="text-[#1677ff] cursor-pointer underline"
                onClick={onClickReview}
              >
                Xem đánh giá
              </p>
              <button
                className={`font-semibold p-2 rounded-md text-md w-[115px] ${
                  !more
                    ? "bg-yellow-400 hover:bg-yellow-300"
                    : "bg-gray-400 hover:bg-gray-300"
                }`}
                onClick={onClickButton}
              >
                {!more ? "Chọn chuyến" : "Hủy"}
              </button>
            </div>
          </div>
        </div>
        <Modal open={visible} onCancel={toggleModal} footer={null}>
          <div className="h-[320px]">
            <img
              src={item?.busId?.img?.[selectedImageIndex] ?? ""}
              className="w-full h-full"
              alt="Bus detail"
            />
          </div>
          <Carousel
            dots={false}
            arrows
            infinite={false}
            slidesToShow={3}
            slidesToScroll={1}
          >
            {item?.busId?.img?.map((image, index) => (
              <div
                key={index}
                className="h-36 p-2 mt-2 cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <img
                  className={`w-full h-full ${
                    selectedImageIndex === index
                      ? "border-4 border-blue-500"
                      : ""
                  }`}
                  src={image}
                  alt={`Bus image ${index + 1}`}
                />
              </div>
            ))}
          </Carousel>
        </Modal>
      </div>
      {more && (
        <>
          <div className="border-t-2 flex items-center justify-between">
            <div className="flex flex-col gap-3 pb-5 px-5 pt-2">
              <p>Chú thích</p>
              <div className="flex items-center gap-3">
                <TbArmchair2Off className="text-3xl text-gray-600" /> Ghế không
                bán
              </div>
              <div className="flex items-center gap-3">
                <PiArmchairFill className="text-3xl text-green-500" /> Đang chọn
              </div>
              <div className="flex items-center gap-3">
                <TbArmchair2 className="text-3xl text-green-400" />
                <div>
                  <p>Ghế đầu</p>{" "}
                  <p className="font-semibold">
                    {item?.seats?.[0]?.price ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TbArmchair2 className="text-3xl text-orange-400" />
                <div>
                  <p>Ghế giữa</p>{" "}
                  <p className="font-semibold">
                    {item?.seats?.[4]?.price ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TbArmchair2 className="text-3xl text-purple-400" />
                <div>
                  <p>Ghế cuối</p>{" "}
                  <p className="font-semibold">
                    {item?.seats && item.seats.length > 0
                      ? item.seats[item.seats.length - 1].price
                      : ""}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <SeatMap seats={item?.seats} handleSeatClick={handleSeatClick} />
            </div>
          </div>
          <div className="border-t-2 flex items-center justify-between py-5">
            <p>
              Ghế:{" "}
              <span className="text-[#1677ff] font-bold">
                {selectedSeats.join(", ")}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <p>
                Tổng cộng:{" "}
                <span className="text-[#1677ff] font-bold">
                  {totalPrice.toLocaleString()}đ
                </span>
              </p>
              <button
                className="bg-[#1677ff] text-white py-2 px-3 rounded-md hover:bg-blue-500"
                onClick={onClickNext}
              >
                Tiếp tục
              </button>
            </div>
            <Modal
              open={warning}
              onCancel={() => setWarning(false)}
              centered
              footer={
                <Button
                  onClick={() => setWarning(false)}
                  type="primary"
                  className="w-full font-semibold bg-yellow-400 text-black hover:!bg-yellow-300 hover:!text-black"
                >
                  Đã hiểu
                </Button>
              }
            >
              <p className="font-bold text-lg text-center">
                Vui lòng chọn ít nhất 1 chỗ ngồi
              </p>
            </Modal>
            <Modal
              open={login}
              onCancel={onLogin}
              centered
              footer={
                <>
                  <Button onClick={onLogin}>Hủy</Button>
                  <Button
                    onClick={() => nav("/login")}
                    type="primary"
                    className="font-semibold bg-yellow-400 text-black hover:!bg-yellow-300 hover:!text-black"
                  >
                    Đăng nhập
                  </Button>
                </>
              }
            >
              <p className="font-bold text-lg text-center">
                Bạn cần đăng nhập để có thể đặt vé
              </p>
            </Modal>
          </div>
        </>
      )}
      {rv && <ReviewCard busId={item?.busId?.id} />}
    </div>
  );
};
 
export default ScheduleCard;
 