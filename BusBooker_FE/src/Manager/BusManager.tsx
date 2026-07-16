import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Table,
  Tabs,
  Upload,
  UploadFile,
} from "antd";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiEditFill } from "react-icons/ri";
import { MdOutlineFileUpload } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { Bus, User } from "../types";
import api from "../services/api";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

const { Option } = Select;

interface BusFormData {
  status: string;
}

interface CreateBusFormValues {
  totalSeats: string;
  owner: string;
  licensePlate: string;
  img: UploadFile[];
}

const BusManager: React.FC = () => {
  const [listBus, setListBus] = useState<Bus[]>([]);
  const [listUser, setListUser] = useState<User[]>([]);
  const { user } = useAuth();
  const [form] = Form.useForm<CreateBusFormValues>();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const [busResponse, userResponse] = await Promise.all([
          api.get<Bus[]>("/bus"),
          api.get<User[]>("/users"),
        ]);
        let busData = busResponse.data;
        setListUser(userResponse.data);
        if (user?.role === "Operator") {
          busData = busData.filter((bus) => bus.owner === user.owner);
        }
        setListBus(busData);
      } catch (error) {
        console.error("Error fetching buses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getUniqueOwners = (users: User[]): string[] => {
    const owners = users
      .map((user) => user.owner)
      .filter(
        (owner): owner is string => owner !== undefined && owner?.trim() !== ""
      );
    return [...new Set(owners)];
  };

  const uniqueOwners = getUniqueOwners(listUser);

  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [busIdToDelete, setBusIdToDelete] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [busForm, setBusForm] = useState<BusFormData>({
    status: "",
  });

  const handleEdit = (bus: Bus): void => {
    setSelectedBus(bus);
    setBusForm({
      status: bus.status || "active",
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (busId: string): void => {
    setBusIdToDelete(busId);
    setConfirmDelete(true);
  };

  const confirmDeleteBus = async (): Promise<void> => {
    if (!busIdToDelete) return;

    try {
      await api.delete(`/bus/${busIdToDelete}`);
      setListBus(listBus.filter((bus) => bus.id !== busIdToDelete));
      setConfirmDelete(false);
      setBusIdToDelete(null);
      notification.success({ message: "Xóa bus thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi khi xóa bus" });
    }
  };

  const cancelDeleteBus = (): void => {
    setConfirmDelete(false);
    setBusIdToDelete(null);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!selectedBus) return;

    try {
      const updatedBus = await api.put<Bus>(
        `/bus/update/${selectedBus.id}`,
        busForm
      );
      setListBus(
        listBus.map((bus) =>
          bus.id === selectedBus.id ? updatedBus.data : bus
        )
      );
      setIsEditModalVisible(false);
      notification.success({ message: "Cập nhật bus thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật bus" });
    }
  };

  const handleInputChange = (value: string, name: string): void => {
    setBusForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const onFinish = async (values: CreateBusFormValues): Promise<void> => {
    try {
      const response = await api.post<Bus>("/bus/add", {
        totalSeats: parseInt(values.totalSeats),
        owner: values.owner,
        licensePlate: values.licensePlate,
      });

      const busId = response.data.id;
      const files = form.getFieldValue("img");

      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file: UploadFile) => {
          if (file.originFileObj) {
            formData.append("img", file.originFileObj);
          }
        });
        await api.put(`/bus/img/${busId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      notification.success({ message: "Tạo xe thành công" });
      form.resetFields();
      setListBus([...listBus, response.data]);
    } catch (error) {
      console.error("Lỗi khi tạo xe:", error);
      notification.error({ message: "Lỗi khi tạo xe" });
    }
  };

  const filteredBus = (buses: Bus[]): Bus[] => {
    return buses.filter((bus) => {
      const { licensePlate, owner } = bus;
      return (
        licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const columns: ColumnsType<Bus> = [
    {
      title: "Biển số xe",
      dataIndex: "licensePlate",
      key: "licensePlate",
    },
    {
      title: "Nhà xe",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Số ghế",
      dataIndex: "totalSeats",
      key: "totalSeats",
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        return text === "active" ? (
          <p className="text-green-500">{text}</p>
        ) : (
          <p className="text-red-500">{text}</p>
        );
      },
    },
    {
      title: "Chỉnh sửa",
      key: "action",
      render: (_: string, record: Bus) => (
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
          tab={<p className="w-1/3 font-semibold text-lg">Danh sách xe</p>}
          key="1"
        >
          <Input
            placeholder="Tìm kiếm "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 mb-3"
          />
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listBus && (
              <Table
                dataSource={filteredBus(listBus)}
                columns={columns}
                pagination={{ pageSize: 6 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<p className="w-1/3 font-semibold text-lg">Tạo mới xe</p>}
          key="2"
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="w-1/2 m-auto border-2 shadow-md rounded-md px-5 pt-4"
          >
            <Form.Item
              label="Số lượng chỗ ngồi:"
              name="totalSeats"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn số lượng chỗ ngồi!",
                },
              ]}
            >
              <Select size="large">
                <Option value="9">9</Option>
                <Option value="11">11</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Nhà xe:"
              name="owner"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhà xe!",
                },
              ]}
            >
              <Select size="large">
                {uniqueOwners.map((item, index) => (
                  <Option value={item} key={index}>
                    {item}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Biển số xe:"
              name="licensePlate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập biển số xe!",
                },
              ]}
            >
              <Input placeholder="Nhập biển số xe" className="p-2" />
            </Form.Item>
            <Form.Item
              name="img"
              rules={[{ required: true, message: "Vui lòng upload ảnh!" }]}
            >
              <Upload
                listType="picture"
                beforeUpload={() => false}
                maxCount={4}
                multiple
                onChange={({ fileList }) =>
                  form.setFieldsValue({ img: fileList })
                }
              >
                <Button icon={<MdOutlineFileUpload />}>Upload (Max: 4)</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full mt-6">
                Thêm mới
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title="Cập nhật bus"
        open={isEditModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div>
          <div className="">
            <label htmlFor="status">Tình trạng:</label>
            <Select
              size="large"
              key="status"
              className="w-40 ml-5"
              value={busForm.status}
              onSelect={(value) => handleInputChange(value, "status")}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Bảo trì</Option>
            </Select>
          </div>
        </div>
      </Modal>
      <Modal
        title="Xác nhận xóa bus"
        open={confirmDelete}
        onOk={confirmDeleteBus}
        onCancel={cancelDeleteBus}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa bus này không?</p>
      </Modal>
    </div>
  );
};

export default BusManager;
