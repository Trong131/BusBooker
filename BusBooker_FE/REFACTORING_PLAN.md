# BusBooker Refactoring Plan - Clean Architecture

## Cấu trúc mới (theo pattern admin-panel)

```
src/
├── app.tsx                    # Main app component
├── main.tsx                   # Entry point
├── assets/                    # Static assets
├── components/                # Shared components
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── Footer.tsx
│   ├── routes/
│   │   └── ListRoutes.tsx
│   ├── vouchers/
│   │   └── ListVoucher.tsx
│   ├── comments/
│   │   └── ListBestComment.tsx
│   ├── home/
│   │   └── Flexin.tsx
│   └── search/
│       └── DatePicker.tsx
├── pages/                     # Page components
│   ├── home/
│   │   └── HomePage.tsx
│   ├── search/
│   │   └── SearchPage.tsx
│   ├── route-detail/
│   │   ├── RouteDetailPage.tsx
│   │   └── components/
│   ├── payment/
│   │   └── PaymentPage.tsx
│   ├── user-storage/
│   │   └── UserStoragePage.tsx
│   ├── profile/
│   │   └── ProfilePage.tsx
│   ├── register-sale/
│   │   └── RegisterSalePage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ChangePasswordPage.tsx
│   └── manager/
│       ├── ManagerPage.tsx
│       ├── users/
│       │   └── UsersPage.tsx
│       ├── tickets/
│       │   └── TicketsPage.tsx
│       ├── vouchers/
│       │   └── VouchersPage.tsx
│       ├── bus/
│       │   └── BusPage.tsx
│       ├── routes/
│       │   └── RoutesPage.tsx
│       ├── schedules/
│       │   └── SchedulesPage.tsx
│       └── garage/
│           └── GaragePage.tsx
├── routes/                    # Routing configuration
│   └── Router.tsx
├── providers/                 # Context providers
│   └── UserProvider.tsx
├── hooks/                     # Shared hooks
│   ├── useAuth.ts
│   ├── useRoutes.ts
│   └── useTickets.ts
├── services/                  # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── routeService.ts
│   ├── ticketService.ts
│   ├── scheduleService.ts
│   ├── voucherService.ts
│   └── notificationService.ts
├── types/                     # Type definitions
│   ├── index.ts
│   └── context.ts
├── utils/                     # Utility functions
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   └── storageUtils.ts
└── constants/                 # Constants
    └── index.ts
```

## Migration Steps

1. ✅ Create providers/UserProvider.tsx
2. ✅ Create routes/Router.tsx
3. ✅ Create components/layout/Layout.tsx
4. ✅ Create pages/home/HomePage.tsx
5. ✅ Create pages/search/SearchPage.tsx
6. ⏳ Move components to components/
7. ⏳ Move pages to pages/
8. ⏳ Update all imports
9. ⏳ Update App.tsx to use Router
10. ⏳ Update main.tsx to use new providers path

