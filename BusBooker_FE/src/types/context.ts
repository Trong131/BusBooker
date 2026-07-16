import { User } from "./index";
import { LoginCredentials } from "./index";

export interface AuthContextType {
  user: User | null;
  authenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}
