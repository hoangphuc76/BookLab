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
// Public routes
const publicRoutes = [
  { path: config.routes.Login, component: Login, layout: null },
  { path: config.routes.DayBooking, component: OneDayBooking, layout: Layout_1 },
];

// Private routes
const privateRoutes = [
  {
    path: config.routes.profile,
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
    component: StudentManagePage,
    layout: Layout_1,
  },
  {
    path: config.routes.ViewRoom,
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
    component: GroupDetailPage,
    layout: Layout_1,
  },
  {
    path: config.routes.MarkAttendance,
    component: MarkAttendance,
    layout: Layout_1,
  },
  {
    path: config.routes.SchedulePage,
    component: SchedulePage,
    layout: Layout_1,
  },
  {
    path: config.routes.Helps,
    component: Helps,
    layout: Layout_1,
  },
];

export { publicRoutes, privateRoutes };
