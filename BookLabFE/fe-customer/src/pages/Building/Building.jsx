import { useNavigate } from "react-router-dom";

function Building({ Id, src, name, totalBuildings,rooms }) {
  const navigate = useNavigate();
  
  // Tính toán width dựa trên totalBuildings
  const buildingWidth = totalBuildings > 2 ? '20%' : '420px';
  const textGlowStyle = {
    textShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)'
  };

  return (
    <div className="flex-grow-0 flex-shrink-0 p-2">
      <div 
        className="w-full flex flex-col items-center"
        style={{ 
          width: buildingWidth,
          minWidth: '200px',
          maxWidth: '420px'
        }}
      >
        <div
          className="nc-CardCategory3 flex flex-col cursor-pointer transition-transform hover:scale-105 w-full"
          onClick={() => navigate(`/view-room/${Id}`)}
        >
          <div className="group relative w-full h-[480px] overflow-hidden rounded-3xl shadow-lg">
            <img
              alt="places"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover rounded-3xl transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-75"
              sizes="(max-width: 400px) 100vw, 280px"
              src={src}
            />
            {/* Lớp overlay với gradient */}
            <span className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-gray-900/20 to-transparent opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100"></span>

            {/* Nội dung text ở giữa ảnh */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 group-hover:opacity-100">
              <div className="relative">
              <h2 
                className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-lg transition-all duration-500 ease-out group-hover:-translate-y-2"
                style={textGlowStyle}
              >
                {name}
              </h2>
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-white transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
              </div>
              <span className="mt-4 block text-base md:text-lg font-medium tracking-wide text-gray-100 drop-shadow-lg transition-all duration-300 delay-100 ease-out group-hover:opacity-100 group-hover:translate-y-2">
                <span className="text-yellow-400 font-semibold">{rooms}</span> Rooms Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Building;