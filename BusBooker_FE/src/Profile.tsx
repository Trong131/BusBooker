import { Button, Col, Form, Input, notification, Row } from "antd";
import React, { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { updateUser, uploadAvatar } from "./services/authService";

interface ProfileFormValues {
  username: string;
  email: string;
  phoneNumber: string;
}

const Profile: React.FC = () => {
  const [form] = Form.useForm<ProfileFormValues>();
  const { user, setUser } = useAuth();
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    user?.avatar
  );

  const onValuesChange = (changedValues: Partial<ProfileFormValues>): void => {
    setIsChanged(
      changedValues.username !== user?.username ||
        changedValues.email !== user?.email ||
        changedValues.phoneNumber !== user?.phoneNumber ||
        !!selectedImage
    );
  };

  const onFinish = async (value: ProfileFormValues): Promise<void> => {
    try {
      if (selectedImage && value.email) {
        await uploadAvatar(value.email, selectedImage);
      }
      const updatedUser = await updateUser(value);
      setUser({
        ...updatedUser,
        avatar: selectedImage ? imagePreview : user?.avatar,
      });
      notification.success({ message: "Cập nhật thông tin thành công" });
      setIsChanged(false);
      setSelectedImage(null);
    } catch (error) {
      notification.error({ message: "Lỗi" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      onValuesChange({});
    }
  };

  const handleFileSelectClick = (): void => {
    document.getElementById("file-input")?.click();
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-72px)]">
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="w-[40%] border-2 shadow-md rounded-md p-5"
        initialValues={{
          username: user?.username,
          email: user?.email,
          phoneNumber: user?.phoneNumber,
        }}
        onValuesChange={onValuesChange}
      >
        <p className="text-2xl text-center text-[#1677ff] font-bold pb-5">
          Hồ sơ cá nhân
        </p>
        <Row gutter={[16, 8]}>
          <Col span={12} className="flex justify-center items-center">
            <div className="flex justify-center items-center">
              <div
                className="w-[150px] h-[150px] cursor-pointer"
                onClick={handleFileSelectClick}
              >
                <img
                  src={imagePreview || user?.avatar}
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <input
                type="file"
                style={{ display: "none" }}
                id="file-input"
                accept="image/*"
                onChange={handleFileChange}
                name="avatar"
              />
            </div>
          </Col>
          <Col span={12}>
            <Form.Item label="Họ tên:" name="username">
              <Input />
            </Form.Item>
            <Form.Item label="Email:" name="email">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Số điện thoại:" name="phoneNumber">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full py-4"
            disabled={!isChanged}
          >
            Lưu thông tin
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
