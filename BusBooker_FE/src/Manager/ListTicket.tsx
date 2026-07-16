import { Button, Input, Modal, Table, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { IoInformationCircle } from "react-icons/io5";
import { FiXCircle } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { Ticket, TicketStatus } from "../types";
import { formatDate, formatTime, formatTimeFromDB } from "../utils/dateUtils";
import { formatCurrency } from "../utils/formatUtils";
import { STATUS_LABELS, TICKET_STATUS } from "../constants";
import { cancelTicket } from "../services/ticketService";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

const ListTicket: React.FC = () => {
  const [listTicket, setListTicket] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [completedTickets, setCompletedTickets] = useState<Ticket[]>([]);
  const [cancelledTickets, setCancelledTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data } = await api.get<Ticket[]>("/tickets/all");
        if (user?.role === "Operator") {
          const filteredData = data.filter((ticket) => {
            const isDepartureValid =
              ticket?.scheduleId?.busId?.owner === user?.owner;
            return isDepartureValid;
          });
          setListTicket(filteredData);
          return;
        } else {
          setListTicket(data);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (listTicket.length) {
      const waiting = listTicket.filter(
        (ticket) =>
          ticket.status === TICKET_STATUS.WAITING ||
          ticket.status === TICKET_STATUS.BOOKED
      );
      const completed = listTicket.filter(
        (ticket) => ticket.status === TICKET_STATUS.COMPLETED
      );
      const cancelled = listTicket.filter(
        (ticket) => ticket.status === TICKET_STATUS.CANCELLED
      );
      setWaitingTickets(waiting);
      setCompletedTickets(completed);
      setCancelledTickets(cancelled);
    }
  }, [listTicket]);

  const [modal, setModal] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
            {formatDate(schedule?.startTime)} -{" "}
            {formatTimeFromDB(schedule?.startTime)}
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
      title: "Tên khách",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
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
    ...(user?.role !== "Operator" && activeTab === "1"
      ? [
          {
            title: "Hủy vé",
            key: "cancel",
            render: (_: string, record: Ticket) => {
              return (
                <p
                  className="cursor-pointer text-xl text-red-500"
                  onClick={() => {
                    setSelectedTicket(record);
                    setConfirm(true);
                  }}
                >
                  <FiXCircle />
                </p>
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
      const { data } = await api.get<Ticket[]>("/tickets/all");
      setListTicket(data);
    } catch (error) {
      console.error("Error cancelling ticket:", error);
    }
  };

  const filteredTickets = (tickets: Ticket[]): Ticket[] => {
    return tickets.filter((ticket) => {
      const { username, email, phoneNumber } = ticket;
      return (
        username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  return (
    <div className=" bg-[#F2F4F7] max-md:pb-[100px]">
      <Input
        placeholder="Tìm kiếm "
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-3"
      />
      <Tabs
        defaultActiveKey="1"
        onChange={setActiveTab}
        className="bg-white rounded-md px-4 w-full pb-4"
      >
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Hiện tại</p>} key="1">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listTicket && (
              <Table
                dataSource={filteredTickets(waitingTickets)}
                columns={columns}
                pagination={{ pageSize: 8 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Đã đi</p>} key="2">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listTicket && (
              <Table
                dataSource={filteredTickets(completedTickets)}
                columns={columns}
                pagination={{ pageSize: 8 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane tab={<p className="w-1/3 font-semibold text-lg">Đã hủy</p>} key="3">
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listTicket && (
              <Table
                dataSource={filteredTickets(cancelledTickets)}
                columns={columns}
                pagination={{ pageSize: 8 }}
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
                  <p>Địa điểm: {selectedTicket?.scheduleId?.routeId?.origin}</p>
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

export default ListTicket;

