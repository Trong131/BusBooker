import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRoutes } from "../services/routeService";
import { Route } from "../types";
import { formatCurrency } from "../utils/formatUtils";
import { getDefaultDate, formatDateForAPI } from "../utils/dateUtils";

const ListRoutes: React.FC = () => {
  const nav = useNavigate();
  const [listRoutes, setListRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const routes = await getAllRoutes();
        setListRoutes(routes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };
    fetchData();
  }, []);

  const handleClick = (item: Route): void => {
    const params = new URLSearchParams({
      origin: item.origin,
      destination: item.destination,
    });
    nav(`/route-details?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-md:w-[90%] w-[70%] mt-[50px]">
      <p className="text-2xl font-semibold">Tuyến đường phổ biến</p>
      <div className="flex overflow-x-auto whitespace-nowrap gap-4 p-4 snap-x snap-mandatory">
        {listRoutes.map((item, index) => {
          return (
            <div
              key={index}
              className="h-68 max-md:h-48 max-md:w-[210px] w-[350px] flex-shrink-0 rounded-lg shadow-lg bg-white flex flex-col overflow-hidden snap-start cursor-pointer pb-1"
              onClick={() => handleClick(item)}
            >
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListRoutes;

