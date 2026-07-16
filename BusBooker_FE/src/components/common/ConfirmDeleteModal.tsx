import React from "react";
import { Modal, Button } from "antd";

interface ConfirmDeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  content?: string;
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "Xác nhận xóa",
  content = "Bạn có chắc chắn muốn xóa mục này?",
  loading = false,
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="confirm" type="primary" danger onClick={onConfirm} loading={loading}>
          Xóa
        </Button>,
      ]}
    >
      <p>{content}</p>
    </Modal>
  );
};

export default ConfirmDeleteModal;

