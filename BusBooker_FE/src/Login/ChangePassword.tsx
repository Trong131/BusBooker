import { Button, Form, Input, notification } from "antd";
import React from "react";
import { changePassword } from "../services/authService";
import { ChangePasswordData } from "../types";

interface ChangePasswordFormValues {
  oldP: string;
  newP: string;
  confirm: string;
}

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordFormValues>();

  const onFinish = async (value: ChangePasswordFormValues): Promise<void> => {
    try {
      await changePassword({
        oldPassword: value.oldP,
        newPassword: value.newP,
      });
      notification.success({ message: "Đổi mật khẩu thành công" });
      form.resetFields();
    } catch (error) {
      notification.error({ message: "Mật khẩu cũ không đúng" });
    }
  };

  return (
    <div className="bg-blue-100 h-[calc(100vh-72px)] flex items-center justify-center">
      <Form
        form={form}
        onFinish={onFinish}
        className="bg-white w-[400px] p-5 rounded-lg"
        layout="vertical"
      >
        <p className="text-center mb-4 text-xl font-semibold text-[#1677ff]">
          Đổi mật khẩu
        </p>
        <Form.Item
          label="Mật khẩu cũ"
          name="oldP"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu cũ!",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu cũ" className="p-2" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu mới"
          name="newP"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu mới!",
            },
            {
              min: 6,
              message: "Mật khẩu phải có ít nhất 6 ký tự!",
            },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" className="p-2" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Xác nhận mật khẩu mới"
          dependencies={["newP"]}
          hasFeedback
          className=" mb-10"
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newP") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password className="p-2" placeholder="Xác nhận mật khẩu" />
        </Form.Item>
        <Button type="primary" htmlType="submit" className="w-full py-4">
          Thay đổi
        </Button>
      </Form>
    </div>
  );
};

export default ChangePassword;

