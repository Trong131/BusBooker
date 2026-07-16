import { useContext } from "react";
import { UserContext } from "../providers/UserProvider";
import { AuthContextType } from "../types/context";

/**
 * Custom hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within UserProvider");
  }
  return context;
};
