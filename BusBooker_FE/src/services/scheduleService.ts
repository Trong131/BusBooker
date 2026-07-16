import api from "./api";
import { API_ENDPOINTS } from "../constants";

export interface BookSeatData {
  scheduleId: string;
  seatNumber: string[];
}

/**
 * Book seat in schedule
 */
export const bookSeat = async (
  bookingData: BookSeatData
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    API_ENDPOINTS.SCHEDULE_BOOK_SEAT,
    bookingData
  );
  return response.data;
};
