import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Table,
  Tabs,
} from "antd";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { RiEditFill } from "react-icons/ri";
import { getAllRoutes } from "../services/routeService";
import { Route } from "../types";
import api from "../services/api";
import type { ColumnsType } from "antd/es/table";
import Loading from "../components/common/Loading";

interface RouteFormData {
  origin: string;
  destination: string;
  basisPrice: string;
  afterDiscount: string;
}

interface CreateRouteFormValues {
  origin: string;
  destination: string;
  basisPrice: number;
  afterDiscount: number;
}

const RouteManage: React.FC = () => {
  const [listRoute, setListRoute] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form] = Form.useForm<CreateRouteFormValues>();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const routes = await getAllRoutes();
        setListRoute(routes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [routeIdToDelete, setRouteIdToDelete] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [routeForm, setRouteForm] = useState<RouteFormData>({
    origin: "",
    destination: "",
    basisPrice: "",
    afterDiscount: "",
  });

  const handleEdit = (route: Route): void => {
    setSelectedRoute(route);
    setRouteForm({
      origin: route.origin,
      destination: route.destination,
      basisPrice: route.basisPrice?.toString() || "",
      afterDiscount: route.afterDiscount?.toString() || "",
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = (routeId: string): void => {
    setRouteIdToDelete(routeId);
    setConfirmDelete(true);
  };

  const confirmDeleteRoute = async (): Promise<void> => {
    if (!routeIdToDelete) return;

    try {
      await api.delete(`/routes/${routeIdToDelete}`);
      setListRoute(listRoute.filter((route) => route.id !== routeIdToDelete));
      setConfirmDelete(false);
      setRouteIdToDelete(null);
      notification.success({ message: "Xóa tuyến đường thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi khi xóa tuyến đường" });
    }
  };

  const cancelDeleteRoute = (): void => {
    setConfirmDelete(false);
    setRouteIdToDelete(null);
  };

  const handleSaveChanges = async (): Promise<void> => {
    if (!selectedRoute) return;

    try {
      const updatedRoute = await api.put<Route>(
        `/routes/${selectedRoute.id}`,
        routeForm
      );
      setListRoute(
        listRoute.map((route) =>
          route.id === selectedRoute.id ? updatedRoute.data : route
        )
      );
      setIsEditModalVisible(false);
      notification.success({ message: "Cập nhật tuyến đường thành công" });
    } catch (error) {
      notification.error({ message: "Lỗi cập nhật tuyến đường" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setRouteForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const onFinish = async (values: CreateRouteFormValues): Promise<void> => {
    try {
      const response = await api.post<Route>("/routes", {
        ...values,
        img: "https://f1e425bd6cd9ac6.cmccloud.com.vn/cms-tool/destination/images/25/img_hero.png",
      });
      notification.success({ message: "Tạo tuyến đường thành công" });
      form.resetFields();
      setListRoute([...listRoute, response.data]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      notification.error({
        message: "Error creating route",
        description: errorMessage,
      });
    }
  };

  const filteredRoute = (routes: Route[]): Route[] => {
    return routes.filter((route) => {
      const { origin, destination } = route;
      return (
        origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        destination?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const columns: ColumnsType<Route> = [
    {
      title: "Điểm đi",
      dataIndex: "origin",
      key: "origin",
    },
    {
      title: "Điểm đến",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "Giá gốc",
      dataIndex: "basisPrice",
      key: "basisPrice",
      render: (price: number) => price?.toLocaleString("vi-VN"),
    },
    {
      title: "Giá sau giảm",
      dataIndex: "afterDiscount",
      key: "afterDiscount",
      render: (price: number) => price?.toLocaleString("vi-VN"),
    },
    {
      title: "Chỉnh sửa",
      key: "action",
      render: (_: string, record: Route) => (
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
          tab={<p className="w-1/3 font-semibold text-lg">Danh sách tuyến đường</p>}
          key="1"
        >
          <Input
            placeholder="Tìm kiếm "
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 mb-3"
          />
          <Loading loading={loading} tip="Đang tải dữ liệu...">
            {listRoute && (
              <Table
                dataSource={filteredRoute(listRoute)}
                columns={columns}
                pagination={{ pageSize: 6 }}
                rowKey="id"
              />
            )}
          </Loading>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={<p className="w-1/3 font-semibold text-lg">Thêm tuyến đường</p>}
          key="2"
        >
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="w-1/2 m-auto border-2 shadow-md rounded-md px-5 pt-4"
          >
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Form.Item
                  label="Điểm đi:"
                  name="origin"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập điểm đi!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập điểm đi" className="p-2" />
                </Form.Item>
                <Form.Item
                  label="Giá gốc:"
                  name="basisPrice"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá gốc!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Nhập giá gốc"
                    className="p-2"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Điểm đến:"
                  name="destination"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng điểm đến!",
                    },
                  ]}
                >
                  <Input placeholder="Nhập điểm đến" className="p-2" />
                </Form.Item>
                <Form.Item
                  label="Giá sau giảm:"
                  name="afterDiscount"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá sau giảm!",
                    },
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="Nhập giá sau giảm"
                    className="p-2"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        title="Chỉnh sửa tuyến đường"
        open={isEditModalVisible}
        onOk={handleSaveChanges}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <div>
          <div className="mb-3">
            <label htmlFor="origin">Điểm đi:</label>
            <Input
              id="origin"
              name="origin"
              value={routeForm.origin}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="destination">Điểm đến:</label>
            <Input
              id="destination"
              name="destination"
              value={routeForm.destination}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="basisPrice">Giá gốc:</label>
            <Input
              id="basisPrice"
              name="basisPrice"
              value={routeForm.basisPrice}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="afterDiscount">Giá sau giảm:</label>
            <Input
              id="afterDiscount"
              name="afterDiscount"
              value={routeForm.afterDiscount}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="Xác nhận xóa tuyến đường"
        open={confirmDelete}
        onOk={confirmDeleteRoute}
        onCancel={cancelDeleteRoute}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa tuyến đường này không?</p>
      </Modal>
    </div>
  );
};

export default RouteManage;

