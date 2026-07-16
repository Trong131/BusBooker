import api from "./api";
import { API_ENDPOINTS } from "../constants";
import { setAccessToken } from "../utils/storageUtils";
import {
  LoginCredentials,
  RegisterData,
  User,
  UpdateUserData,
  ChangePasswordData,
  LoginResponse,
} from "../types";

/**
 * Login user
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    API_ENDPOINTS.LOGIN,
    credentials
  );
  const { accessToken } = response.data;
  if (accessToken) {
    setAccessToken(accessToken);
  }
  return response.data;
};

/**
 * Register new user
 */
export const register = async (userData: RegisterData): Promise<User> => {
  const response = await api.post<User>(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Get current user information
 */
export const getUserInfo = async (): Promise<User> => {
  const response = await api.get<User>(API_ENDPOINTS.USER_INFO);
  return response.data;
};

/**
 * Update user information
 */
export const updateUser = async (userData: UpdateUserData): Promise<User> => {
  const response = await api.put<User>(API_ENDPOINTS.UPDATE_USER, userData);
  return response.data;
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (
  email: string,
  avatarFile: File
): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append("avatar", avatarFile);
  const response = await api.put<{ avatar: string }>(
    `${API_ENDPOINTS.UPLOAD_AVATAR}?email=${email}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Forgot password
 */
export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    API_ENDPOINTS.FORGOT_PASSWORD,
    { email }
  );
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    API_ENDPOINTS.CHANGE_PASSWORD,
    passwordData
  );
  return response.data;
};
