import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Table,
  Tabs,
} from "antd";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiEditFill } from "react-icons/ri";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { useAuth } from "../hooks/useAuth";
import type { Schedule, Route, Bus } from "../types";
import { formatDate, formatTimeFromDB } from "../utils/dateUtils";
import api from "../services/api";
import { getAllRoutes } from "../services/routeService";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const { Option } = Select;

interface ScheduleFormData {
  startTime: string;
  endTime: string;
}

interface CreateScheduleFormValues {
  routeId: string;
  busId: string;
  startTime: Dayjs;
  endTime: Dayjs;
  front: number;
  middle: number;
  back: number;
}

const Schedule: React.FC = () => {
  const [listSchedule, setListSchedule] = useState<Schedule[]>([]);
  const [listRoute, setListRoute] = useState<Route[]>([]);
  const [listBus, setListBus] = useState<Bus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const [form] = Form.useForm<CreateScheduleFormValues>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [scheduleResponse, routeResponse, busResponse] =
          await Promise.all([
            api.get<Schedule[]>("/schedule/all"),
            getAllRoutes(),
            api.get<Bus[]>("/bus"),
          ]);

        let scheduleData = scheduleResponse.data;
        let busData = busResponse.data;

        if (user?.role === "Operator") {
          busData = busData.filter((bus) => bus.owner === user.owner);
          const busIds = busData.map((bus) => bus.id);
          scheduleData = scheduleData.filter((schedule) =>
            busIds.includes(schedule.busId.id)
          );
        }

        setListBus(busData);
        setListSchedule(scheduleData);
        setListRoute(routeResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [scheduleIdToDelete, setScheduleIdToDelete] = useState<string | null>(
    null
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    startTime: "",
    endTime: "",
  });

  const handleEdit = (schedule: Schedule): void => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (scheduleId: string): void => {
    setScheduleIdToDelete(scheduleId);
    setConfirmDelete(true);
  };

  const confirmDeleteSchedule = async (): Promise<void> => {
    if (!scheduleIdToDelete) return;

    try {
      await api.delete(`/schedule/${scheduleIdToDelete}`);
      setListSchedule(
        listSchedule.filter((schedule) => schedule.id !== scheduleIdToDelete)
      );
      setConfirmDelete(false);
      setScheduleIdToDelete(null);
      notification.success({ message: "Xóa lịch trình thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi khi xóa lịch trình" });
    }
  };

  const cancelDeleteSchedule = (): void => {
    setConfirmDelete(false);
    setScheduleIdToDelete(null);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!selectedSchedule) return;

    try {
      const updatedSchedule = await api.put<Schedule>(
        `/schedule/update/${selectedSchedule.id}`,
        scheduleForm
      );
      setListSchedule(
        listSchedule.map((schedule) =>
          schedule.id === selectedSchedule.id
            ? {
                ...schedule,
                startTime: updatedSchedule.data.startTime,
                endTime: updatedSchedule.data.endTime,
              }
            : schedule
        )
      );
      setIsEditModalVisible(false);
      notification.success({ message: "Cập nhật lịch trình thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật lịch trình" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setScheduleForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const formatDateToUTC = (date: Dayjs | null): string | null => {
    if (!date) return null;
    return date.utc(true).format();
  };

  const onFinish = async (values: CreateScheduleFormValues): Promise<void> => {
    try {
      const formattedStartTime = formatDateToUTC(values.startTime);
      const formattedEndTime = formatDateToUTC(values.endTime);

      if (!formattedStartTime || !formattedEndTime) {
        notification.error({ message: "Vui lòng chọn thời gian hợp lệ" });
        return;
      }

      const response = await api.post<Schedule>("/schedule", {
        routeId: values.routeId,
        busId: values.busId,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        price: {
          front: values.front,
          middle: values.middle,
          back: values.back,
        },
      });
      notification.success({ message: "Tạo lịch trình thành công" });
      form.resetFields();
      setListSchedule([...listSchedule, response.data]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      notification.error({
        message: "Error creating schedule",
        description: errorMessage,
      });
    }
  };

  const filteredSchedule = (schedules: Schedule[]): Schedule[] => {
    return schedules.filter((schedule) => {
      const { routeId, busId, endTime, startTime } = schedule;
      return (
        routeId?.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        routeId?.destination
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        busId?.licensePlate
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        endTime?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        startTime?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: "Điểm đi",
      dataIndex: "routeId",
      key: "origin",
      render: (route: Schedule["routeId"]) => {
        return route?.origin && <p>{route.origin}</p>;
      },
    },
    {
      title: "Điểm đến",
      dataIndex: "routeId",
      key: "destination",
      render: (route: Schedule["routeId"]) => {
        return <p>{route?.destination}</p>;
      },
    },
    {
      title: "Xe",
      dataIndex: "busId",
      key: "licensePlate",
      render: (bus: Schedule["busId"]) => {
        return <p>{bus?.licensePlate}</p>;
      },
    },
    {
      title: "Thời gian đi",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => {
        return (
          <p>
            {formatDate(text)} - {formatTimeFromDB(text)}
          </p>
        );
      },
    },
    {
      title: "Thời gian đến",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: string) => {
        return (
          <p>
            {formatDate(text)} - {formatTimeFromDB(text)}
          </p>
        );
      },
    },
    {
      title: "Tổng số ghế",
      dataIndex: "busId",
      key: "totalSeats",
      render: (bus: Schedule["busId"]) => {
        return <p>{bus?.totalSeats}</p>;
      },
    },
    {
      title: "Số ghế còn lại",
      dataIndex: "availableSeats",
      key: "availableSeats",
      render: (seats: number[]) => {
        return <p>{seats?.length || 0}</p>;
      },
    },
    {
      title: "Chỉnh sửa",
      key: "action",
      render: (_: string, record: Schedule) => (
        <div className="flex cursor-pointer text-lg gap-5">
          <p onClick={() => handleEdit(record)}>
            <RiEditFill />
          </p>
          <p className="text-red-500" onClick={() => handleDelete(record.id)}>
            <FaTrash />
          </p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        className="bg-white rounded-md px-4 w-full pb-4"
      >
        <Tabs.TabPane
          tab={
            <p className="w-1/3 font-semibold text-lg">Danh sách lịch trình</p>
          }
          key="1"
        >
          <Input
            placeholder="Tìm kiếm "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 mb-3"
          />
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listSchedule && (
              <Table
                dataSource={filteredSchedule(listSchedule)}
                columns={columns}
                pagination={{ pageSize: 6 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<p className="w-1/3 font-semibold text-lg">Thêm lịch trình</p>}
          key="2"
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="w-1/2 m-auto border-2 shadow-md rounded-md px-5 pt-4"
          >
            <Form.Item
              label="Tuyến đường:"
              name="routeId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn tuyến đường!",
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                filterOption={(input, option) => {
                  const label = String(option?.label ?? option?.value ?? "");
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {listRoute.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.origin} - {item.destination}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Xe:"
              name="busId"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn xe!",
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                filterOption={(input, option) => {
                  const label = String(option?.label ?? option?.value ?? "");
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {listBus.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.licensePlate}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Thời gian xuất phát:"
              name="startTime"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian xuất phát!",
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{
                  defaultValue: dayjs("00:00", "HH:mm"),
                }}
                size="large"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              label="Thời gian đến:"
              name="endTime"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian đến!",
                },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{
                  defaultValue: dayjs("00:00", "HH:mm"),
                }}
                size="large"
                className="w-full"
              />
            </Form.Item>
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Form.Item
                  label="Giá ghế trước:"
                  name="front"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá cho ghế trước!",
                    },
                  ]}
                >
                  <InputNumber min={0} size="large" className="w-full" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Giá ghế giữa:"
                  name="middle"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá cho ghế giữa!",
                    },
                  ]}
                >
                  <InputNumber min={0} size="large" className="w-full" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Giá ghế sau:"
                  name="back"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá cho ghế sau!",
                    },
                  ]}
                >
                  <InputNumber min={0} size="large" className="w-full" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title="Chỉnh sửa lịch trình"
        open={isEditModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div>
          <div className="mb-3">
            <label htmlFor="startTime">Thời gian đi:</label>
            <Input
              id="startTime"
              name="startTime"
              value={scheduleForm.startTime}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="endTime">Thời gian đến:</label>
            <Input
              id="endTime"
              name="endTime"
              value={scheduleForm.endTime}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="Xác nhận xóa lịch trình"
        open={confirmDelete}
        onOk={confirmDeleteSchedule}
        onCancel={cancelDeleteSchedule}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa lịch trình này không?</p>
      </Modal>
    </div>
  );
};

export default Schedule;
