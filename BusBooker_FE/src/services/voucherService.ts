import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { Voucher } from "../types";

/**
 * Get all vouchers
 */
export const getAllVouchers = async (): Promise<Voucher[]> => {
  const response = await api.get<Voucher[]>(API_ENDPOINTS.VOUCHERS);
  return response.data;
};
