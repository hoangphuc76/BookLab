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
// Public routes
const publicRoutes = [
  { path: config.routes.Login, component: Login, layout: null },
  { path: config.routes.DayBooking, component: OneDayBooking, layout: Header },
];

// Private routes
const privateRoutes = [
  {
    path: config.routes.profile,
    allowedRoles: [2, 4],
    component: Profile,
    layout: Header,
  },
  {
    path: config.routes.home,
    component: HomePage,
    layout: Header,
  },
  {
    path: config.routes.StudentManagePage,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: StudentManagePage,
    layout: Header,
  },
  {
    path: config.routes.ViewRoom,
    allowedRoles: [4],
    component: ViewRoomPage,
    layout: Header,
  },
  {
    path: config.routes.RoomDetailPage,
    component: RoomDetailPage,
    layout: Header,
  },
  {
    path: config.routes.GroupDetailPage,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: GroupDetailPage,
    layout: Header,
  },
  {
    path: config.routes.MarkAttendance,
    allowedRoles: [4], // Only allow roleId 1 (Admin)
    component: MarkAttendance,
    layout: Header,
  },
  {
    path: config.routes.SchedulePage,
    allowedRoles: [2, 4], // Only allow roleId 1 (Admin)
    component: SchedulePage,
    layout: Header,
  },
  {
    path: config.routes.Helps,
    component: Helps,
    layout: Header,
  },
];

export { publicRoutes, privateRoutes };
