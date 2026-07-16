import { Button, Radio, Input, Form, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { BsShieldFillCheck } from "react-icons/bs";
import { RiDiscountPercentFill } from "react-icons/ri";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { FaCircleCheck } from "react-icons/fa6";
import qrImg from "./assets/qr.jpg";
import { getAllVouchers } from "./services/voucherService";
import { bookSeat } from "./services/scheduleService";
import { createTicket } from "./services/ticketService";
import { Voucher, PaymentFormData, BookingChoice } from "./types";
import { formatDate, formatTimeFromDB } from "./utils/dateUtils";
import { formatCurrency } from "./utils/formatUtils";
import { STORAGE_KEYS, PAYMENT_METHODS, TICKET_STATUS } from "./constants";
import { getStorageItem, removeStorageItem } from "./utils/storageUtils";

const Payment: React.FC = () => {
  const [listVoucher, setListVoucher] = useState<Voucher[]>([]);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [form] = Form.useForm<PaymentFormData>();

  useEffect(() => {
    removeStorageItem(STORAGE_KEYS.CLICK_COUNT);
    const fetchData = async (): Promise<void> => {
      try {
        const data = await getAllVouchers();
        setListVoucher(data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchData();
  }, []);

  const chieuDi = getStorageItem<BookingChoice>(STORAGE_KEYS.CHIEU_DI);
  const giaChieuDi = parseInt(
    getStorageItem<string>(STORAGE_KEYS.GIA_CHIEU_DI) || "0",
    10
  );

  const chieuVe = getStorageItem<BookingChoice>(STORAGE_KEYS.CHIEU_VE);
  const giaChieuVe = parseInt(
    getStorageItem<string>(STORAGE_KEYS.GIA_CHIEU_VE) || "0",
    10
  );

  console.log("Payment - chieuDi:", chieuDi);
  console.log("Payment - chieuVe:", chieuVe);
  console.log("Payment - giaChieuDi:", giaChieuDi);
  console.log("Payment - giaChieuVe:", giaChieuVe);

  const originChoice = chieuDi?.origin || searchParams.get("origin") || "";
  const destiChoice = chieuVe?.destination || searchParams.get("destination") || "";

  const totalPrice =
    (isNaN(giaChieuDi) ? 0 : giaChieuDi) + (isNaN(giaChieuVe) ? 0 : giaChieuVe);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [total, setTotalPrice] = useState<number>(totalPrice);
  const [modal, setModal] = useState<boolean>(false);
  const [qr, setQr] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const onFinish = async (value: PaymentFormData): Promise<void> => {
    if (!user || !chieuDi) return;

    try {
      await bookSeat({
        scheduleId: chieuDi.scheduleId,
        seatNumber: chieuDi.seatNumber,
      });

      if (value.paymentMethod === PAYMENT_METHODS.DIRECT) {
        if (chieuVe) {
          await bookSeat({
            scheduleId: chieuVe.scheduleId,
            seatNumber: chieuVe.seatNumber,
          });
          const pricePerTicket = total / 2;
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.WAITING,
            phoneNumber: value.phoneNumber,
            price: pricePerTicket,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.DIRECT,
            voucher: selectedVoucher?.id,
            scheduleId: chieuDi.scheduleId,
            seatNumbers: chieuDi.seatNumber,
          });
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.WAITING,
            phoneNumber: value.phoneNumber,
            price: pricePerTicket,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.DIRECT,
            voucher: selectedVoucher?.id,
            scheduleId: chieuVe.scheduleId,
            seatNumbers: chieuVe.seatNumber,
          });
        } else {
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.WAITING,
            phoneNumber: value.phoneNumber,
            price: total,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.DIRECT,
            voucher: selectedVoucher?.id,
            scheduleId: chieuDi.scheduleId,
            seatNumbers: chieuDi.seatNumber,
          });
        }
        setModal(true);
      } else {
        if (chieuVe) {
          await bookSeat({
            scheduleId: chieuVe.scheduleId,
            seatNumber: chieuVe.seatNumber,
          });
          const pricePerTicket = total / 2;
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.BOOKED,
            phoneNumber: value.phoneNumber,
            price: pricePerTicket,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.BANK,
            voucher: selectedVoucher?.id,
            scheduleId: chieuDi.scheduleId,
            seatNumbers: chieuDi.seatNumber,
          });
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.BOOKED,
            phoneNumber: value.phoneNumber,
            price: pricePerTicket,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.BANK,
            voucher: selectedVoucher?.id,
            scheduleId: chieuVe.scheduleId,
            seatNumbers: chieuVe.seatNumber,
          });
        } else {
          await createTicket({
            email: value.email,
            username: value.username,
            status: TICKET_STATUS.BOOKED,
            phoneNumber: value.phoneNumber,
            price: total,
            userId: user.id,
            paymentMethod: PAYMENT_METHODS.BANK,
            scheduleId: chieuDi.scheduleId,
            seatNumbers: chieuDi.seatNumber,
            voucher: selectedVoucher?.id,
          });
        }
        setQr(true);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const applyVoucher = (voucher: Voucher): void => {
    if (!voucher) return;

    let newTotal = totalPrice;

    if (voucher.discountType === "percent") {
      newTotal -= newTotal * (voucher.discount / 100);
    }

    if (voucher.discountType === "fixed") {
      newTotal -= voucher.discount;
    }

    if (newTotal < 0) newTotal = 0;

    setSelectedVoucher(voucher);
    setTotalPrice(newTotal);
  };

  const onClickModal = (): void => {
    setModal(false);
    nav("/");
  };

  const onClickQr = (): void => {
    setQr(false);
    setSuccess(true);
  };

  const onClickSuccess = (): void => {
    setSuccess(false);
    nav("/");
  };

  if (!chieuDi) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Không có thông tin đặt vé</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F2F4F7] flex justify-center gap-10 pt-10 max-md:flex-col-reverse max-md:pb-[100px] max-md:gap-3 max-md:pt-3 max-md:px-3 md:pb-[50px]">
      <div className="flex-flex-col">
        <div className="bg-white pt-5 px-5 rounded-md shadow-md">
          <p className="text-xl font-semibold text-center">Thông tin liên hệ</p>
          <Form
            form={form}
            onFinish={onFinish}
            initialValues={{
              username: user?.username || "",
              email: user?.email || "",
              phoneNumber: user?.phoneNumber || "",
            }}
            layout="vertical"
            className="bg-white md:w-[500px] p-5 rounded-lg"
          >
            <Form.Item
              label="Họ và tên"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ tên của bạn!",
                },
              ]}
            >
              <Input placeholder="Nhập họ tên của bạn" className="p-2" />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email của bạn!",
                },
                {
                  type: "email",
                  message: "Vui lòng nhập một địa chỉ email hợp lệ!",
                },
              ]}
            >
              <Input placeholder="Nhập email" className="p-2" />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Vui lòng số điện thoại của bạn!",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại của bạn" className="p-2" />
            </Form.Item>
            <div className="flex items-center gap-3 border-2 border-green-500 rounded-md px-3 py-2 bg-green-50">
              <BsShieldFillCheck className="text-green-500 text-2xl" />
              <p className="font-semi">
                Số điện thoại và email được sử dụng để gửi thông tin đơn hàng và
                liên hệ khi cần thiết.
              </p>
            </div>
            <Form.Item
              className="mt-5"
              label="Lựa chọn phương thức thanh toán"
              name="paymentMethod"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương thức thanh toán!",
                },
              ]}
            >
              <Radio.Group className="flex flex-col gap-3 mt-2">
                <Radio value={PAYMENT_METHODS.DIRECT}>
                  Thanh toán trực tiếp
                </Radio>
                <Radio value={PAYMENT_METHODS.BANK}>
                  Chuyển khoản ngân hàng
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full py-4">
                Thanh toán
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="bg-white pt-5 px-5 rounded-md shadow-md flex flex-col gap-2 md:w-[550px]">
        <p className="text-xl font-semibold">Thông tin chi tiết chuyến đi</p>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 pb-4">
          {/* Chiều đi - Hiển thị ngang */}
          <div className="flex-1 border-r-0 md:border-r-2 pr-0 md:pr-4">
            <p className="text-lg font-semibold mb-3">Chiều đi:</p>
            <div className="space-y-1">
              <p>
                Thời gian: {formatDate(chieuDi?.startTime)} -{" "}
                {formatTimeFromDB(chieuDi?.startTime)}
              </p>
              <p>Điểm đi: {originChoice}</p>
              <p>Điểm đến: {chieuDi?.destination || searchParams.get("destination") || ""}</p>
              <p>Xe: {chieuDi?.licensePlate}</p>
              <p>Loại xe: {chieuDi?.totalSeats} chỗ</p>
              <p>Số ghế: {chieuDi?.seatNumber.join(", ")}</p>
              <p className="font-semibold mt-2">
                Tổng:
                <span className="text-blue-500 ml-2">
                  {formatCurrency(giaChieuDi)}
                </span>
              </p>
            </div>
          </div>

          {/* Chiều về - Hiển thị ngang nếu có */}
          {chieuVe && (
            <div className="flex-1 pl-0 md:pl-4">
              <p className="text-lg font-semibold mb-3">Chiều về:</p>
              <div className="space-y-1">
                <p>
                  Thời gian: {formatDate(chieuVe?.startTime)} -{" "}
                  {formatTimeFromDB(chieuVe?.startTime)}
                </p>
                <p>Điểm đi: {chieuVe?.origin || destiChoice}</p>
                <p>Điểm đến: {chieuVe?.destination || originChoice}</p>
                <p>Xe: {chieuVe.licensePlate}</p>
                <p>Loại xe: {chieuVe.totalSeats} chỗ</p>
                <p>Số ghế: {chieuVe.seatNumber.join(", ")}</p>
                <p className="font-semibold mt-2">
                  Tổng:
                  <span className="text-blue-500 ml-2">
                    {formatCurrency(giaChieuVe)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="border-t-2 py-2 flex items-center justify-between">
            <p className="font-semibold">Tổng tiền:</p>
            <p className="text-blue-500 font-semibold text-lg">
              {formatCurrency(totalPrice)}
            </p>
          </div>
          <div className="border-t-2 py-2 flex items-center justify-between">
            <p className="font-semibold">Mã áp dụng:</p>
            <p className="font-semibold">{selectedVoucher?.code || ""}</p>
          </div>
          <div className="border-t-2 py-2 flex items-center justify-between">
            <p className="font-semibold">Tổng thanh toán:</p>
            <p className="text-blue-500 font-semibold text-xl">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xl font-semibold border-t-2 pt-2">
            Danh sách khuyến mãi
          </p>
          <div className="flex overflow-x-auto whitespace-nowrap gap-4 p-4 snap-x snap-mandatory">
            {listVoucher.map((item, index) => (
              <div
                key={index}
                className={`border-2 rounded-md shadow-md p-1 cursor-pointer ${
                  selectedVoucher === item ? "border-4 border-blue-500" : ""
                }`}
                onClick={() => applyVoucher(item)}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="bg-[#fef32a] w-[70px] h-full rounded-md flex items-center justify-center">
                    <RiDiscountPercentFill className="text-4xl" />
                  </div>
                  <div className="text-sm pl-2 pr-1">
                    <p className="text-blue-600 font-semibold">Thanh toán</p>
                    <p className="font-bold text-md">{item.name}</p>
                    <p>
                      HSD:{" "}
                      <span className="font-semibold">
                        {formatDate(item.expiryDate)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        open={modal}
        centered
        onCancel={onClickModal}
        footer={
          <Button
            type="primary"
            onClick={onClickModal}
            className="w-full font-semibold bg-yellow-400 text-black hover:!bg-yellow-300 hover:!text-black"
          >
            Xác nhận
          </Button>
        }
      >
        <p className="font-bold text-lg text-center flex items-center justify-center gap-3">
          <FaCircleCheck className="text-xl text-green-600" />
          Bạn đã đặt vé thành công!
        </p>
      </Modal>
      <Modal
        open={qr}
        centered
        onCancel={onClickQr}
        footer={
          <Button className="w-full" onClick={onClickQr}>
            Thanh toán
          </Button>
        }
      >
        <img src={qrImg} alt="QR Code" />
      </Modal>
      <Modal
        open={success}
        centered
        onCancel={onClickSuccess}
        footer={
          <Button
            type="primary"
            onClick={onClickSuccess}
            className="w-full font-semibold bg-yellow-400 text-black hover:!bg-yellow-300 hover:!text-black"
          >
            Xác nhận
          </Button>
        }
      >
        <p className="font-bold text-lg text-center flex items-center justify-center gap-3">
          <FaCircleCheck className="text-xl text-green-600" />
          Bạn đã thanh toán thành công!
        </p>
      </Modal>
    </div>
  );
};

export default Payment;
