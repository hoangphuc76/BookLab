import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Button, Checkbox, TimePicker, Input } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ApiClient from "../../../services/ApiClient";
import { useParams } from "react-router-dom";
import RoomList from "./RoomList";
import FooterResponsive from "../../../components/FooterResponsive";
import SearchPageResponsive from "./SearchPageResponsive";
import { 
  FaCalendar, 
  FaClock, 
  FaUserFriends, 
  FaUsers,
  FaChalkboardTeacher,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaBuilding,
  FaDoorOpen
} from "react-icons/fa";

const Room = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [capacity, setCapacity] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("Select Major");
  const [categoryRoomId, setCategoryRoomId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { id } = useParams();
  const [building, setBuilding] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rooms, setRooms] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [RatingFilter, setRatingFilter] = useState("desc");
  const [majors, setMajors] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleOpenSearch = () => {
    setOpenSearch(true);
  };
  
  const handleCloseSearch = () => {
    setOpenSearch(false);
  };

  const handleDropdownChange = (dropdownName, isOpen) => {
    if (isOpen) {
      setActiveDropdown(dropdownName);
    } else {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const response = await ApiClient.get(`/Building/${id}`);
        setBuilding(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMajors = async () => {
      try {
        const response = await ApiClient.get('/CategoryRoom');
        setMajors(response.data);
      } catch (err) {
        console.error('Error fetching majors:', err);
      }
    };

    fetchMajors();
    fetchBuilding();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!building) return;

      try {
        const params = {
          buildingId: id,
          pageNumber,
          pageSize,
          sortOrder: RatingFilter,
        };
        
        if (isFiltered) {
          if (selectedDate) params.bookingDate = selectedDate.toISOString();
          if (startTime) params.startTime = startTime.format("HH:mm");
          if (endTime) params.endTime = endTime.format("HH:mm");
          if (categoryRoomId) params.categoryRoomId = categoryRoomId;
          if (capacity) params.capacity = capacity;
          if (groupSize) params.groupSize = groupSize;
        }
        
        const response = await ApiClient.get("/Room/available", { params });
        setRooms(response.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    
    fetchRooms();
  }, [id, pageNumber, pageSize, building, RatingFilter, isFiltered]);

  const timeContent = (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-4 border border-indigo-100" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-indigo-800 mb-4">Select Time Range</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
          <TimePicker
            value={startTime}
            onChange={(time) => {
              setStartTime(time);
              setActiveDropdown("time");
            }}
            format="HH:mm"
            className="w-full h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
          <TimePicker
            value={endTime}
            onChange={(time) => {
              setEndTime(time);
              if (startTime && time) {
                setTimeout(() => setActiveDropdown(null), 100);
              }
            }}
            format="HH:mm"
            className="w-full h-10 rounded-xl border-2 border-indigo-100 focus:border-indigo-600"
          />
        </div>
      </div>
    </div>
  );

  const handleSearch = async () => {
    try {
      // Start loading
      setIsSearching(true);
      setIsFiltered(true);
      
      const params = {
        buildingId: id,
        pageNumber,
        pageSize,
        sortOrder: RatingFilter,
      };

      if (selectedDate) params.bookingDate = selectedDate.toISOString();
      if (categoryRoomId) params.categoryRoomId = categoryRoomId;
      if (startTime) params.startTime = startTime.format("HH:mm");
      if (endTime) params.endTime = endTime.format("HH:mm");
      if (capacity) params.capacity = capacity;
      if (groupSize) params.groupSize = groupSize;

      const response = await ApiClient.get("/Room/available", { params });
      setRooms(response.data);
    } catch (err) {
      console.error("Error searching rooms:", err);
    } finally {
      // End loading
      setIsSearching(false);
    }
  };

  // Reset search to show all rooms
  const resetSearch = () => {
    setIsFiltered(false);
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setCategoryRoomId(null);
    setSelectedMajor("Select Major");
    setCapacity("");
    setGroupSize("");
  };

  const calendarContent = (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-4 border border-indigo-100" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-semibold text-indigo-800 mb-4">Select Booking Date</h3>
      <div className="flex justify-center">
        <div>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setTimeout(() => setActiveDropdown(null), 100);
            }}
            minDate={new Date()}
            inline
            className="rounded-xl border-2 border-indigo-100"
            calendarClassName="shadow-lg rounded-lg"
            showPopperArrow={false}
            dateFormat="MMMM d, yyyy"
          />
        </div>
      </div>
    </div>
  );

  const handleSlotSelect = (e, slot) => {
    if (e.target.checked) {
      setSelectedSlots([...selectedSlots, slot]);
    } else {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    }
  };

  // Format date for display
  const formatSelectedDate = (date) => {
    if (!date) return "Select date";
    
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      {/* Mobile search button - visible only on mobile */}
      <div className="lg:hidden md:hidden fixed inset-x-0 top-0 z-40 flex w-full items-center justify-center bg-white/70 backdrop-blur-lg shadow-md">
        <div className="max-w-lg flex-1 px-4" onClick={handleOpenSearch}>
          <button className="relative flex w-full items-center rounded-full border border-indigo-200 px-5 py-2 shadow-md hover:shadow-lg transition">
            <FaSearch className="h-4 w-4 text-indigo-600" />
            <div className="ml-3 flex-1 overflow-hidden text-left">
              <span className="block text-sm font-semibold text-slate-800">
                Find a room
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 truncate">
                Filter by date, time, or capacity
              </span>
            </div>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white">
              <FaFilter className="h-4 w-4 text-indigo-600" />
            </span>
          </button>
        </div>
        {openSearch && <SearchPageResponsive onClose={handleCloseSearch} />}
      </div>

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pb-20 pt-8 lg:pt-16 px-4">
          <div className="relative flex flex-col">
            {/* Building header section */}
            <div className="flex flex-col lg:flex-row lg:items-center">
              <div className="flex flex-shrink-0 flex-col items-start space-y-4 pb-10 lg:me-10 lg:w-1/2 lg:space-y-8 lg:pb-48 xl:me-0 xl:pe-14">
                <div className="flex items-center">
                  <button 
                    onClick={() => window.history.back()}
                    className="flex items-center text-indigo-700 hover:text-indigo-900 font-medium mr-4"
                  >
                    <FaArrowLeft className="mr-2" />
                    <span>Back</span>
                  </button>
                  <div className="h-6 border-r border-slate-300 mx-2"></div>
                  <div className="flex items-center text-slate-600">
                    <FaBuilding className="text-indigo-600 mr-2" />
                    <span>Building Details</span>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold leading-tight text-indigo-800 md:text-5xl">
                  {building?.name}
                </h2>
                
                <div className="flex items-center text-lg text-slate-600">
                  <span className="flex items-center">
                    <FaDoorOpen className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-medium">{building?.roomCount} rooms available</span>
                  </span>
                </div>
              </div>

              {/* Building image */}
              <div className="flex-grow">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-indigo-100/50">
                  <img 
                    className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-500"
                    src={building?.avatar} 
                    alt={building?.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Search form - desktop only */}
            <div className="hidden w-full lg:flow-root md:flow-root">
              <div className="z-10 w-full lg:-mt-32 xl:-mt-40">
                <div className="w-full max-w-6xl mx-auto">
                  <form className="relative flex flex-col md:flex-row items-center h-auto md:h-[100px] rounded-2xl bg-white/90 backdrop-blur-md shadow-xl border border-indigo-100 p-4 gap-4">
                    {/* Time picker */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 
                        ${activeDropdown === "time" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "time" ? null : "time")}
                    >
                      <div className="text-indigo-500">
                        <FaClock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Dropdown
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "time"}
                          onOpenChange={(flag) => handleDropdownChange("time", flag)}
                          dropdownRender={(menu) => (
                            <div onClick={(e) => e.stopPropagation()}>
                              {timeContent}
                            </div>
                          )}
                          popupOffset={[0, 20]}
                        >
                          <div className="truncate">
                            <span className="block font-semibold text-slate-800">Time</span>
                            <span className="block text-sm text-slate-500 truncate">
                              {startTime && endTime ? `${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}` : "Select Time"}
                            </span>
                          </div>
                        </Dropdown>
                      </div>
                    </div>
                    
                    <div className="h-8 self-center border-r border-indigo-100"></div>

                    {/* Calendar Dropdown */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 
                        ${activeDropdown === "calendar" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "calendar" ? null : "calendar")}
                    >
                      <div className="text-indigo-500">
                        <FaCalendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Dropdown
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "calendar"}
                          onOpenChange={(flag) => handleDropdownChange("calendar", flag)}
                          dropdownRender={(menu) => (
                            <div onClick={(e) => e.stopPropagation()}>
                              {calendarContent}
                            </div>
                          )}
                          popupOffset={[0, 20]}
                        >
                          <div className="truncate">
                            <span className="block font-semibold text-slate-800">
                              {formatSelectedDate(selectedDate)}
                            </span>
                            <span className="block text-sm text-slate-500">Booking date</span>
                          </div>
                        </Dropdown>
                      </div>
                    </div>
                    
                    <div className="h-8 self-center border-r border-indigo-100"></div>

                    {/* Major Dropdown */}
                    <div className="relative flex">
                      <Dropdown
                        menu={{
                          items: majors.map((major) => ({
                            key: major.id,
                            label: (
                              <div
                                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer"
                                onClick={() => {
                                  setSelectedMajor(major.name),
                                  setCategoryRoomId(major.id);
                                }}
                              >
                                {major.name}
                              </div>
                            ),
                          })),
                        }}
                        trigger={["click"]}
                        placement="bottom"
                        open={activeDropdown === "major"}
                        onOpenChange={(flag) => handleDropdownChange("major", flag)}
                      >
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 w-full
                            ${activeDropdown === "major" ? "bg-white shadow-md" : ""}`}
                          onClick={() => setActiveDropdown(activeDropdown === "major" ? null : "major")}
                        >
                          <div className="text-indigo-500">
                            <FaChalkboardTeacher className="h-5 w-5" />
                          </div>
                          <div className="truncate w-32">
                            <span className="block font-semibold text-slate-800 truncate">{selectedMajor}</span>
                            <span className="block text-sm text-slate-500">Major</span>
                          </div>
                        </div>
                      </Dropdown>
                    </div>

                    <div className="h-8 self-center border-r border-indigo-100"></div>

                    {/* Capacity Input */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 
                        ${activeDropdown === "capacity" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "capacity" ? null : "capacity")}
                    >
                      <div className="text-indigo-500">
                        <FaUsers className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <Dropdown
                          overlay={
                            <div className="bg-white shadow-xl rounded-xl p-4 mt-4 border border-indigo-100" onClick={(e) => e.stopPropagation()}>
                              <div className="mb-2 font-semibold text-indigo-800">Room Capacity</div>
                              <Input
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                placeholder="Enter capacity"
                                className="w-full rounded-xl border-2 border-indigo-100"
                                onPressEnter={() => setActiveDropdown(null)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          }
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "capacity"}
                          onOpenChange={(flag) => handleDropdownChange("capacity", flag)}
                        >
                          <div className="truncate">
                            <span className="block font-semibold text-slate-800">Capacity</span>
                            <span className="block text-sm text-slate-500 truncate">
                              {capacity ? `${capacity} people` : "Room capacity"}
                            </span>
                          </div>
                        </Dropdown>
                      </div>
                    </div>

                    <div className="h-8 self-center border-r border-indigo-100"></div>

                    {/* Group Size Input */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-indigo-50 
                        ${activeDropdown === "groupSize" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "groupSize" ? null : "groupSize")}
                    >
                      <div className="text-indigo-500">
                        <FaUserFriends className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <Dropdown
                          overlay={
                            <div className="bg-white shadow-xl rounded-xl p-4 mt-4 border border-indigo-100" onClick={(e) => e.stopPropagation()}>
                              <div className="mb-2 font-semibold text-indigo-800">Group Size</div>
                              <Input
                                type="number"
                                value={groupSize}
                                onChange={(e) => setGroupSize(e.target.value)}
                                placeholder="Enter group size"
                                className="w-full rounded-xl border-2 border-indigo-100"
                                onPressEnter={() => setActiveDropdown(null)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          }
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "groupSize"}
                          onOpenChange={(flag) => handleDropdownChange("groupSize", flag)}
                        >
                          <div className="truncate">
                            <span className="block font-semibold text-slate-800">Group Size</span>
                            <span className="block text-sm text-slate-500 truncate">
                              {groupSize ? `${groupSize} people` : "Your group size"}
                            </span>
                          </div>
                        </Dropdown>
                      </div>
                    </div>

                    {/* Search buttons */}
                    <div className="pe-2 xl:pe-4 flex items-center">
                      {isFiltered ? (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            disabled={isSearching}
                            className={`flex h-14 w-full items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors md:h-16 md:w-16 ${
                              isSearching ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={resetSearch}
                          >
                            <span className="me-2 md:hidden">Reset</span>
                            <FaArrowLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isSearching}
                            className="flex h-14 w-full items-center justify-center rounded-full bg-[#6B75CC] hover:bg-[#5A63B5] text-white transition-colors md:h-16 md:w-16 relative overflow-hidden"
                            onClick={handleSearch}
                          >
                            {isSearching ? (
                              <>
                                {/* Loading animation */}
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </span>
                                {/* Fade out text during loading */}
                                <span className="me-3 md:hidden opacity-0">Search</span>
                                <FaSearch className="w-4 h-4 opacity-0" />
                              </>
                            ) : (
                              <>
                                <span className="me-3 md:hidden">Search</span>
                                <FaSearch className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isSearching}
                          className="flex h-14 w-full items-center justify-center rounded-full bg-[#6B75CC] hover:bg-[#5A63B5] text-white transition-colors md:h-16 md:w-16 relative overflow-hidden"
                          onClick={handleSearch}
                        >
                          {isSearching ? (
                            <>
                              {/* Loading animation */}
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </span>
                              {/* Fade out text during loading */}
                              <span className="me-3 md:hidden opacity-0">Search</span>
                              <FaSearch className="w-4 h-4 opacity-0" />
                            </>
                          ) : (
                            <>
                              <span className="me-3 md:hidden">Search</span>
                              <FaSearch className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room list section */}
        <div className="bg-indigo-50/50 py-12">
          <RoomList
            setPageSize={setPageSize}
            setPageNumber={setPageNumber}
            rooms={rooms}
            setRatingFilter={setRatingFilter}
            isFiltered={isFiltered}
            onClearFilter={resetSearch}
          />
        </div>
        
        <FooterResponsive />
      </div>
    </>
  );
};

export default Room;