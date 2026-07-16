import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { Route } from "../types";

export interface SearchRoutesParams {
  origin: string;
  destination: string;
  startTime: string;
}

/**
 * Get all routes
 */
export const getAllRoutes = async (): Promise<Route[]> => {
  const response = await api.get<Route[]>(API_ENDPOINTS.ROUTES);
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Search routes
 */
export const searchRoutes = async (
  params: SearchRoutesParams
): Promise<Route[]> => {
  const { origin, destination, startTime } = params;
  const queryParams = new URLSearchParams({
    origin,
    destination,
    startTime,
  });
  const response = await api.get<Route[]>(
    `${API_ENDPOINTS.ROUTES_SEARCH}?${queryParams}`
  );
  return response.data;
};
