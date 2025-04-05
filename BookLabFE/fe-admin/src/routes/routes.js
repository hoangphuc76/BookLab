import config from "../config";

// Pages
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import Dashboard from "../components/Dashboard";
import Manager from "../pages/Manager";
import OrderItem from "../features/Order/OrderItem";
import RoleManager from "../components/RoleManager";
import BuildingManager from "../components/BuildingManager";
import CategoryRoomManager from "../components/CategoryRoomManager";
import RoomManager from "../components/RoomManager";
import AccountManager from "../components/AccountManager";
import Helps from "../components/Helps";
import ImportBooking from "../features/ImportBooking/ImportBooking";
//import Helps from "../components/Helps";
import BookingHistory from "../features/Booking/BookingHistory";
import BookingRequests from "../features/Booking/BookingRequest";

// Public routes
const publicRoutes = [
  { path: config.routes.Login, component: Login, layout: null },
];

// Private routes
const privateRoutes = [
  {
    path: "/admin",
    component: Admin,
    allowedRoles: [1], // Only allow roleId 1 (Admin)
    children: [
      { path: "", component: Dashboard },
      { path: "Role", component: RoleManager },
      { path: "Building", component: BuildingManager },
      { path: "Account", component: AccountManager },
      { path: "RoomCategory", component: CategoryRoomManager },
      { path: "Room", component: RoomManager },
      { path: "helps", component: Helps },
    ],
  },
  {
    path: '/manager',
    component: Manager,
    allowedRoles: [2], // Only allow roleId 2 (Manager)
    children: [
      {
        path: 'booking',
        component: OrderItem,
      },
      {
        path: 'bookingImport',
        component: ImportBooking,
      },
      {
        path: 'book-his',
        component: BookingHistory,
      },
      { path: "", component: Dashboard },
      {path: "book-req", component: BookingRequests},
      { path: "helps", component: Helps },
      { path: "Room", component: RoomManager },
    ]
  }
];

export { publicRoutes, privateRoutes };