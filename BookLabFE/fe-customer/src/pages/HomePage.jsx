import Building from "./Building/Building";
import ApiClient from "../services/ApiClient";
import { useEffect, useState } from "react";

function HomePage() {
  const [buildings, setBuildings] = useState([]);
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        let campusId = JSON.parse(localStorage.getItem("campusId"));
        const response = await ApiClient.get(`/BuildingbyCampus/${campusId}`); // Adjust the endpoint as needed
        setBuildings(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBuildings();
  }, []);
  console.log(buildings);
  return (
    <div className="flex justify-center items-center w-full">
      <div className="absolute inset-0 bg-gray-300/40 backdrop-blur-md"></div>
      <div className="w-[1250px] px-6 py-4 bg-white">
        <div className="flex justify-center gap-4 flex-wrap">
          {buildings.map((item, index) => (
            <Building
              src={item.avatar}
              name={item.name}
              key={index}
              Id={item.id}
              rooms = {item.roomCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
