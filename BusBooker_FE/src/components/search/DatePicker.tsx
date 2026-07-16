import { DatePicker, Select, Skeleton, Button } from "antd";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { FaCircleDot, FaLocationDot } from "react-icons/fa6";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Route } from "../../types";
import { isDateDisabled } from "../../utils/dateUtils";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

interface DatePickerSpaceProps {
  check: boolean;
  listRoutes: Route[];
  loading?: boolean;
}

const DatePickerSpace: React.FC<DatePickerSpaceProps> = ({
  check,
  listRoutes,
  loading = false,
}) => {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<string | string[] | null>(
    null
  );

  const [originUI, setOriginUI] = useState<string | null>(
    searchParams.get("origin")
  );
  const [destiUI, setDestiUI] = useState<string | null>(
    searchParams.get("destination")
  );

  useEffect(() => {
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    const originParam = searchParams.get("origin");
    const destiParam = searchParams.get("destination");
    const dateParam = searchParams.get("date");
    const returnDateParam = searchParams.get("returnDate");

    if (originParam) {
      setOriginUI(originParam);
    }

    if (destiParam) {
      setDestiUI(destiParam);
    }

    if (check) {
      if (dateParam) {
        const dateOnly = dateParam.split('T')[0];
        setSelectedDates(dateOnly);
      }
    } else {
      if (dateParam && returnDateParam) {
        const dateOnly = dateParam.split('T')[0];
        const returnDateOnly = returnDateParam.split('T')[0];
        setSelectedDates([dateOnly, returnDateOnly]);
      }
    }

    setSearchLoading(false);
  }, [searchParams, check]);

  const uniqueOrigins = Array.from(
    new Set(listRoutes.map((route) => route.origin))
  ).sort();
  const uniqueDestinations = Array.from(
    new Set(listRoutes.map((route) => route.destination))
  ).sort();

  const handleOriginChange = (value: string): void => {
    setOriginUI(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("origin", value);
    setSearchParams(newParams, { replace: true });
  };

  const handleDestinationChange = (value: string): void => {
    setDestiUI(value);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("destination", value);
    setSearchParams(newParams, { replace: true });
  };

  const handleDateChange = (
    dates: Dayjs | [Dayjs | null, Dayjs | null] | null
  ): void => {
    const newParams = new URLSearchParams(searchParams);

    if (!dates) {
      setSelectedDates(null);
      newParams.delete("date");
      if (!check) {
        newParams.delete("returnDate");
      }
      setSearchParams(newParams, { replace: true });
      return;
    }

    if (check) {
      const singleDate = dates as Dayjs;
      const dateStr = singleDate.format("YYYY-MM-DD");
      setSelectedDates(dateStr);
      newParams.set("date", dateStr);
    } else {
      const dateRange = dates as [Dayjs | null, Dayjs | null];
      if (dateRange[0] && dateRange[1]) {
        const startDateStr = dateRange[0].format("YYYY-MM-DD");
        const endDateStr = dateRange[1].format("YYYY-MM-DD");
        setSelectedDates([startDateStr, endDateStr]);
        newParams.set("date", startDateStr);
        newParams.set("returnDate", endDateStr);
      }
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearch = async (): Promise<void> => {
    if (!originUI || !destiUI) {
      alert("Vui lòng chọn điểm đi và điểm đến!");
      return;
    }

    const params = new URLSearchParams({
      origin: originUI,
      destination: destiUI,
    });

    if (check) {
      if (!selectedDates || typeof selectedDates !== "string") {
        alert("Vui lòng chọn ngày đi!");
        return;
      }
      params.set("date", selectedDates);
    } else {
      if (
        !selectedDates ||
        !Array.isArray(selectedDates) ||
        selectedDates.length !== 2
      ) {
        alert("Vui lòng chọn ngày đi và ngày về!");
        return;
      }
      params.set("date", selectedDates[0]);
      params.set("returnDate", selectedDates[1]);
    }

    setSearchLoading(true);
    nav(`/route-details?${params.toString()}`);

    setSearchLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 max-md:grid-cols-1">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold text-sm">
            <FaCircleDot className="text-blue-500" />
            Nơi xuất phát
          </p>
          <Skeleton.Input active size="large" className="w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold text-sm">
            <FaLocationDot className="text-red-500" />
            Nơi đến
          </p>
          <Skeleton.Input active size="large" className="w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-semibold text-sm">
            <FaRegCalendarAlt className="text-blue-600" />
            {check ? "Ngày đi" : "Ngày đi và về"}
          </p>
          <Skeleton.Input active size="large" className="w-full" />
        </div>
        <div className="h-full flex items-end">
          <Skeleton.Button active size="large" className="w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[2fr_2fr_3fr_1fr] gap-4 max-md:grid-cols-1">
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-semibold text-sm">
          <FaCircleDot className="text-blue-500" />
          Nơi xuất phát
        </p>
        <Select
          size="large"
          placeholder="Chọn nơi xuất phát"
          value={originUI}
          onChange={handleOriginChange}
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? option?.value ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          className="w-full"
        >
          {uniqueOrigins.map((origin) => (
            <Select.Option key={origin} value={origin} label={origin}>
              {origin}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-semibold text-sm">
          <FaLocationDot className="text-red-500" />
          Nơi đến
        </p>
        <Select
          size="large"
          placeholder="Chọn nơi đến"
          value={destiUI}
          onChange={handleDestinationChange}
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? option?.value ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          className="w-full"
        >
          {uniqueDestinations.map((destination) => (
            <Select.Option
              key={destination}
              value={destination}
              label={destination}
            >
              {destination}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-semibold text-sm">
          <FaRegCalendarAlt className="text-blue-600" />
          {check ? "Ngày đi" : "Ngày đi và về"}
        </p>
        {check ? (
          <DatePicker
            size="large"
            placeholder="Chọn thời điểm"
            value={selectedDates ? dayjs(selectedDates as string) : null}
            onChange={handleDateChange}
            disabledDate={isDateDisabled}
            format="DD/MM/YYYY"
            className="w-full"
          />
        ) : (
          <RangePicker
            size="large"
            placeholder={["Chọn thời điểm", "Chọn thời điểm"]}
            value={
              selectedDates && Array.isArray(selectedDates)
                ? [dayjs(selectedDates[0]), dayjs(selectedDates[1])]
                : null
            }
            onChange={handleDateChange}
            disabledDate={isDateDisabled}
            format="DD/MM/YYYY"
            className="w-full"
          />
        )}
      </div>
      <div className="h-full flex items-end">
        <Button
          onClick={handleSearch}
          loading={searchLoading}
          className="bg-yellow-400 hover:bg-yellow-300 w-full h-[39.6px] rounded-md text-md font-semibold text-black border-none"
        >
          Tìm kiếm
        </Button>
      </div>
    </div>
  );
};

export default DatePickerSpace;
