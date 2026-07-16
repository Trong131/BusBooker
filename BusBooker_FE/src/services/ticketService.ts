import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { Ticket, CreateTicketData, ReviewData } from "../types";

/**
 * Get tickets by user ID
 */
export const getTicketsByUserId = async (userId: string): Promise<Ticket[]> => {
  const response = await api.get<Ticket[]>(
    API_ENDPOINTS.TICKETS_BY_USER,
    { params: { userId } }
  );
  return response.data;
};

/**
 * Create new ticket
 */
export const createTicket = async (
  ticketData: CreateTicketData
): Promise<Ticket> => {
  const response = await api.post<Ticket>(API_ENDPOINTS.TICKETS, ticketData);
  return response.data;
};

/**
 * Cancel ticket
 */
export const cancelTicket = async (
  ticketId: string
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    API_ENDPOINTS.TICKETS_CANCEL,
    { ticketId }
  );
  return response.data;
};

/**
 * Submit review for ticket
 */
export const submitReview = async (
  reviewData: ReviewData
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    API_ENDPOINTS.TICKETS_REVIEW,
    reviewData
  );
  return response.data;
};
