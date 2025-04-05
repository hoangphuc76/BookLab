import {
  AiFillHome,
  AiOutlineSetting
} from "react-icons/ai";
import { FaBuilding ,FaUser} from "react-icons/fa";
import { IoMdList } from "react-icons/io";
import { HiCheckCircle } from "react-icons/hi";
import { MdCategory } from "react-icons/md";

export const menuItems = [
  { name: "Dashboard", path: "/admin", icon: AiFillHome },
  { name: "Category", path: "#", icon: IoMdList , group: "Category" },
  { name: "Management", path: "#", icon: HiCheckCircle , group: "Management" },
  { name: "Helps", path: "/admin/helps", icon: AiOutlineSetting  },
];

export const groupedItems = {
  Category: [
    { name: "Building", path: "/admin/Building", icon: FaBuilding  },
    { name: "Room Category", path: "/admin/RoomCategory", icon:MdCategory  },
  ],
  Management: [
    { name: "Role", path: "/admin/Role", icon: MdCategory  },
    { name: "Account", path: "/admin/Account", icon: FaUser },
    { name: "Room", path: "/admin/Room", icon: HiCheckCircle},
  ],
};