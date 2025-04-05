import BookLabCalendar from "../pages/RoomBooking/BookLabCalendar";
import SchedulePage from "../pages/Schedule/SchedulePage";


const routes = {
  Login: "/",
  home: "/home",
  profile: "/user/:accountId",
  StudentManagePage: "/student-manage",
  ViewRoom: "/view-room/:id",
  RoomDetailPage: '/room-detail/:roomId',
  GroupDetailPage: '/student-manage/:groupId',
  MarkAttendance: "/mark-attendance/:id",
  SchedulePage: "/schedule",
  DayBooking: "/dayBooking",
  BookLabCalendar: "/calendar",
  Helps: "/helps",
};

export default routes;
