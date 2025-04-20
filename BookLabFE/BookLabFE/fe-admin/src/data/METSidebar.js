import {
  AiFillHome,
  AiOutlineSetting
} from "react-icons/ai";
import { FaBuilding ,FaUser} from "react-icons/fa";
import { IoMdList } from "react-icons/io";
import { HiCheckCircle } from "react-icons/hi";
import { MdCategory } from "react-icons/md";

export const menuItems = [
  { name: "Dashboard", path: "/MET", icon: AiFillHome },
  { name: "Category", path: "#", icon: IoMdList , group: "Category" },
  { name: "Management", path: "#", icon: HiCheckCircle , group: "Management" },
  {icon: FaUser, name: "Booking Management", path: "#" , group: "Booking"},
  { name: "Helps", path: "/MET/helps", icon: AiOutlineSetting  },
];

export const groupedItems = {
  Category: [
    { name: "Building", path: "/MET/Building", icon: FaBuilding  },
    { name: "Room Category", path: "/MET/RoomCategory", icon:MdCategory  },
  ],
  Management: [
    { name: "Role", path: "/MET/Role", icon: MdCategory  },
    { name: "Account", path: "/MET/Account", icon: FaUser },
    { name: "Room", path: "/MET/Room", icon: HiCheckCircle},
  ],
  Booking: [
    {icon: FaUser, name: "Import Booking", path: "/MET/bookingImport" , group: "Booking"},
  ],
};