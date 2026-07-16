import { useState, useEffect } from "react";
import { getTicketsByUserId } from "../services/ticketService";
import { Ticket } from "../types";

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user tickets
 */
export const useTickets = (userId: string | undefined): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async (): Promise<void> => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getTicketsByUserId(userId);
      setTickets(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch tickets";
      setError(errorMessage);
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  return { tickets, loading, error, refetch: fetchTickets };
};
