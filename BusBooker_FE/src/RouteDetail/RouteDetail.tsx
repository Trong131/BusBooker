import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ScheduleCard from "./ScheduleCard";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { searchRoutes } from "../services/routeService";
import { Route } from "../types";
import { formatDateForAPI, getDefaultDate } from "../utils/dateUtils";
import Loading from "../components/common/Loading";
import { STORAGE_KEYS } from "../constants";
import { getStorageItem } from "../utils/storageUtils";

dayjs.extend(customParseFormat);

const RouteDetail: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const endTime = searchParams.get("returnDate");
  const [text, setText] = useState<string>("Chiều đi");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const originParam = searchParams.get("origin");
      const destiParam = searchParams.get("destination");
      const dateParam = searchParams.get("date");

      if (originParam) setOrigin(originParam);
      if (destiParam) setDestination(destiParam);

      const existingChieuDi = getStorageItem<any>(STORAGE_KEYS.CHIEU_DI);
      const existingChieuVe = getStorageItem<any>(STORAGE_KEYS.CHIEU_VE);
      if (existingChieuDi && !existingChieuVe && endTime) {
        setText("Chiều về");
        console.log("RouteDetail - Hiển thị Chiều về");
        console.log("  - existingChieuDi:", existingChieuDi);
        console.log("  - existingChieuVe:", existingChieuVe);
        console.log("  - endTime:", endTime);
      } else {
        setText("Chiều đi");
        console.log("RouteDetail - Hiển thị Chiều đi");
        console.log("  - existingChieuDi:", existingChieuDi);
        console.log("  - existingChieuVe:", existingChieuVe);
        console.log("  - endTime:", endTime);
      }

      if (originParam && destiParam) {
        try {
          setLoading(true);
          let startTime: string;
          if (dateParam) {
            startTime = formatDateForAPI(dayjs(dateParam));
          } else {
            const defaultDate = getDefaultDate();
            startTime = formatDateForAPI(defaultDate);
          }
          const data = await searchRoutes({
            origin: originParam,
            destination: destiParam,
            startTime,
          });
          setRoutes(data);
        } catch (error) {
          console.error("Error fetching routes:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams, endTime]);

  return (
    <div className="max-md:mb-[60px] pb-12 pt-5 flex items-center justify-center flex-col gap-5 bg-[#F2F4F7]">
      <Loading loading={loading} tip="Đang tìm chuyến xe...">
        {endTime !== null && (
          <p className="text-2xl font-bold text-blue-600 mb-2">{text}</p>
        )}
        <p className="text-xl">
          Có{" "}
          <span className="font-bold">{routes[0]?.schedules?.length || 0}</span>{" "}
          chuyến xe đi từ{" "}
          <span className="font-bold">{origin || routes[0]?.origin || ""}</span>{" "}
          đến{" "}
          <span className="font-bold">
            {destination || routes[0]?.destination || ""}
          </span>
        </p>
        {routes.length > 0 &&
          routes[0]?.schedules?.map((item, index) => (
            <ScheduleCard
              item={item}
              key={index}
              setText={setText}
              endTime={endTime}
            />
          ))}
      </Loading>
    </div>
  );
};

export default RouteDetail;
