import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdDashboard } from "react-icons/md";
import { FaUser } from 'react-icons/fa';
import {
  AiFillHome,
  AiOutlineSetting
} from "react-icons/ai";
import { HiCheckCircle } from "react-icons/hi";

export const menuItems = [
  { name: "Dashboard", path: "/manager", icon: AiFillHome },
  {icon: FaUser, name: "Booking Management", path: "#" , group: "Booking"},
  {icon: FaUser, name: "Room Management", path: "#" , group: "Room"},
  { name: "Helps", path: "/manager/helps", icon: AiOutlineSetting  },
];
export const groupedItems = {
  Booking: [
    {icon: FaUser, name: "Import Booking", path: "/manager/bookingImport" , group: "Booking"},
    { icon: AiFillHome, name: "Booking Requests", path: "/manager/book-req" , group: "Booking"},
    { icon: AiFillHome, name: "Booking History", path: "/manager/book-his" , group: "Booking"},
  ],
  Room: [
    { name: "Room", path: "/manager/Room", icon: HiCheckCircle},
    ],
};