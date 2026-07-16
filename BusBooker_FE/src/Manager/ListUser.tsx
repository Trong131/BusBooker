import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Table, Modal, Input, notification } from "antd";
import { RiEditFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { User } from "../types";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

interface UserFormData {
  username: string;
  email: string;
  phoneNumber: string;
}

const ListUser: React.FC = () => {
  const [listUser, setListUser] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [userForm, setUserForm] = useState<UserFormData>({
    username: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await api.get<User[]>("/users");
        setListUser(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (user: User): void => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (userId: string): void => {
    setUserIdToDelete(userId);
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async (): Promise<void> => {
    if (!userIdToDelete) return;

    try {
      await api.delete(`/users/${userIdToDelete}`);
      setListUser(listUser.filter((user) => user.id !== userIdToDelete));
      setConfirmDelete(false);
      setUserIdToDelete(null);
      notification.success({ message: "Xóa người dùng thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi khi xóa người dùng" });
    }
  };

  const cancelDeleteUser = (): void => {
    setConfirmDelete(false);
    setUserIdToDelete(null);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!selectedUser) return;

    try {
      const updatedUser = await api.put<User>(
        `/users/userId/${selectedUser.id}`,
        userForm
      );
      setListUser(
        listUser.map((user) =>
          user.id === selectedUser.id ? updatedUser.data : user
        )
      );
      setIsEditModalVisible(false);
      notification.success({ message: "Cập nhật người dùng thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật người dùng" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const filteredUser = (users: User[]): User[] => {
    return users.filter((user) => {
      const { email, phoneNumber, username, role, owner } = user;
      return (
        email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const columns: ColumnsType<User> = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (text: string) => {
        return <img src={text} alt="avatar" className="w-12 h-12 rounded-full" />;
      },
    },
    {
      title: "Tên",
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
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (_: string, record: User) => {
        return record.owner ? (
          <p>
            {record.role} - {record.owner}
          </p>
        ) : (
          <p>{record.role}</p>
        );
      },
    },
    {
      title: "Chỉnh sửa",
      key: "action",
      render: (_: string, record: User) => (
        <div className="flex cursor-pointer text-lg gap-5">
          <p onClick={() => handleEdit(record)}>
            <RiEditFill />
          </p>
          <p
            className="text-red-500"
            onClick={() => handleDelete(record.id)}
          >
            <FaTrash />
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="">
      <Input
        placeholder="Tìm kiếm "
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-3"
      />

      <Loading loading={loading} tip="Đang tải dữ liệu...">
        <Table
          dataSource={filteredUser(listUser)}
          columns={columns}
          className="w-full"
          pagination={{ pageSize: 6 }}
          rowKey="id"
        />
      </Loading>

      <Modal
        title="Chỉnh sửa người dùng"
        open={isEditModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div>
          <div className="mb-3">
            <label htmlFor="username">Tên:</label>
            <Input
              id="username"
              name="username"
              value={userForm.username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email">Email:</label>
            <Input
              id="email"
              name="email"
              value={userForm.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phoneNumber">Số điện thoại:</label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={userForm.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Xác nhận xóa người dùng"
        open={confirmDelete}
        onOk={confirmDeleteUser}
        onCancel={cancelDeleteUser}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
      </Modal>
    </div>
  );
};

export default ListUser;

