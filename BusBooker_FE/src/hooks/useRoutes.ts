import { useState, useEffect } from "react";
import { getAllRoutes } from "../services/routeService";
import { Route } from "../types";

interface UseRoutesReturn {
  routes: Route[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage routes
 */
export const useRoutes = (): UseRoutesReturn => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRoutes();
      setRoutes(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch routes";
      setError(errorMessage);
      console.error("Error fetching routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return { routes, loading, error, refetch: fetchRoutes };
};
