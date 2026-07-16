import { Button, Form, Input, notification } from "antd";
import React from "react";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants";

interface AddGarageFormValues {
  username: string;
  email: string;
  phoneNumber: string;
  owner: string;
}

const AddGarage: React.FC = () => {
  const [form] = Form.useForm<AddGarageFormValues>();

  const onFinish = async (value: AddGarageFormValues): Promise<void> => {
    try {
      await api.put(`${API_ENDPOINTS.UPDATE_USER.replace("/update-user", "")}/email`, value);
      notification.success({ message: "Thêm nhà xe thành công" });
      form.resetFields();
    } catch (error) {
      notification.error({ message: "Email chưa được đăng ký" });
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="w-[40%] border-2 shadow-md rounded-md p-5"
      >
        <p className="text-2xl text-center text-[#1677ff] font-bold pb-5">
          Đăng ký nhà xe
        </p>
        <Form.Item
          label="Tên người đăng ký:"
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên người đăng ký!" }]}
        >
          <Input placeholder="Nhập tên người đăng ký" />
        </Form.Item>
        <Form.Item
          label="Email:"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại:"
          name="phoneNumber"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item
          label="Tên nhà xe:"
          name="owner"
          rules={[{ required: true, message: "Vui lòng nhập tên nhà xe!" }]}
        >
          <Input placeholder="Nhập tên nhà xe" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full py-4">
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddGarage;

