import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { Notification } from "../types";

/**
 * Get all notifications
 */
export const getAllNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>(
    API_ENDPOINTS.NOTIFICATIONS_ALL
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<Notification> => {
  const response = await api.put<Notification>(
    `${API_ENDPOINTS.NOTIFICATION_UPDATE}/${notificationId}`
  );
  return response.data;
};
