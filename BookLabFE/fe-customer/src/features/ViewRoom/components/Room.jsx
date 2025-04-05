import React, { useState, useEffect } from "react";
import gamma from "../../../assets/gamma.jpeg";
import { Dropdown, Menu, Button, Checkbox, TimePicker, Input } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DownOutlined } from "@ant-design/icons";
import ApiClient from "../../../services/ApiClient";
import { useParams } from "react-router-dom";
import RoomList from "./RoomList";
import { roundToNearestHours } from "date-fns";
import FooterResponsive from "../../../components/FooterResponsive";
import SearchPageResponsive from "./SearchPageResponsive";
const Room = () => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);  // New state for start time
  const [endTime, setEndTime] = useState(null);      // New state for end time
  const [capacity, setCapacity] = useState("");      // New state for capacity
  const [groupSize, setGroupSize] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("Select Major");
  const [categoryRoomId, setCategoryRoomId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // Single state to manage active dropdown
  const { id } = useParams();
  const [building, setBuilding] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rooms, setRooms] = useState([]);
  const [openSearch, setOpenSearch] = useState(false);
  const [RatingFilter, setRatingFilter] = useState("desc");
  const [majors, setMajors] = useState([]);


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
        console.log('Fetched majors:', response.data);
      } catch (err) {
        console.error('Error fetching majors:', err);
      }
    };

    fetchMajors();
    fetchBuilding();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await ApiClient.get("/Room/available", {
          params: {
            buildingId: id,
            pageNumber,
            pageSize,
            sortOrder: RatingFilter,
          },
        });
        setRooms(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    if (building) {
      fetchRooms();
    }
  }, [id, pageNumber, pageSize, building, RatingFilter]);
console.log(building);

  const timeContent = (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-10 border border-gray-100" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Select Time Range</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
          <TimePicker
            value={startTime}
            onChange={(time) => {
              setStartTime(time);
              setActiveDropdown("time");
            }}
            format="HH:mm"
            className="w-full h-10 rounded-lg border-2 border-gray-200 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
          <TimePicker
            value={endTime}
            onChange={(time) => {
              setEndTime(time);
              if (startTime && time) {
                setTimeout(() => setActiveDropdown(null), 100);
              }
            }}
            format="HH:mm"
            className="w-full h-10 rounded-lg border-2 border-gray-200 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );


  const handleSearch = async () => {
    try {
      // Create query string with URLSearchParams
      const params = new URLSearchParams({
        buildingId: id,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (categoryRoomId) params.append("categoryRoomId", categoryRoomId);
      if (startTime) params.append("startTime", startTime.format("HH:mm"));
      if (endTime) params.append("endTime", endTime.format("HH:mm"));
      if (capacity) params.append("capacity", capacity);
      if (groupSize) params.append("groupSize", groupSize);

      // Add slotIds to query string

      const response = await ApiClient.get(`/Room/available?${params.toString()}`);
      setRooms(response.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };


  const calendarContent = (
    <div className="bg-white shadow-xl rounded-2xl p-6 mt-12 border border-gray-100" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Select Date Range</h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check In Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              setActiveDropdown("calendar");
            }}
            selectsStart
            startDate={startDate}
            minDate={new Date()}
            inline
            className="border-2 border-gray-200 rounded-lg"
            wrapperClassName="w-full"
            calendarClassName="shadow-lg rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Check Out Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              if (startDate && date) {
                setTimeout(() => setActiveDropdown(null), 100);
              }
            }}
            selectsEnd
            endDate={endDate}
            minDate={startDate}
            inline
            className="border-2 border-gray-200 rounded-lg"
            wrapperClassName="w-full"
            calendarClassName="shadow-lg rounded-lg"
          />
        </div>
      </div>
    </div>
  );

  const menu = {
    items: [
      {
        key: "1",
        label: (
          <div className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedSlots.includes(
                "0C64B3CA-A738-4EA5-8743-5FEF8E5F98C5"
              )}
              onChange={(e) =>
                handleSlotSelect(e, "0C64B3CA-A738-4EA5-8743-5FEF8E5F98C5")
              }
            >
              Slot 1
            </Checkbox>
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedSlots.includes(
                "8DC8470F-DC58-49B5-A328-9B313B8BE4CA"
              )}
              onChange={(e) =>
                handleSlotSelect(e, "8DC8470F-DC58-49B5-A328-9B313B8BE4CA")
              }
            >
              Slot 2
            </Checkbox>
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedSlots.includes(
                "678229D1-0B96-413C-9600-B55571EA513F"
              )}
              onChange={(e) =>
                handleSlotSelect(e, "678229D1-0B96-413C-9600-B55571EA513F")
              }
            >
              Slot 3
            </Checkbox>
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <div className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedSlots.includes(
                "0F7EE2D1-216C-44A4-80B2-E4E1058CFB8B"
              )}
              onChange={(e) =>
                handleSlotSelect(e, "0F7EE2D1-216C-44A4-80B2-E4E1058CFB8B")
              }
            >
              Slot 4
            </Checkbox>
          </div>
        ),
      },
    ],
  };

  const majorsMenu = {
    items: majors.map(major => ({
      key: major.id,
      label: major.name
    }))
  };

  const handleSlotSelect = (e, slot) => {
    if (e.target.checked) {
      setSelectedSlots([...selectedSlots, slot]);
    } else {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    }
  };

  return (
    <>
      <div className="lg:hidden md:hidden fixed inset-x-0 top-0 z-40 flex w-full items-center justify-center bg-white/70 backdrop-blur-lg shadow-md">
        <div className="max-w-lg flex-1 px-4" onClick={handleOpenSearch}>
          <button className="relative flex w-full items-center rounded-full border border-gray-300 px-5 py-2 shadow-md hover:shadow-lg transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              ></path>
            </svg>
            <div className="ml-3 flex-1 overflow-hidden text-left">
              <span className="block text-sm font-semibold text-gray-800">
                Where to?
              </span>
              <span className="mt-0.5 block text-xs text-gray-500 truncate">
                Anywhere • Any week • Add guests
              </span>
            </div>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white">
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 text-gray-600"
                fill="currentColor"
              >
                <path d="M5 8c1.306 0 2.418.835 2.83 2H14v2H7.829A3.001 3.001 0 1 1 5 8zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6-8a3 3 0 1 1-2.829 4H2V4h6.17A3.001 3.001 0 0 1 11 2zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
              </svg>
            </span>
          </button>
        </div>
        {openSearch && <SearchPageResponsive onClose={handleCloseSearch} />}
      </div>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto pb-24 pt-10 lg:pb-28 lg:pt-16 px-4">
          <div className="relative flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center">
              <div className="flex flex-shrink-0 flex-col items-start space-y-6 pb-14 lg:me-10 lg:w-1/2 lg:space-y-10 lg:pb-64 xl:me-0 xl:pb-80 xl:pe-14">
                <h2 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl xl:text-7xl">
                  {building?.name}
                </h2>
                <div className="flex items-center text-lg text-gray-600">
                  <span className="flex items-center">
                    <svg className="h-6 w-6 text-indigo-500" />
                    <span className="ml-2 font-medium">{building?.roomCount} rooms available</span>
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    className="w-full h-[500px] object-cover transform hover:scale-105 transition-transform duration-500"
                    src={building?.avatar} 
                    alt={building?.name}
                  />
                </div>
              </div>
            </div>
            <div className="hidden w-full lg:flow-root md:flow-root">
              <div className="z-10 w-full lg:-mt-40 xl:-mt-56">
                <div className="w-full max-w-6xl mx-auto">
                  <form className="relative flex flex-col md:flex-row items-center h-auto md:h-[100px] rounded-2xl bg-white shadow-2xl border border-gray-100 p-4 gap-4">
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50 
                        ${activeDropdown === "time" ? "bg-white shadow-md" : ""}`}
                      onClick={() => {
                        if (activeDropdown === "time") {
                          setActiveDropdown(null);
                        } else {
                          setActiveDropdown("time");
                        }
                      }}
                    >
                      <div className="text-neutral-300 dark:text-neutral-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-6 w-6 text-gray-400 flex-shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
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
                          popupOffset={[0, 20]} // Add this line - 20px vertical offset
                        >
                          <div className="truncate">
                            <span className="block font-semibold text-lg">Time</span>
                            <span className="block text-sm text-gray-500 truncate">
                              {startTime && endTime ? `${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}` : "Select Time"}
                            </span>
                          </div>
                        </Dropdown>
                      </div>
                    </div>
                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>

                    {/* Calendar Dropdown */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50 
                        ${activeDropdown === "calendar" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "calendar" ? null : "calendar")}
                    >
                      <Dropdown
                        trigger={["click"]}
                        placement="bottomCenter"
                        open={activeDropdown === "calendar"}
                        onOpenChange={(flag) =>
                          handleDropdownChange("calendar", flag)
                        }
                        dropdownRender={(menu) => (
                          <div onClick={(e) => e.stopPropagation()}>
                            {calendarContent}
                          </div>
                        )}
                        popupOffset={[0, 20]}
                      >
                        <Button
                          className="relative z-10 flex flex-1 nc-hero-field-padding items-center gap-x-3"
                          type="button"
                        >
                          <div className="text-neutral-300 dark:text-neutral-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="h-6 w-6 text-gray-400 flex-shrink-0"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                              ></path>
                            </svg>
                          </div>
                          <div className="truncate">
                    <span className="block font-semibold text-lg">
                      {startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : "Select dates"}
                    </span>
                    <span className="block text-sm text-gray-500">Check in - Check out</span>
                  </div>
                        </Button>
                      </Dropdown>
                    </div>
                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>

                    {/* Major Dropdown */}
                    <div
                      className="relative flex "
                      data-headlessui-state=""
                    >
                      <Dropdown
                        menu={{
                          items: majorsMenu.items.map((item) => ({
                            key: item.key,
                            label: (
                              <div
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setSelectedMajor(item.label),
                                    setCategoryRoomId(item.key);
                                }}
                              >
                                {item.label}
                              </div>
                            ),
                          })),
                        }}
                        trigger={["click"]}
                        placement="bottomCenter"
                        open={activeDropdown === "major"}
                        onOpenChange={(flag) =>
                          handleDropdownChange("major", flag)
                        }
                      >
                        <div
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50 w-full
                            ${activeDropdown === "major" ? "bg-white shadow-md" : ""}`}
                          onClick={() => setActiveDropdown(activeDropdown === "major" ? null : "major")}
                        >
                          <div className="text-neutral-300 dark:text-neutral-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              aria-hidden="true"
                              data-slot="icon"
                              className="h-6 w-6 text-gray-400 flex-shrink-0"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                              ></path>
                            </svg>
                          </div>
                          <div className="truncate w-32">
                            <span className="block font-semibold text-lg truncate">{selectedMajor}</span>
                            <span className="block text-sm text-gray-500">Major</span>
                          </div>
                        </div>
                      </Dropdown>

                    </div>

                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>

                    {/* Capacity Input */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50 
                        ${activeDropdown === "capacity" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "capacity" ? null : "capacity")}
                    >
                      <div className="text-neutral-300 dark:text-neutral-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-6 w-6 text-gray-400 flex-shrink-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <Dropdown
                          overlay={
                            <div className="bg-white shadow-lg rounded-lg p-4 mt-10" onClick={(e) => e.stopPropagation()}>
                              <div className="mb-2 font-semibold">Room Capacity</div>
                              <Input
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                placeholder="Enter capacity"
                                className="w-full"
                                onPressEnter={() => setActiveDropdown(null)}
                                onClick={(e) => e.stopPropagation()} // Add this
                              />
                            </div>
                          }
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "capacity"}
                          onOpenChange={(flag) => handleDropdownChange("capacity", flag)}
                        >
                          <div className="truncate">
                    <span className="block font-semibold text-lg">Capacity</span>
                    <span className="block text-sm text-gray-500 truncate">
                      {capacity ? `${capacity} people` : "Room capacity"}
                    </span>
                  </div>
                        </Dropdown>
                        
                      </div>
                    </div>

                    <div className="h-8 self-center border-r border-slate-200 dark:border-slate-700"></div>

                    {/* Group Size Input */}
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer hover:bg-gray-50 
                        ${activeDropdown === "groupSize" ? "bg-white shadow-md" : ""}`}
                      onClick={() => setActiveDropdown(activeDropdown === "groupSize" ? null : "groupSize")}
                    >
                      <div className="text-neutral-300 dark:text-neutral-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="h-5 w-5 lg:h-7 lg:w-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <Dropdown
                          overlay={
                            <div className="bg-white shadow-lg rounded-lg p-4 mt-10" onClick={(e) => e.stopPropagation()}>
                              <div className="mb-2 font-semibold">Group Size</div>
                              <Input
                                type="number"
                                value={groupSize}
                                onChange={(e) => setGroupSize(e.target.value)}
                                placeholder="Enter group size"
                                className="w-full"
                                onPressEnter={() => setActiveDropdown(null)}
                                onClick={(e) => e.stopPropagation()} // Add this
                              />
                            </div>
                          }
                          trigger={["click"]}
                          placement="bottom"
                          open={activeDropdown === "groupSize"}
                          onOpenChange={(flag) => handleDropdownChange("groupSize", flag)}
                        >
                          <div className="truncate">
                    <span className="block font-semibold text-lg">Group Size</span>
                    <span className="block text-sm text-gray-500 truncate">
                      {groupSize ? `${groupSize} people` : "Your group size"}
                    </span>
                  </div>
                        </Dropdown>
                        
                      </div>
                    </div>

                    <div className="pe-2 xl:pe-4 flex items-center">
                      <button
                        type="button"
                        className="flex h-14 w-full items-center justify-center rounded-full bg-[#4338CA] hover:bg-[#4450CA] text-neutral-50 hover:bg-primary-700 focus:outline-none md:h-16 md:w-16"
                        onClick={handleSearch}
                      >
                        <span className="me-3 md:hidden">Search</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          color="currentColor"
                          fill="none"
                          className="h-6 w-6"
                        >
                          <path
                            d="M17.5 17.5L22 22"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                          <path
                            d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          ></path>
                        </svg>
                      </button>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 py-12">
          <RoomList
            setPageSize={setPageSize}
            setPageNumber={setPageNumber}
            rooms={rooms}
            setRatingFilter={setRatingFilter}
          />
        </div>
        <FooterResponsive />
      </div>
    </>
  );
};

export default Room;
