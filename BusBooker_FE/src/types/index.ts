export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  role: "Customer" | "Admin" | "Operator";
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance?: number;
  duration?: number;
  schedules?: Schedule[];
  basisPrice?: number;
  afterDiscount?: number;
  img?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Schedule {
  id: string;
  routeId: Route;
  busId: Bus;
  startTime: string;
  endTime: string;
  availableSeats: number[];
  bookedSeats: number[];
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Bus {
  id: string;
  licensePlate: string;
  totalSeats: number;
  busType?: string;
  garageId?: Garage;
  owner?: string;
  img?: string[];
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface Seat {
  id: string;
  seatNumber: string;
  price: number;
  location: "front" | "middle" | "back";
  isBooked: boolean;
}

export interface ScheduleWithSeats extends Schedule {
  seats?: Seat[];
}

export interface Garage {
  id: string;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TicketStatus = "waiting" | "booked" | "completed" | "cancelled";
export type PaymentMethod = "direct" | "bank";

export interface Ticket {
  id: string;
  userId: string;
  scheduleId: Schedule;
  seatNumbers: string[];
  price: number;
  status: TicketStatus;
  paymentMethod: PaymentMethod;
  email: string;
  username: string;
  phoneNumber: string;
  voucher?: string;
  hasReviewed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTicketData {
  email: string;
  username: string;
  phoneNumber: string;
  status: TicketStatus;
  price: number;
  userId: string;
  paymentMethod: PaymentMethod;
  voucher?: string;
  scheduleId: string;
  seatNumbers: string[];
}

export interface ReviewData {
  rating: number;
  content: string;
  ticketId: string;
  userId: string;
  busId: string;
}

export type DiscountType = "percent" | "fixed";

export interface Voucher {
  id: string;
  name: string;
  code: string;
  discount: number;
  discountType: DiscountType;
  expiryDate: string;
  description?: string;
  count?: number;
  minPurchase?: number;
  maxDiscount?: number;
  createdBy?: {
    id: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  email: string;
  username: string;
  phoneNumber: string;
  garage: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingChoice {
  scheduleId: string;
  seatNumber: string[];
  startTime: string;
  licensePlate: string;
  totalSeats: number;
  busId: string;
  origin?: string;
  destination?: string;
}

export interface BookingStorage {
  originChoice?: string;
  destiChoice?: string;
  startTime?: string;
  endTime?: string | null;
  chieuDi?: BookingChoice;
  giaChieuDi?: number;
  chieuVe?: BookingChoice;
  giaChieuVe?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user?: User;
}

export interface DatePickerProps {
  check: boolean;
  listRoutes: Route[];
}

export interface RouteDetailProps {
  route: Route;
}

export interface ScheduleCardProps {
  item: Schedule;
  setText: (text: string) => void;
  endTime: string | null;
}

export interface PaymentFormData {
  username: string;
  email: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
}
