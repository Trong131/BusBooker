import { Button, Form, Input, Modal, Rate, Table, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTickets } from "./hooks/useTickets";
import { cancelTicket, submitReview } from "./services/ticketService";
import { Ticket, TicketStatus } from "./types";
import { IoInformationCircle } from "react-icons/io5";
import { FiXCircle } from "react-icons/fi";
import { GoCodeReview } from "react-icons/go";
import { formatDate, formatTime, formatTimeFromDB } from "./utils/dateUtils";
import { formatCurrency } from "./utils/formatUtils";
import { STATUS_LABELS, TICKET_STATUS } from "./constants";
import type { ColumnsType } from "antd/es/table";
import Loading from "./components/common/Loading";

const UserStorage: React.FC = () => {
  const { user } = useAuth();
  const { tickets, refetch, loading } = useTickets(user?.id);
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);
  const [cancelledTickets, setCancelledTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (tickets.length) {
      const waiting = tickets.filter(
        (ticket) => ticket.status === TICKET_STATUS.WAITING || ticket.status === TICKET_STATUS.BOOKED
      );
      const completed = tickets.filter((ticket) => ticket.status === TICKET_STATUS.COMPLETED);
      const cancelled = tickets.filter((ticket) => ticket.status === TICKET_STATUS.CANCELLED);
      setWaitingTickets(waiting);
      setCompletedTickets(completed);
      setCancelledTickets(cancelled);
    }
  }, [tickets]);

  const [modal, setModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [review, setReview] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [rating, setRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState<string>("");

  const getStatusLabel = (status: TicketStatus): { text: string; color: string } => {
    return STATUS_LABELS[status] || { text: status, color: "" };
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: "Thời gian đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => {
        return (
          <p>
            {formatDate(text)} - {formatTime(text)}
          </p>
        );
      },
    },
    {
      title: "Điểm xuất phát",
      dataIndex: "scheduleId",
      key: "origin",
      render: (schedule: Ticket["scheduleId"]) => {
        return <p>{schedule?.routeId?.origin}</p>;
      },
    },
    {
      title: "Điểm đến",
      dataIndex: "scheduleId",
      key: "destination",
      render: (schedule: Ticket["scheduleId"]) => {
        return <p>{schedule?.routeId?.destination}</p>;
      },
    },
    {
      title: "Thời gian khởi hành",
      dataIndex: "scheduleId",
      key: "startTime",
      render: (schedule: Ticket["scheduleId"]) => {
        return (
          <p>
            {formatDate(schedule?.startTime)} - {formatTimeFromDB(schedule?.startTime)}
          </p>
        );
      },
    },
    {
      title: "Thời gian dự kiến đến nơi",
      dataIndex: "scheduleId",
      key: "endTime",
      render: (schedule: Ticket["scheduleId"]) => {
        return (
          <p>
            {formatDate(schedule?.endTime)} - {formatTimeFromDB(schedule?.endTime)}
          </p>
        );
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (text: TicketStatus) => {
        const statusInfo = getStatusLabel(text);
        return <p className={`${statusInfo.color} font-semibold`}>{statusInfo.text}</p>;
      },
    },
    {
      title: "Chi tiết",
      dataIndex: "id",
      key: "detail",
      render: (_: string, record: Ticket) => {
        return (
          <p
            className="cursor-pointer text-xl text-blue-900"
            onClick={() => {
              setSelectedTicket(record);
              setModal(true);
            }}
          >
            <IoInformationCircle />
          </p>
        );
      },
    },
    ...(activeTab === "1"
      ? [
          {
            title: "Hủy vé",
            dataIndex: "status",
            key: "cancel",
            render: (text: TicketStatus, record: Ticket) =>
              text === TICKET_STATUS.WAITING ? (
                <p
                  className="cursor-pointer text-xl text-red-500"
                  onClick={() => {
                    setSelectedTicket(record);
                    setConfirm(true);
                  }}
                >
                  <FiXCircle />
                </p>
              ) : null,
          },
        ]
      : []),
    ...(activeTab === "2"
      ? [
          {
            title: "Đánh giá",
            dataIndex: "hasReviewed",
            key: "review",
            render: (hasReviewed: boolean | undefined, record: Ticket) => {
              return !hasReviewed ? (
                <p
                  onClick={() => {
                    setSelectedTicket(record);
                    setReview(true);
                  }}
                >
                  <GoCodeReview className="text-xl cursor-pointer" />
                </p>
              ) : (
                ""
              );
            },
          },
        ]
      : []),
  ];

  const handleClose = (): void => {
    setModal(false);
    setSelectedTicket(null);
  };

  const handleCancelTicket = async (): Promise<void> => {
    if (!selectedTicket) return;

    try {
      await cancelTicket(selectedTicket.id);
      setConfirm(false);
      await refetch();
    } catch (error) {
      console.error("Error cancelling ticket:", error);
    }
  };

  const handleReviewSubmit = async (): Promise<void> => {
    if (!selectedTicket || !user) return;

    try {
      await submitReview({
        rating: rating,
        content: reviewContent,
        ticketId: selectedTicket.id,
        userId: user.id,
        busId: selectedTicket.scheduleId.busId.id,
      });
      setReview(false);
      setRating(0);
      setReviewContent("");
      await refetch();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-72px)] bg-[#F2F4F7] max-md:pb-[100px]">
      <Tabs
        defaultActiveKey="1"
        onChange={setActiveTab}
        className="bg-white rounded-md px-4 w-[70%] pb-4"
      >
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Hiện tại</p>} key="1">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {tickets && (
              <Table
                dataSource={waitingTickets}
                columns={columns}
                pagination={{ pageSize: 4 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Đã đi</p>} key="2">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {tickets && (
              <Table
                dataSource={completedTickets}
                columns={columns}
                pagination={{ pageSize: 4 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Đã hủy</p>} key="3">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {tickets && (
              <Table
                dataSource={cancelledTickets}
                columns={columns}
                pagination={{ pageSize: 4 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title="Xác nhận hủy vé"
        open={confirm}
        onCancel={() => setConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirm(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" onClick={handleCancelTicket}>
            Xác nhận
          </Button>,
        ]}
      >
        <p>Bạn có chắc chắn muốn hủy vé này không?</p>
      </Modal>
      <Modal
        title="Đánh giá chuyến đi"
        open={review}
        onCancel={() => setReview(false)}
        footer={[
          <Button key="cancel" onClick={() => setReview(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" onClick={handleReviewSubmit}>
            Đăng
          </Button>,
        ]}
      >
        <Form layout="vertical" onFinish={handleReviewSubmit}>
          <Form.Item label="Đánh giá sao" name="rating">
            <Rate value={rating} onChange={setRating} />
          </Form.Item>
          <Form.Item label="Nhận xét" name="review">
            <Input.TextArea
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Chi tiết Vé"
        open={modal}
        footer={[
          <Button key="ok" type="primary" onClick={handleClose}>
            Xong
          </Button>,
        ]}
      >
        {selectedTicket && (
          <>
            <div className="flex items-center justify-center gap-5">
              <div>
                <div className="pl-4">
                  <p>
                    Thời gian: {formatDate(selectedTicket?.scheduleId?.startTime)} -{" "}
                    {formatTime(selectedTicket?.scheduleId?.startTime)}
                  </p>
                  <p>
                    Địa điểm: {selectedTicket?.scheduleId?.routeId?.origin} -{" "}
                    {selectedTicket?.scheduleId?.routeId?.destination}
                  </p>
                  <p>Xe: {selectedTicket?.scheduleId?.busId?.licensePlate}</p>
                  <p>Loại xe: {selectedTicket?.scheduleId?.busId?.totalSeats} chỗ</p>
                  <p>Số ghế: {selectedTicket?.seatNumbers.join(", ")}</p>
                </div>
              </div>
            </div>
            <div className="text-end w-full mt-3 text-lg">
              Tổng thanh toán: {formatCurrency(selectedTicket?.price)}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserStorage;

