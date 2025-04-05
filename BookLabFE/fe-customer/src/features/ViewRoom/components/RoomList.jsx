import React, { useState, useEffect } from "react";
import gamma from "../../../assets/gamma.jpeg";
import { Pagination, Tag } from "antd"; // Added Tag import
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const RoomList = ({ rooms, setPageNumber, setPageSize, setRatingFilter }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const navigate = useNavigate();
  const items = [
    {
      key: "desc",
      label: "Highest to Lowest Rating",
    },
    {
      key: "asc",
      label: "Lowest to Highest Rating",
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
          ? 1 // First click
          : (prev[roomId] + 1) % room.imageUrls.length, // Next image with wrap-around
    }));
  };
  
  const handlePaginationChange = (page, pageSize) => {
    setPageNumber(page);
    setPageSize(pageSize);
  };

  // Function to get category color based on category name
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      "Software Engineering": "blue",
      "Artificial Intelligence": "purple",
      "Information Security": "red",
      "Digital Marketing": "green",
      "Computer Science": "cyan",
      "Business": "orange",
      // Add more mappings as needed
    };
    
    return colorMap[categoryName] || "default";
  };
  return (
    <div className="container pb-24 lg:pb-28 xl:max-w-none xl:pr-0 2xl:pl-10">
      <div>
        <div className="relative flex min-h-screen">
          <div className="min-h-screen w-full flex-shrink-0 xl:px-8">
            <div className="flex mb-8 items-center justify-between">
              <div className="flex gap-x-4">
                <div className="relative" data-headlessui-state>
                  <Dropdown
                    menu={{
                      items,
                      onClick: handleMenuClick,
                    }}
                    trigger={["click"]}
                  >
                    <button className="flex items-center justify-center rounded-full border cursor-pointer hover:border-violet-600 border-neutral-300 px-4 py-2 text-sm focus:outline-none">
                      <span>Rating</span>
                      <DownOutlined className="ms-1 h-4 w-4" />
                    </button>
                  </Dropdown>
                </div>
              </div>
            </div>
            
            {rooms?.items?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No rooms found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
                {rooms?.items?.map((room) => (
                  <div key={room.id} className="group hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border border-neutral-200">
                    <div
                      className="relative h-[220px] cursor-pointer"
                      onClick={() => navigate(`/room-detail/${room.id}`)}
                    >
                      <div className="relative w-full h-full">
                        <div className="group/cardGallerySlider relative h-full">
                          <div className="w-full overflow-hidden h-full">
                            <div className="w-full h-full overflow-hidden">
                              <img
                                src={
                                  room.imageUrls?.[
                                    currentImageIndex[room.id] || 0
                                  ] || gamma
                                }
                                alt={room.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  console.log(
                                    "Image failed to load:",
                                    e.target.src
                                  );
                                  e.target.src = gamma;
                                }}
                              />
                            </div>
                          </div>
                          <div className="opacity-0 transition-opacity group-hover/cardGallerySlider:opacity-100">
                            <button
                              className="absolute end-3 top-[calc(50%-16px)] flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-neutral-300 focus:outline-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextImage(room.id);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-4 w-4 rtl:rotate-180"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                />
                              </svg>
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center justify-center gap-x-1.5">
                            {room.imageUrls &&
                              [...Array(room.imageUrls.length)].map(
                                (_, dotIndex) => (
                                  <button
                                    key={dotIndex}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      (currentImageIndex[room.id] || 0) ===
                                      dotIndex
                                        ? "bg-white"
                                        : "bg-white/60"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex((prev) => ({
                                        ...prev,
                                        [room.id]: dotIndex,
                                      }))
                                    }}
                                  />
                                )
                              )}
                          </div>
                        </div>
                        <div
                          className="flex cursor-pointer items-center justify-center rounded-full transition-colors w-8 h-8 text-white bg-black bg-opacity-30 hover:bg-opacity-50 absolute end-3 top-3 z-[1]"
                          title="Save"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add save functionality here
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Tag color={getCategoryColor(room.categoryRoom)} className="rounded-full">
                          {room.categoryRoom || "Uncategorized"}
                        </Tag>
                        <div className="flex items-center space-x-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-[18px] w-[18px] text-orange-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <span className="font-medium">{room.rating || "N/A"}</span>
                          <span className="text-neutral-500">({room.reviewCount || 0})</span>
                        </div>
                      </div>
                      
                      <h2 className="font-semibold text-lg capitalize text-neutral-900">
                        <span className="line-clamp-1">Room {room.name}</span>
                      </h2>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-neutral-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 mr-1"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                          </svg>
                          <span>Capacity: {room.capacity}</span>
                        </div>

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
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomList;