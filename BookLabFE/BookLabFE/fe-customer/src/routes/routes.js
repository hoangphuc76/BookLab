import config from "../config";

// Layouts

// Pages
import HomePage from "../pages/HomePage.jsx";
import Profile from "../pages/Profilev2.jsx";
import Login from "../pages/Login.jsx";
import StudentManagePage from "../pages/StudentManagePage.jsx";
import ViewRoomPage from "../pages/ViewRoomPage.jsx";
import Header from "../components/Header.jsx";
import RoomDetailPage from "../pages/RoomDetailPage.jsx";
import GroupDetailPage from "../pages/GroupDetailPage.jsx";
import MarkAttendance from "../pages/MarkAttendancePage.jsx";
import SchedulePage from "../pages/Schedule/SchedulePage.jsx";
import OneDayBooking from "../components/OneDayBooking.jsx";
import BookLabCalendar from "../pages/RoomBooking/BookLabCalendar.jsx"
import Helps from "../pages/Helps.jsx";
import Layout_1 from "../components/Layout_1.jsx";
import Layout_2 from "../components/Layout_2.jsx";
import AccountDetailPage from "../pages/AccountDetail.jsx";
// Public routes
const publicRoutes = [
  { path: config.routes.Login, component: Login, layout: null },
  { path: config.routes.DayBooking, component: OneDayBooking, layout: Layout_1 },
];

// Private routes
const privateRoutes = [
  {
    path: config.routes.profile,
    allowedRoles: [2, 4],
    component: Profile,
    layout: Layout_1,
  },
  {
    path: config.routes.home,
    component: HomePage,
    layout: Layout_1,
  },
  {
    path: config.routes.StudentManagePage,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: StudentManagePage,
    layout: Layout_1,
  },
  {
    path: config.routes.ViewRoom,
    allowedRoles: [4],
    component: ViewRoomPage,
    layout: Layout_1,
  },
  {
    path: config.routes.RoomDetailPage,
    component: RoomDetailPage,
    layout: Layout_1,
  },
  {
    path: config.routes.GroupDetailPage,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: GroupDetailPage,
    layout: Layout_1,
  },
  {
    path: config.routes.MarkAttendance,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: MarkAttendance,
    layout: Layout_1,
  },
  {
    path: config.routes.SchedulePage,
    allowedRoles: [2, 4], // Only allow roleId 1 (Admin)
    component: SchedulePage,
    layout: Layout_1,
  },
  {
    path: config.routes.Helps,
    component: Helps,
    layout: Layout_1,
  },
  {
    path: config.routes.AccountDetailPage,
    component: AccountDetailPage,
    layout: Layout_1,
  },
];

export { publicRoutes, privateRoutes };
