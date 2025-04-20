import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaCubes, FaDoorClosed } from "react-icons/fa";
import { useState, useEffect } from "react";

function Building({ Id, src, name, rooms }) {
  const navigate = useNavigate();
  const [buildingWidth, setBuildingWidth] = useState("320px");
  
  // Text glow style for the heading
  const textGlowStyle = {
    textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)"
  };

  // Responsive sizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBuildingWidth("100%");
      } else if (window.innerWidth < 1024) {
        setBuildingWidth("320px");
      } else {
        setBuildingWidth("380px");
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-grow-0 flex-shrink-0 p-2">
      <div 
        className="w-full flex flex-col items-center"
        style={{ 
          width: buildingWidth,
        }}
      >
        <div
          className="nc-CardCategory3 flex flex-col cursor-pointer transition-transform hover:scale-105 w-full"
          onClick={() => navigate(`/view-room/${Id}`)}
        >
          <div className="group relative w-full h-[480px] overflow-hidden rounded-3xl shadow-lg">
            {/* Main image with hover effects */}
            <img
              alt={name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover rounded-3xl transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-75"
              sizes="(max-width: 400px) 100vw, 280px"
              src={src || "https://via.placeholder.com/800x600?text=Building+Image"}
            />
            
            {/* Gradient overlay that appears on hover */}
            <span className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/20 to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"></span>

            {/* Room badge - always visible but transforms on hover */}
            <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:scale-110 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600/30 blur-[2px] rounded-full"></div>
                <div className="relative bg-gradient-to-r from-blue-700/90 to-blue-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/50 shadow-lg">
                  <FaDoorClosed className="text-white/90 text-xs" />
                  <span className="text-xs font-semibold text-white">
                    {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Centered content that appears on hover */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 group-hover:opacity-100">
              <div className="relative">
                <h2 
                  className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-lg transition-all duration-500 ease-out group-hover:-translate-y-2"
                  style={textGlowStyle}
                >
                  {name}
                </h2>
                {/* Animated underline */}
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-white transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
              </div>
              
              {/* Explore button */}
              <button 
                className="mt-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center gap-2 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-300 border border-white/30 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/view-room/${Id}`);
                }}
              >
                <span>Explore Rooms</span>
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Subtle top gradient - always visible */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Building;