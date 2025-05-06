import Building from "./Building/Building";
import ApiClient from "../services/ApiClient";
import { useEffect, useState } from "react";
import { FaBuilding, FaMap, FaSearchLocation } from "react-icons/fa";

function HomePage() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        let campusId = JSON.parse(localStorage.getItem("campusId"));
        const response = await ApiClient.get(`/BuildingbyCampus/${campusId}`);
        setBuildings(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative elements - updated to deeper blue colors */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-600/15 to-blue-400/15 -z-10"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIzIDAgMi4xOTguOTY4IDIuMTk4IDIuMnYxOS42YzAgMS4yMzItLjk2OCAyLjItMi4xOTggMi4ySDE4Yy0xLjIzIDAtMi4yLTEuMDk3LTIuMi0yLjJWMjBjMC0xLjIzMi45Ny0yLjIgMi4yLTIuMmgxOHpNMCAwaDYwdjYwSDB6Ii8+PC9nPjwvc3ZnPg==')] opacity-[0.03] -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center  relative">
          <div className="inline-block bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-medium mb-3">
            Welcome to FAISE
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 flex items-center justify-center">
            <span className="bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text">
            BookLab
            </span>
          </h1>
          
          <div className="w-24 h-1 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full mx-auto my-4"></div>
          
          <p className="text-slate-600 mt-2 max-w-md mx-auto">
            Select a building to view available rooms and labs for your next booking
          </p>

          <div className="absolute -z-10 w-40 h-40 bg-blue-400 rounded-full opacity-10 filter blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FaBuilding className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-blue-600 mt-4 font-medium">Loading buildings...</p>
          </div>
        ) : (
          <div className="relative flex justify-center items-center w-full py-8">
              {buildings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <FaMap className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-blue-800 mb-2">No Buildings Found</h3>
                  <p className="text-slate-500 max-w-md">
                    There are no buildings available for this campus at the moment. Please check back later.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center gap-6 flex-wrap">
                  {buildings.map((item, index) => (
                    <Building
                      key={index}
                      src={item.avatar}
                      name={item.name}
                      Id={item.id}
                      rooms={item.roomCount}
                      totalBuildings={buildings.length}
                    />
                  ))}
                </div>
              )}
          </div>
        )}

        <div className=" bg-gradient-to-r from-blue-600/15 to-blue-400/15 p-8 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaSearchLocation className="text-blue-600" size={24} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">
            Finding the Perfect Space
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Browse through our buildings to find labs and rooms equipped with the latest technology for your studies and projects.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
