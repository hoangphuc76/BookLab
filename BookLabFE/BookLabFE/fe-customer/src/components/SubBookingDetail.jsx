import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  AddUserIcon
} from "../icons";
import { minutesToTime, timeToMinutes } from "../utils/dateUtils";
import CreateGroupModal from "./CreateGroupModal";
import { swtoast } from "../utils/swal";
import { format } from "date-fns";

const newSlots = [
  {
    id: 1,
    startTime: "07:00:00",
    endTime: "09:15:00",
    label: "7:00 - 9:15",
  },
  {
    id: 2,
    startTime: "09:30:00",
    endTime: "11:45:00",
    label: "9:30 - 11:45",
  },
  {
    id: 3,
    startTime: "12:30:00",
    endTime: "14:45:00",
    label: "12:30 - 14:45",
  },
  {
    id: 4,
    startTime: "15:00:00",
    endTime: "17:15:00",
    label: "15:00 - 17:15",
  },
];

const oldSlots = [
  {
    id: 1,
    startTime: "07:00:00",
    endTime: "08:30:00",
    label: "7:00 - 8:30",
  },
  {
    id: 2,
    startTime: "08:45:00",
    endTime: "09:15:00",
    label: "8:45 - 9:15",
  },
  {
    id: 3,
    startTime: "09:30:00",
    endTime: "12:00:00",
    label: "9:30 - 12:00",
  },
  {
    id: 4,
    startTime: "12:30:00",
    endTime: "14:00:00",
    label: "12:30 - 14:00",
  },
  {
    id: 5,
    startTime: "14:15:00",
    endTime: "15:45:00",
    label: "14:15 - 15:45",
  },
  {
    id: 6,
    startTime: "16:00:00",
    endTime: "17:30:00",
    label: "16:00 - 17:30",
  },
];


const SubBookingDetail = ({ left, subBooking, handleCancelSubBooking, handleSaveSubBooking, CategoryDescription, typeSlot, checkConditionPrivate, checkTotalStudentLeft, handleHeightPosition, onlyGroupStatus }) => {
  const startRef = useRef(null);
  const endRef = useRef(null);
  const startTimeListRef = useRef(null);
  const endTimeListRef = useRef(null);
  const [newSubBooking, setNewSubBooking] = useState({ ...subBooking });
  const [isShowAddGroupModal, setIsShowAddGroupModal] = useState(false);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [slotsToCheck, setSlotsToCheck] = useState(typeSlot === 2 ? [...newSlots] : [...oldSlots]);
  
  const findClosestTimeSlot = (startTime, endTime, slots) => {
    if (!startTime || !endTime) return null;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const bookingMidpoint = (startMinutes + endMinutes) / 2;

    let closestSlot = null;
    let minDistance = Number.POSITIVE_INFINITY;

    slots.forEach((slot) => {
      const slotStartMinutes = timeToMinutes(slot.startTime);
      const slotEndMinutes = timeToMinutes(slot.endTime);
      const slotMidpoint = (slotStartMinutes + slotEndMinutes) / 2;

      const distance = Math.abs(slotMidpoint - bookingMidpoint);

      if (distance < minDistance) {
        minDistance = distance;
        closestSlot = slot;
      }
    });

    if (closestSlot && handleCheckSlot(closestSlot.id)) {
      const currentTime = minutesToTime(timeToMinutes(format(new Date(), "HH:mm:") + "00") + 30);
      const sortedSlots = [...slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
      const nextAvailableSlot = sortedSlots.find((slot) => slot.startTime >= currentTime);
      return nextAvailableSlot;
    }

    return closestSlot;
  };

  useEffect(() => {
    if ((typeSlot === 1 || typeSlot === 2) && subBooking.startTime && subBooking.endTime) {
      slotsToCheck.map((slot) => {
        if (slot.startTime == subBooking.startTime) {
          setSelectedTimeSlot(slot.id)
        }
        if (!checkConditionPrivate(newSubBooking.date, slot.startTime, slot.endTime)) {
          slot.available = false;
          return;
        }

        const studentAndGroupsLeft = checkTotalStudentLeft(newSubBooking.date, slot.startTime, slot.endTime);
        if (studentAndGroupsLeft.studentsLeft <= 0 && !onlyGroupStatus) {
          slot.available = false;
          return;
        }
        if (studentAndGroupsLeft.groupsLeft <= 0 && onlyGroupStatus) {
          slot.available = false;
          return;
        }
        slot.available = true;
        slot.studentsLeft = studentAndGroupsLeft.studentsLeft;
        slot.groupsLeft = studentAndGroupsLeft.groupsLeft;
      })
      if (!selectedTimeSlot && slotsToCheck[subBooking.indexSlot]?.available) {
        setSelectedTimeSlot(slotsToCheck[subBooking.indexSlot].id)
      }


    }
  }, [subBooking, typeSlot]);

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "00:00";
    const timePart = timeString.slice(0, 5);

    const [hours, minutes] = timePart.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const handleClickStart = (startTime) => {
    setNewSubBooking((prev) => {
      const updatedBooking = { ...prev, startTime };

      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(prev.endTime);

      if (startMinutes >= endMinutes) {
        if (startMinutes + 15 == 1440) {
          const newEndTime = minutesToTime(startMinutes + 15);
          updatedBooking.endTime = newEndTime;
        } else {
          const newEndTime = minutesToTime(startMinutes + 30);
          updatedBooking.endTime = newEndTime;
        }
      }

      return updatedBooking;
    });
    console.log("startBookinggggggggggg: ", newSubBooking)
    setShowStartDropdown(false);
  };

  const handleClickEnd = (endTime) => {
    setNewSubBooking((prev) => {
      const updatedBooking = { ...prev, endTime };

      const startMinutes = timeToMinutes(prev.startTime);
      const endMinutes = timeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        if (endMinutes - 15 == 0) {
          const newStartTime = minutesToTime(endMinutes - 15);
          updatedBooking.startTime = newStartTime;
        } else {
          const newStartTime = minutesToTime(endMinutes - 30);
          updatedBooking.startTime = newStartTime;
        }
      }

      return updatedBooking;
    });
    setShowEndDropdown(false);
  };

  const handleToggleTimeSlot = (slotId) => {
    const availableSlot = slotsToCheck.filter((slot) => slot.id == slotId && slot.available)
    if (availableSlot[0]) {
      setSelectedTimeSlot(slotId)
      setNewSubBooking((prev) => {
        prev.startTime = availableSlot[0].startTime;
        prev.endTime = availableSlot[0].endTime;
        prev.studentsLeft = availableSlot[0].studentsLeft;
        handleHeightPosition(prev);
        return prev;

      })
    }
  };



  const handleOpenStart = () => {
    if (typeSlot === 3) {
      setShowStartDropdown(!showStartDropdown);
      setShowEndDropdown(false);
    }
  };

  const handleOpenEnd = () => {
    if (typeSlot === 3) {
      setShowEndDropdown(!showEndDropdown);
      setShowStartDropdown(false);
    }
  };

  const handleCloseAddGroup = () => {
    setIsShowAddGroupModal(false);
  }

  const handleOpenAddGroup = () => {
    setIsShowAddGroupModal(true);
  }

  const handleBeforeSaveBooking = () => {
    if (!newSubBooking.studentQuantity || newSubBooking.studentQuantity == 0) {
      swtoast.warning({ text: "Please add students", timer: 1500 })
      return;
    }

    if (newSubBooking.studentQuantity > newSubBooking.studentsLeft && !onlyGroupStatus) {
      swtoast.error({ text: "the number of student exceed the limit", timer: 1500 })
      return;
    }

    if (newSubBooking.groupQuantity > newSubBooking.groupsLeft && onlyGroupStatus) {
      swtoast.error({ text: "the number of group exceed the limit", timer: 1500 })
      return;
    }

    if ((typeSlot === 1 || typeSlot === 2) && !selectedTimeSlot) {
      swtoast.warning({ text: "Please select at least one time slot" })
      return
    }

    subBooking.startTime = newSubBooking.startTime;
    subBooking.endTime = newSubBooking.endTime;
    subBooking.groupInBookings = newSubBooking.groupInBookings;
    subBooking.groupsId = newSubBooking.groupsId;
    subBooking.studentQuantity = newSubBooking.studentQuantity;
    subBooking.groupQuantity = newSubBooking.groupQuantity;
    subBooking.rateDiv = newSubBooking.rateDiv;
    subBooking.height = newSubBooking.height;
    subBooking.rateTop = newSubBooking.rateTop;
    subBooking.top = newSubBooking.top;
    subBooking.studentsLeft = newSubBooking.studentsLeft;
    subBooking.groupsLeft = newSubBooking.groupsLeft;
    subBooking.typeSlot = newSubBooking.typeSlot;

    handleSaveSubBooking();
  }

  const handleConfirmGroupToCart = (pushedGroups) => {
    newSubBooking.groupsId = Object.keys(pushedGroups).map((groupName, i) => {
      return pushedGroups[groupName][0].accountDetail.groupId;
    })
    console.log("pushed Groups : ", newSubBooking.groupsId)
    newSubBooking.groupInBookings = Object.keys(pushedGroups);
    newSubBooking.studentQuantity = Object.values(pushedGroups).reduce((sum, group) => sum + group.length, 0)
    newSubBooking.groupQuantity = Object.keys(pushedGroups).length;

    handleCloseAddGroup();
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startRef.current && !startRef.current.contains(event.target)) {
        setShowStartDropdown(false);
      }
      if (endRef.current && !endRef.current.contains(event.target)) {
        setShowEndDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showStartDropdown && startTimeListRef.current) {
      const currentTime = newSubBooking.startTime || "00:00:00";
      const currentHour = Number.parseInt(currentTime.split(":")[0]);
      const currentMinute = Number.parseInt(currentTime.split(":")[1]);

      const scrollPosition =
        (currentHour * 4 + Math.floor(currentMinute / 15)) * 28;

      startTimeListRef.current.scrollTop = scrollPosition;
    }
    console.log("check var new  : ", newSubBooking)
  }, [showStartDropdown, newSubBooking.startTime]);

  useEffect(() => {
    if (showEndDropdown && endTimeListRef.current) {
      const currentTime = newSubBooking.endTime || "00:00:00";
      const currentHour = Number.parseInt(currentTime.split(":")[0]);
      const currentMinute = Number.parseInt(currentTime.split(":")[1]);

      const scrollPosition =
        (currentHour * 4 + Math.floor(currentMinute / 15) - 1) * 28;

      endTimeListRef.current.scrollTop = scrollPosition;
    }
  }, [showEndDropdown, newSubBooking.endTime]);

  const generateTimeOptions = (isStartTime = false, isEndTime = false) => {
    const options = [];
    const intervals = 15; // 15-minute intervals
    const hoursInDay = 24;
    const stepsPerHour = 60 / intervals;
    const totalSteps = hoursInDay * stepsPerHour;

    if (isStartTime) {
      options.push({ value: "00:00:00", display: "00:00" });
    }

    for (let i = 1; i < totalSteps; i++) {
      const minutes = i * intervals;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMins = mins.toString().padStart(2, "0");
      const timeValue = `${formattedHours}:${formattedMins}:00`;
      const displayTime = `${formattedHours}:${formattedMins}`;

      options.push({ value: timeValue, display: displayTime });
    }

    if (isEndTime) {
      options.push({ value: "23:59:59", display: "23:59" });
    }

    return options;
  };

  const isCurrentTime = (timeValue, currentTime) => {
    if (!currentTime) return false;
    return (
      timeValue === currentTime ||
      timeValue.slice(0, 5) === currentTime.slice(0, 5)
    );
  };

  return (
    <div onClick={(event) => { event.stopPropagation() }} className="w-96 absolute">
      <div className="border border-gray-200 p-5 rounded-2xl bg-white shadow-xl backdrop-blur-none animate-fadeIn">
        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-indigo-500/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Booking Date</div>
            <div className="font-medium text-gray-800">{newSubBooking.date.split("T")[0]}</div>
          </div>
        </div>
        
        {typeSlot === 1 || typeSlot === 2 ? (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">Available Time Slots</h3>
              {selectedTimeSlot && (
                <div className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {formatTimeDisplay(newSubBooking.startTime)} - {formatTimeDisplay(newSubBooking.endTime)}
                </div>
              )}
            </div>
            <div className="space-y-2 bg-gray-50 p-3 rounded-xl">
              {slotsToCheck.map((slot) => (
                <div 
                  key={slot.id} 
                  onClick={() => slot.available && handleToggleTimeSlot(slot.id)}
                  className={`flex items-center p-2.5 rounded-lg transition-all ${
                    selectedTimeSlot === slot.id 
                      ? 'bg-indigo-100 border border-indigo-300' 
                      : slot.available 
                        ? 'hover:bg-gray-100 border border-transparent cursor-pointer' 
                        : 'opacity-50 border border-transparent cursor-not-allowed'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 mr-3 ${
                    selectedTimeSlot === slot.id 
                      ? 'bg-indigo-600 ring-2 ring-indigo-200' 
                      : slot.available 
                        ? 'border-2 border-gray-300' 
                        : 'bg-gray-200'
                  }`}>
                    {selectedTimeSlot === slot.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between w-full">
                    <div className={`text-sm font-medium ${selectedTimeSlot === slot.id ? 'text-indigo-800' : 'text-gray-700'}`}>
                      {slot.label}
                    </div>
                    {slot.available && (
                      <div className={`text-xs ${selectedTimeSlot === slot.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {slot.studentsLeft} {onlyGroupStatus ? 'groups' : 'slots'} left
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-5">
            <h3 className="font-medium text-gray-800 mb-3">Custom Time Selection</h3>
            <div className="flex space-x-3">
              <div className="relative flex-1" ref={startRef}>
                <div className="text-xs text-gray-500 mb-1.5 font-medium">Start Time</div>
                <div 
                  onClick={handleOpenStart}
                  className={`flex items-center space-x-2 rounded-lg p-2.5 border cursor-pointer transition-all ${
                    showStartDropdown 
                      ? 'border-indigo-400 bg-indigo-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                  <div className="font-medium text-gray-800">{formatTimeDisplay(newSubBooking?.startTime)}</div>
                </div>
                {showStartDropdown && (
                  <div className="absolute mt-1 z-20 w-full">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                      <div
                        ref={startTimeListRef}
                        className="h-48 px-1 pb-1 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      >
                        {generateTimeOptions(true, false).map((time, index) => {
                          const isSelected = isCurrentTime(time.value, newSubBooking?.startTime);
                          return (
                            <div
                              key={`start-${index}`}
                              onClick={() => handleClickStart(time.value)}
                              className={`flex items-center px-3 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer ${
                                isSelected ? "bg-indigo-50" : ""
                              }`}
                              id={isSelected ? "selected-start-time" : ""}
                            >
                              <span className={`text-sm ${isSelected ? "font-medium text-indigo-700" : "text-gray-700"}`}>
                                {time.display}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1" ref={endRef}>
                <div className="text-xs text-gray-500 mb-1.5 font-medium">End Time</div>
                <div 
                  onClick={handleOpenEnd}
                  className={`flex items-center space-x-2 rounded-lg p-2.5 border cursor-pointer transition-all ${
                    showEndDropdown 
                      ? 'border-indigo-400 bg-indigo-50' 
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                  <div className="font-medium text-gray-800">{formatTimeDisplay(newSubBooking?.endTime)}</div>
                </div>
                {showEndDropdown && (
                  <div className="absolute mt-1 z-20 w-full">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                      <div
                        ref={endTimeListRef}
                        className="h-48 px-1 pb-1 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                      >
                        {generateTimeOptions(false, true).map((time, index) => {
                          const isSelected = isCurrentTime(time.value, newSubBooking?.endTime);
                          return (
                            <div
                              key={`end-${index}`}
                              onClick={() => handleClickEnd(time.value)}
                              className={`flex items-center px-3 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer ${
                                isSelected ? "bg-indigo-50" : ""
                              }`}
                              id={isSelected ? "selected-end-time" : ""}
                            >
                              <span className={`text-sm ${isSelected ? "font-medium text-indigo-700" : "text-gray-700"}`}>
                                {time.display}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="w-full h-px bg-gray-200 my-5"></div>
        
        <div 
          onClick={handleOpenAddGroup}
          className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer ${
            newSubBooking.studentQuantity || newSubBooking.groupQuantity
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <div className={`p-2 rounded-lg ${
            newSubBooking.studentQuantity || newSubBooking.groupQuantity
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {onlyGroupStatus ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            ) : (
              <AddUserIcon className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            {onlyGroupStatus ? (
              newSubBooking.groupQuantity ? (
                <>
                  <div className="font-medium text-emerald-800">{newSubBooking.groupQuantity} groups selected</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Click to modify groups</div>
                </>
              ) : (
                <>
                  <div className="font-medium text-gray-800">Add Groups</div>
                  <div className="text-xs text-gray-500 mt-0.5">{newSubBooking?.groupsLeft} groups available</div>
                </>
              )
            ) : (
              newSubBooking.studentQuantity ? (
                <>
                  <div className="font-medium text-emerald-800">{newSubBooking.studentQuantity} students selected</div>
                  <div className="text-xs text-emerald-600 mt-0.5">Click to modify students</div>
                </>
              ) : (
                <>
                  <div className="font-medium text-gray-800">Add Students</div>
                  <div className="text-xs text-gray-500 mt-0.5">{newSubBooking?.studentsLeft} slots available</div>
                </>
              )
            )}
          </div>
          
          <div className="text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        <div id="participant"></div>
        
        <div className="w-full h-px bg-gray-200 my-5"></div>
        
        <div className="flex space-x-3 mt-5">
          <button 
            onClick={handleCancelSubBooking} 
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button 
            onClick={handleBeforeSaveBooking} 
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            Save Booking
          </button>
        </div>
      </div>
      
      {isShowAddGroupModal && (
        <CreateGroupModal
          isAddGroupToCart={true}
          handleCloseModal={handleCloseAddGroup}
          handleConfirmGroupToCart={handleConfirmGroupToCart}
          selectedGroupsBefore={newSubBooking.groupInBookings ? newSubBooking.groupInBookings : []}
          activeStudents={newSubBooking.studentsLeft}
          activeGroups={newSubBooking.groupsLeft}
          onlyGroupStatus={onlyGroupStatus}
        />
      )}
    </div>
  );
};

export default SubBookingDetail;