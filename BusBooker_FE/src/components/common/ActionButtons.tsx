import React from "react";
import { RiEditFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { Button } from "antd";

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  editText?: string;
  deleteText?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  editText,
  deleteText,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        type="primary"
        icon={<RiEditFill />}
        onClick={onEdit}
        size="small"
      >
        {editText || "Sửa"}
      </Button>
      <Button
        type="primary"
        danger
        icon={<FaTrash />}
        onClick={onDelete}
        size="small"
      >
        {deleteText || "Xóa"}
      </Button>
    </div>
  );
};

export default ActionButtons;

