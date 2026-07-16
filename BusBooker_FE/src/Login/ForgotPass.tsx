import { Button, Form, Input } from "antd";
import React from "react";
import { IoBus } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPass: React.FC = () => {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const nav = useNavigate();

  const onFinish = async (value: ForgotPasswordFormValues): Promise<void> => {
    try {
      await forgotPassword(value.email);
      nav("/login");
    } catch (error) {
      console.error("Error sending forgot password email:", error);
    }
  };

  return (
    <div className="bg-blue-100 h-screen flex items-center justify-center">
      <Form
        form={form}
        onFinish={onFinish}
        className="bg-white w-[400px] p-5 rounded-lg"
      >
        <p className="text-center font-bold text-3xl mb-4 text-[#1677ff] flex justify-center items-center gap-2">
          <IoBus className="text-yellow-300 text-3xl" />
          BusBooker
        </p>
        <p className="text-center mb-4 text-xl font-semibold text-[#1677ff]">
          Quên mật khẩu
        </p>
        <p className="text-center mb-6">
          Để khôi phục nhập khẩu, bạn vui lòng nhập Email đã dùng để đăng ký trên hệ thống.
        </p>
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
          <Input placeholder="Nhập email của bạn" className="p-2" />
        </Form.Item>
        <Button type="primary" htmlType="submit" className="w-full py-4">
          Gửi
        </Button>
      </Form>
    </div>
  );
};

export default ForgotPass;

