import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoutes } from "../../services/routeService";
import { Route } from "../../types";
import { formatCurrency } from "../../utils/formatUtils";
import { getDefaultDate, formatDateForAPI } from "../../utils/dateUtils";
import SectionContainer from "../common/SectionContainer";
import SectionTitle from "../common/SectionTitle";
import HorizontalScrollContainer from "../common/HorizontalScrollContainer";
import Card from "../common/Card";
import Loading from "../common/Loading";

const ListRoutes: React.FC = () => {
  const nav = useNavigate();
  const [listRoutes, setListRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        const routes = await getAllRoutes();
        setListRoutes(routes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleClick = (item: Route): void => {
    const defaultDate = getDefaultDate();
    const formattedDate = formatDateForAPI(defaultDate);
    const params = new URLSearchParams({
      origin: item.origin,
      destination: item.destination,
      date: formattedDate,
    });
    nav(`/route-details?${params.toString()}`);
  };

  return (
    <SectionContainer>
      <SectionTitle>Tuyến đường phổ biến</SectionTitle>
      <Loading loading={loading} tip="Đang tải dữ liệu...">
        <HorizontalScrollContainer>
          {listRoutes.map((item, index) => {
          return (
            <Card key={index} onClick={() => handleClick(item)}>
              {(item as any)?.img && (
                <img
                  src={(item as any).img}
                  alt={`${item.origin} - ${item.destination}`}
                  className="w-full h-44 object-cover max-md:h-[100px]"
                />
              )}
              <div className="p-2 flex flex-col justify-between h-full">
                <p className="font-semibold text-lg text-gray-800">
                  {item?.origin} - {item?.destination}
                </p>
                <p className="text-gray-600 text-md">
                  Từ{" "}
                  {(item as any)?.afterDiscount ? (
                    <>
                      <span className="text-red-500 font-bold text-lg">
                        {formatCurrency((item as any).afterDiscount)}
                      </span>
                      <span className="line-through text-gray-400 text-md ml-2">
                        {formatCurrency((item as any).basisPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500 font-bold text-lg">
                      {formatCurrency((item as any).basisPrice || 0)}
                    </span>
                  )}
                </p>
              </div>
            </Card>
          );
        })}
        </HorizontalScrollContainer>
      </Loading>
    </SectionContainer>
  );
};

export default ListRoutes;

