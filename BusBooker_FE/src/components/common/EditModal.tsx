import React, { ReactNode } from "react";
import { Modal, Button } from "antd";

interface EditModalProps {
  open: boolean;
  onSave: () => void;
  onCancel: () => void;
  title: string;
  children: ReactNode;
  loading?: boolean;
  saveText?: string;
  cancelText?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  open,
  onSave,
  onCancel,
  title,
  children,
  loading = false,
  saveText = "Lưu",
  cancelText = "Hủy",
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button key="save" type="primary" onClick={onSave} loading={loading}>
          {saveText}
        </Button>,
      ]}
    >
      {children}
    </Modal>
  );
};

export default EditModal;

