import { Button, Col, Form, Input, notification, Row } from "antd";
import React from "react";
import api from "./services/api";
import { API_ENDPOINTS } from "./constants";

interface RegisterSaleFormValues {
  username: string;
  phoneNumber: string;
  email: string;
  garage: string;
}

const RegisterSale: React.FC = () => {
  const [form] = Form.useForm<RegisterSaleFormValues>();

  const onFinish = async (value: RegisterSaleFormValues): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.NOTIFICATIONS_ALL.replace("/all", ""), value);
      notification.success({ message: "Gửi thông tin thành công" });
      form.resetFields();
    } catch {
      notification.error({ message: "Gửi thông tin không thành công" });
    }
  };

  return (
    <div className="bg-blue-100 h-[calc(100vh-72px)] flex">
      <div className="flex flex-col items-center w-1/2 m-auto max-md:hidden">
        <p className="text-4xl text-center font-semibold">
          Tăng 30% lượng khách đặt vé khi mở bán online ngay hôm nay!
        </p>
        <p className="mt-10 font-semibold text-xl">
          Đăng ký miễn phí và chỉ mất 1 phút để hoàn tất
        </p>
      </div>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="bg-white p-5 w-[400px] rounded-lg m-auto"
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
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
              <Input placeholder="Nhập họ tên" className="p-2" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Số điện thoại liên hệ"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại!",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" className="p-2" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 8]}>
          <Col span={12}>
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
          </Col>

          <Col span={12}>
            <Form.Item label="Tên nhà xe" name="garage">
              <Input placeholder="Nhập tên nhà xe" className="p-2" />
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit" className="w-full py-4">
          Gửi
        </Button>
      </Form>
    </div>
  );
};

export default RegisterSale;

