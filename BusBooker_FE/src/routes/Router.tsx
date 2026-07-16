import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "../components/layout/Layout";
import { lazy } from "react";

const HomePage = lazy(() => import("../pages/home/HomePage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const RouteDetailPage = lazy(
  () => import("../pages/route-detail/RouteDetailPage")
);
const PaymentPage = lazy(() => import("../pages/payment/PaymentPage"));
const UserStoragePage = lazy(
  () => import("../pages/user-storage/UserStoragePage")
);
const RegisterSalePage = lazy(
  () => import("../pages/register-sale/RegisterSalePage")
);
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const ChangePasswordPage = lazy(
  () => import("../pages/auth/ChangePasswordPage")
);
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage")
);
const ManagerPage = lazy(() => import("../pages/manager/ManagerPage"));
const ManagerUsersPage = lazy(() => import("../pages/manager/users/UsersPage"));
const ManagerTicketsPage = lazy(
  () => import("../pages/manager/tickets/TicketsPage")
);
const ManagerVouchersPage = lazy(
  () => import("../pages/manager/vouchers/VouchersPage")
);
const ManagerBusPage = lazy(() => import("../pages/manager/bus/BusPage"));
const ManagerRoutesPage = lazy(
  () => import("../pages/manager/routes/RoutesPage")
);
const ManagerSchedulesPage = lazy(
  () => import("../pages/manager/schedules/SchedulesPage")
);
const ManagerGaragePage = lazy(
  () => import("../pages/manager/garage/GaragePage")
);

export const createRouter = () =>
  createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="" element={<Layout />}>
          <Route path="" element={<SearchPage />}>
            <Route path="" element={<HomePage />} />
            <Route path="/route-details" element={<RouteDetailPage />} />
          </Route>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/my-storage" element={<UserStoragePage />} />
          <Route path="/register-sale" element={<RegisterSalePage />} />
          <Route path="/my-profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/manager" element={<ManagerPage />}>
            <Route path="/manager/users" element={<ManagerUsersPage />} />
            <Route path="/manager/tickets" element={<ManagerTicketsPage />} />
            <Route path="/manager/vouchers" element={<ManagerVouchersPage />} />
            <Route path="/manager/bus" element={<ManagerBusPage />} />
            <Route path="/manager/routes" element={<ManagerRoutesPage />} />
            <Route
              path="/manager/schedules"
              element={<ManagerSchedulesPage />}
            />
            <Route path="/manager/garage" element={<ManagerGaragePage />} />
          </Route>
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </>
    )
  );
