export const API_BASE_URL: string = import.meta.env.VITE_APP_BE_URL;

export const TICKET_STATUS = {
  WAITING: "waiting",
  BOOKED: "booked",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_METHODS = {
  DIRECT: "direct",
  BANK: "bank",
} as const;

export const USER_ROLES = {
  CUSTOMER: "Customer",
  ADMIN: "Admin",
  OPERATOR: "Operator",
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  ORIGIN_CHOICE: "originChoice",
  DESTI_CHOICE: "destiChoice",
  DATE_CHOICE: "dateChoice",
  RETURN_DATE_CHOICE: "returnDateChoice",
  START_TIME: "startTime",
  END_TIME: "endTime",
  CHIEU_DI: "chieuDi",
  GIA_CHIEU_DI: "giaChieuDi",
  CHIEU_VE: "chieuVe",
  GIA_CHIEU_VE: "giaChieuVe",
  CLICK_COUNT: "clickCount",
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/users/login",
  REGISTER: "/users/register",
  USER_INFO: "/users/infor",
  UPDATE_USER: "/users/update-user",
  UPLOAD_AVATAR: "/users/up-avatar",
  FORGOT_PASSWORD: "/users/forgot-password",
  CHANGE_PASSWORD: "/users/change-password",

  ROUTES: "/routes",
  ROUTES_SEARCH: "/routes/find-schedule",

  TICKETS: "/tickets",
  TICKETS_BY_USER: "/tickets/userId",
  TICKETS_CANCEL: "/tickets/cancel",
  TICKETS_REVIEW: "/tickets/review",

  SCHEDULE_BOOK_SEAT: "/schedule/book-seat",

  VOUCHERS: "/vouchers",

  NOTIFICATIONS_ALL: "/noti/all",
  NOTIFICATION_UPDATE: "/noti",
} as const;

export const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  [TICKET_STATUS.WAITING]: {
    text: "Thanh toán trực tiếp",
    color: "text-orange-400",
  },
  [TICKET_STATUS.BOOKED]: { text: "Đã thanh toán", color: "text-green-500" },
  [TICKET_STATUS.COMPLETED]: { text: "Đã hoàn thành", color: "text-green-500" },
  [TICKET_STATUS.CANCELLED]: { text: "Đã hủy", color: "text-red-400" },
};

export const TIMEZONE = {
  VIETNAM: "Asia/Ho_Chi_Minh",
  UTC: "UTC",
} as const;
