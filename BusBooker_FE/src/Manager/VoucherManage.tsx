import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Table,
  Tabs,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiEditFill } from "react-icons/ri";
import { getAllVouchers } from "../services/voucherService";
import { Voucher, DiscountType } from "../types";
import { formatDate, formatDateForAPI } from "../utils/dateUtils";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants";
import dayjs, { Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

const { Option } = Select;

interface VoucherFormData {
  code: string;
  name: string;
  description: string;
  expiryDate: string;
}

interface CreateVoucherFormValues {
  code: string;
  name: string;
  description: string;
  discount: number;
  discountType: DiscountType;
  count: number;
  expiryDate: Dayjs;
}

const VoucherManage: React.FC = () => {
  const [listVoucher, setListVoucher] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [voucherIdToDelete, setVoucherIdToDelete] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [form] = Form.useForm<CreateVoucherFormValues>();

  const [voucherForm, setVoucherForm] = useState<VoucherFormData>({
    code: "",
    name: "",
    description: "",
    expiryDate: "",
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const vouchers = await getAllVouchers();
        setListVoucher(vouchers);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (voucher: Voucher): void => {
    setSelectedVoucher(voucher);
    setVoucherForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || "",
      expiryDate: voucher.expiryDate,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (voucherId: string): void => {
    setVoucherIdToDelete(voucherId);
    setConfirmDelete(true);
  };

  const confirmDeleteVoucher = async (): Promise<void> => {
    if (!voucherIdToDelete) return;

    try {
      await api.delete(`/vouchers/${voucherIdToDelete}`);
      setListVoucher(
        listVoucher.filter((voucher) => voucher.id !== voucherIdToDelete)
      );
      setConfirmDelete(false);
      setVoucherIdToDelete(null);
      notification.success({ message: "Xóa voucher thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi khi xóa voucher" });
    }
  };

  const cancelDeleteVoucher = (): void => {
    setConfirmDelete(false);
    setVoucherIdToDelete(null);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!selectedVoucher) return;

    try {
      const updatedVoucher = await api.put<Voucher>(
        `/vouchers/${selectedVoucher.id}`,
        voucherForm
      );
      setListVoucher(
        listVoucher.map((voucher) =>
          voucher.id === selectedVoucher.id ? updatedVoucher.data : voucher
        )
      );
      setIsEditModalVisible(false);
      notification.success({ message: "Cập nhật voucher thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật voucher" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setVoucherForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const onFinish = async (values: CreateVoucherFormValues): Promise<void> => {
    try {
      const formattedExpiryDate = formatDateForAPI(values.expiryDate.toISOString());
      const response = await api.post<Voucher>("/vouchers/create", {
        ...values,
        expiryDate: formattedExpiryDate,
      });
      notification.success({ message: "Tạo khuyến mãi thành công" });
      form.resetFields();
      setListVoucher([...listVoucher, response.data]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      notification.error({
        message: "Error creating voucher",
        description: errorMessage,
      });
    }
  };

  const filteredVoucher = (vouchers: Voucher[]): Voucher[] => {
    return vouchers.filter((voucher) => {
      const { code } = voucher;
      return code?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const columns: ColumnsType<Voucher> = [
    {
      title: "Mã Voucher",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Giảm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Nội dung",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text: string) => {
        return <p>{formatDate(text)}</p>;
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (createdBy: Voucher["createdBy"]) => {
        return <p>{createdBy?.username || ""}</p>;
      },
    },
    {
      title: "Chỉnh sửa",
      key: "action",
      render: (_: string, record: Voucher) => (
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
    <div>
      <Tabs defaultActiveKey="1" className="bg-white rounded-md px-4 w-full pb-4">
        <Tabs.TabPane
          tab={<p className="w-1/3 font-semibold text-lg">Danh sách khuyến mãi</p>}
          key="1"
        >
          <Input
            placeholder="Tìm kiếm "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 mb-3"
          />
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listVoucher && (
              <Table
                dataSource={filteredVoucher(listVoucher)}
                columns={columns}
                pagination={{ pageSize: 6 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<p className="w-1/3 font-semibold text-lg">Thêm khuyến mãi</p>}
          key="2"
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="w-1/2 m-auto border-2 shadow-md rounded-md px-5 pt-4"
          >
            <Form.Item
              label="Mã Code:"
              name="code"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã code!",
                },
              ]}
            >
              <Input placeholder="Nhập mã code" className="p-2" />
            </Form.Item>

            <Form.Item
              label="Tiêu đề:"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tiêu đề!",
                },
              ]}
            >
              <Input placeholder="Nhập tiêu đề" className="p-2" />
            </Form.Item>
            <Row className="flex gap-2 items-center">
              <Form.Item
                label="Giảm:"
                name="discount"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tiền giảm!",
                  },
                ]}
              >
                <InputNumber size="large" min={0} />
              </Form.Item>
              <Form.Item
                label="Đơn vị:"
                name="discountType"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đơn vị!",
                  },
                ]}
              >
                <Select size="large">
                  <Option value="percent">%</Option>
                  <Option value="fixed">k</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Số lượng:"
                name="count"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng!",
                  },
                ]}
              >
                <InputNumber size="large" min={0} />
              </Form.Item>
              <Form.Item
                label="Ngày hết hạn:"
                name="expiryDate"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày hết hạn!",
                  },
                ]}
              >
                <DatePicker size="large" />
              </Form.Item>
            </Row>
            <Form.Item
              label="Nội dung:"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập nội dung!",
                },
              ]}
            >
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title="Chỉnh sửa voucher"
        open={isEditModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div>
          <div className="mb-3">
            <label htmlFor="code">Code:</label>
            <Input
              id="code"
              name="code"
              value={voucherForm.code}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name">Giảm:</label>
            <Input
              id="name"
              name="name"
              value={voucherForm.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description">Nội dung:</label>
            <Input
              id="description"
              name="description"
              value={voucherForm.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="expiryDate">Ngày hết hạn:</label>
            <Input
              id="expiryDate"
              name="expiryDate"
              value={formatDate(voucherForm.expiryDate)}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="Xác nhận xóa voucher"
        open={confirmDelete}
        onOk={confirmDeleteVoucher}
        onCancel={cancelDeleteVoucher}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa mã khuyến mãi này không?</p>
      </Modal>
    </div>
  );
};

export default VoucherManage;

