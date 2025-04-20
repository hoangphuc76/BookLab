import React, { useState } from "react";
import gamma from "../../../assets/gamma.jpeg";
import { Pagination, Empty } from "antd"; 
import { Dropdown, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaSort, 
  FaHeart, 
  FaRegHeart, 
  FaUsers, 
  FaChevronRight, 
  FaFilter,
  FaTimes,
  FaDoorOpen,
  FaStar,
  FaInfoCircle
} from "react-icons/fa";

const RoomList = ({ rooms, setPageNumber, setPageSize, setRatingFilter, isFiltered, onClearFilter }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  
  const items = [
    {
      key: "desc",
      label: (
        <div className="flex items-center gap-2">
          <FaSortAmountDown className="text-blue-600" />
          <span>Highest to Lowest Rating</span>
        </div>
      ),
    },
    {
      key: "asc",
      label: (
        <div className="flex items-center gap-2">
          <FaSortAmountUp className="text-blue-600" />
          <span>Lowest to Highest Rating</span>
        </div>
      ),
    },
  ];

  const handleMenuClick = ({ key }) => {
    setRatingFilter(key);
  };

  const handleNextImage = (roomId) => {
    const room = rooms.items.find((r) => r.id === roomId);
    if (!room?.imageUrls?.length) return;

    setCurrentImageIndex((prev) => ({
      ...prev,
      [roomId]:
        prev[roomId] === undefined
          ? 1 
          : (prev[roomId] + 1) % room.imageUrls.length,
    }));
  };
  
  const handlePaginationChange = (page, pageSize) => {
    setPageNumber(page);
    setPageSize(pageSize);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
  
  const toggleFavorite = (roomId) => {
    setFavorites(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  // Function to get category color based on category name
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      "Software Engineering": "#2563EB",
      "Artificial Intelligence": "#7C3AED",
      "Information Security": "#DC2626",
      "Digital Marketing": "#059669",
      "Computer Science": "#0891B2",
      "Business": "#EA580C",
      // Add more mappings as needed
    };
    
    return colorMap[categoryName] || "#3B82F6";
  };

  return (
    <div className="container mx-auto px-4 pb-24 lg:pb-28 xl:max-w-7xl">
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-col sm:flex-row mb-8 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-blue-800">Available Rooms</h2>
            {rooms?.totalItems > 0 && (
              <div className="text-blue-600 bg-blue-100 rounded-full px-3 py-1 text-sm font-medium">
                {rooms.totalItems} {rooms.totalItems === 1 ? 'room' : 'rooms'}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 items-center">
            {isFiltered && (
              <button
                onClick={onClearFilter}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 text-sm px-4 py-2.5 rounded-full transition-all duration-300"
              >
                <FaTimes className="text-xs" />
                <span>Clear filters</span>
              </button>
            )}
            
            <Dropdown
              menu={{
                items,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="shadow-xl rounded-xl overflow-hidden"
            >
              <button className="flex items-center justify-center rounded-full border border-blue-200 hover:border-blue-600 bg-white text-blue-800 shadow-sm hover:shadow px-4 py-2.5 text-sm transition-all duration-300">
                <Space>
                  <FaSort className="text-blue-600" />
                  <span>Sort by Rating</span>
                </Space>
              </button>
            </Dropdown>
          </div>
        </div>
        
        {rooms?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <FaFilter className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-semibold text-blue-800 mb-2">No rooms found</h3>
            <p className="text-slate-600 max-w-sm text-center">
              We couldn't find any rooms matching your current filters. Try adjusting your search criteria.
            </p>
            {isFiltered && (
              <button 
                onClick={onClearFilter}
                className="mt-6 px-5 py-2.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {rooms?.items?.map((room) => (
              <div 
                key={room.id} 
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-blue-50 hover:border-blue-100"
              >
                {/* Room image section */}
                <div 
                  className="relative w-full h-60 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/room-detail/${room.id}`)}
                >
                  {/* Background Image */}
                  <img
                    src={room.imageUrls?.[currentImageIndex[room.id] || 0] || gamma}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = gamma;
                    }}
                  />
                  
                  {/* Category Badge */}
                  <div 
                    className="absolute top-4 left-4 py-1 px-3 rounded-full text-white text-xs font-medium shadow-lg"
                    style={{ backgroundColor: `${getCategoryColor(room.categoryRoom)}` }}
                  >
                    {room.categoryRoom || "Uncategorized"}
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/20 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(room.id);
                    }}
                  >
                    {favorites[room.id] ? (
                      <FaHeart className="h-4 w-4 text-rose-500" />
                    ) : (
                      <FaRegHeart className="h-4 w-4 text-white" />
                    )}
                  </button>
                  
                  {/* Image Navigation Dots */}
                  {room.imageUrls && room.imageUrls.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                      {room.imageUrls.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            (currentImageIndex[room.id] || 0) === dotIndex
                              ? "bg-white"
                              : "bg-white/40"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => ({
                              ...prev,
                              [room.id]: dotIndex,
                            }));
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Room info section */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Room {room.name}
                    </h3>
                    <div className="flex items-center bg-blue-50 py-1 px-2 rounded-lg">
                      <FaStar className="text-amber-500 w-4 h-4 mr-1" />
                      <span className="text-blue-800 text-sm font-medium">{room.rating || "N/A"}</span>
                    </div>
                  </div>
                                                     
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-blue-50 py-1 px-3 rounded-lg flex items-center">
                      <FaUsers className="text-blue-600 w-3.5 h-3.5 mr-1.5" />
                      <span className="text-blue-800 text-sm">
                        {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    
                    {room.equipmentCount && (
                      <div className="bg-blue-50 py-1 px-3 rounded-lg flex items-center">
                        <FaInfoCircle className="text-blue-600 w-3.5 h-3.5 mr-1.5" />
                        <span className="text-blue-800 text-sm">
                          {room.equipmentCount} items
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={() => navigate(`/room-detail/${room.id}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <span>View Details</span>
                      <FaChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {rooms?.totalItems > 0 && (
          <div className="mt-12 flex items-center justify-center">
            <Pagination
              current={rooms.pageNumber}
              pageSize={rooms.pageSize}
              total={rooms.totalItems}
              onChange={handlePaginationChange}
              showSizeChanger={false}
              className="custom-pagination"
            />
          </div>
        )}
        
        {/* Custom styles for Ant Design pagination */}
        <style jsx global>{`
          .custom-pagination .ant-pagination-item {
            border-radius: 9999px;
            border-color: #DBEAFE;
            font-weight: 500;
          }
          
          .custom-pagination .ant-pagination-item-active {
            background-color: #3B82F6;
            border-color: #3B82F6;
          }
          
          .custom-pagination .ant-pagination-item-active a {
            color: white;
          }
          
          .custom-pagination .ant-pagination-prev button,
          .custom-pagination .ant-pagination-next button {
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-color: #DBEAFE;
          }
          
          .custom-pagination .ant-pagination-prev:hover button,
          .custom-pagination .ant-pagination-next:hover button,
          .custom-pagination .ant-pagination-item:hover {
            border-color: #3B82F6;
            color: #3B82F6;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RoomList;