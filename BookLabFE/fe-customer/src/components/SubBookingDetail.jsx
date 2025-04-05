import { useState, useRef, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  AddUserIcon
} from "../icons";
import { minutesToTime, timeToMinutes } from "../utils/dateUtils";
import CreateGroupModal from "./CreateGroupModal";
import { swtoast } from "../utils/swal";
import { format } from "date-fns"
import { text } from "@fortawesome/fontawesome-svg-core";
import { time } from "framer-motion";


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


const SubBookingDetail = ({ left, subBooking, handleCancelSubBooking, handleSaveSubBooking, CategoryDescription, typeSlot, checkConditionPrivate, checkTotalStudentLeft, handleHeightPosition }) => {
  console.log("current event box in subbooking detail : ", subBooking)
  console.log("type slot : ", typeSlot)
  const startRef = useRef(null);
  const endRef = useRef(null);
  const textAreaRef = useRef(null);
  const startTimeListRef = useRef(null);
  const endTimeListRef = useRef(null);
  const [newSubBooking, setNewSubBooking] = useState({ ...subBooking })
  const groupRef = useRef(null)
  const [isShowAddGroupModal, setIsShowAddGroupModal] = useState(false)
  const [moreDescription, setMoreDescription] = useState("");
  const [choseReason, setChoseReason] = useState("")
  const [showStartDropdown, setShowStartDropdown] = useState(false)
  const [showEndDropdown, setShowEndDropdown] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState()
  const [slotsToCheck, setSlotsToCheck] = useState(typeSlot === 2 ? [...newSlots] : [...oldSlots])


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
        if (subBooking.reason && slot.startTime == subBooking.startTime) {
          setSelectedTimeSlot(slot.id)
        }
        if (!checkConditionPrivate(newSubBooking.date, slot.startTime, slot.endTime)) {
          slot.available = false;
          return;
        }
        const studentsLeft = checkTotalStudentLeft(newSubBooking.date, slot.startTime, slot.endTime);
        if (studentsLeft == 0) {
          slot.available = false;
          return;
        }
        slot.available = true;
        slot.studentsLeft = studentsLeft;
      })


    }
  }, [subBooking, typeSlot]);

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "00:00";
    const timePart = timeString.slice(0, 5);

    const [hours, minutes] = timePart.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const handleOnChangeReason = (event) => {
    setNewSubBooking(prev => {
      prev.reason = CategoryDescription?.filter((element) => element.name == event.target.value)[0]?.name ?? "";
      return prev;

    })
    if (event.target.value == "Other") {
      textAreaRef.current.hidden = false;
    }
    else {
      textAreaRef.current.hidden = true;
    }

  }

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
    console.log("opendddd --------------------")
    setIsShowAddGroupModal(true);
  }

  const handleBeforeSaveBooking = () => {
    if (!newSubBooking.studentQuantity || newSubBooking.studentQuantity == 0) {
      swtoast.warning({ text: "the number of student not allow to be 0" })
      return;
    }

    if (newSubBooking.studentQuantity > newSubBooking.studentsLeft) {
      swtoast.warning({ text: "the number of student exceed the limit" })
      return;
    }

    if (!newSubBooking.reason || (newSubBooking.reason == "Other" && moreDescription == "")) {
      swtoast.warning({ text: "you haven't filled in reason yet", time: 2000 })
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
    subBooking.reason = newSubBooking.reason == "Other" ? moreDescription : newSubBooking.reason;
    subBooking.rateDiv = newSubBooking.rateDiv;
    subBooking.height = newSubBooking.height;
    subBooking.rateTop = newSubBooking.rateTop;
    subBooking.top = newSubBooking.top;
    subBooking.studentsLeft = newSubBooking.studentsLeft;
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
  const handleOnchangeDescription = (event) => {
    setMoreDescription(event.target.value);

  }

  useEffect(() => {
    let arr = CategoryDescription?.filter((element) => element.name == newSubBooking.reason);
    let check = arr?.length > 0 ? arr[0]?.name : (newSubBooking.reason ? "Other" : null)
    setChoseReason(check)
    setMoreDescription(check == "Other" ? newSubBooking.reason : "")

  }, [])

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
    <div onClick={(event) => { event.stopPropagation() }} className="w-80 absolute" style={{ left: left }}>
      <div className="border-2 border-gray-300 p-4 rounded-xl bg-white">
        <div className="flex space-x-4 bg-[#F8F8F8] rounded-lg p-2 items-center mb-4">
          <CalendarIcon />
          <div className="font-mono">{newSubBooking.date.split("T")[0]}</div>
        </div>
        {typeSlot === 1 || typeSlot === 2 ? (
          <div className="mb-4">
            <div className="font-medium text-sm mb-2">Select Time Slots:</div>
            <div className="space-y-2 bg-[#F8F8F8] p-3 rounded-lg flex flex-col">
              {console.log("solot to heck : ", slotsToCheck)}
              {slotsToCheck.map((slot) => (
                <div key={slot.id} className="flex items-center flex-1">
                  {console.log("slot avali : ", slot.available)}
                  <input
                    disabled={!slot.available}
                    type="radio"
                    id={`time-slot-${slot.id}`}
                    name={`time-slot-${slot.id}`}
                    checked={selectedTimeSlot == slot.id}
                    onChange={() => handleToggleTimeSlot(slot.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`time-slot-${slot.id}`}
                    className="ml-2 text-sm font-medium text-gray-900 cursor-pointer flex justify-between flex-1 "
                  >
                    <div className="">{slot.label}</div> <div>{slot.available ? `  ${slot.studentsLeft} slot` : ''}</div>
                  </label>
                </div>
              ))}
            </div>
            {selectedTimeSlot && (
              <div className="mt-2 text-xs text-gray-600">
                Selected time: {formatTimeDisplay(newSubBooking.startTime)} - {formatTimeDisplay(newSubBooking.endTime)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex space-x-4 flex-1 mb-4">
            <div className="relative flex-1" ref={startRef}>
              <div onClick={handleOpenStart} className="flex space-x-2 bg-[#F8F8F8] rounded-lg flex-1 p-2 cursor-pointer">
                <ClockIcon />
                <div className="font-mono">{formatTimeDisplay(newSubBooking?.startTime)}</div>
              </div>
              {showStartDropdown && (
                <div className="absolute mt-2 z-20">
                  <div className="bg-white rounded-lg shadow-sm w-32 dark:bg-gray-700">
                    <div
                      ref={startTimeListRef}
                      className="h-48 px-3 pb-3 overflow-y-auto border-[#F8F8F8] rounded-lg border-2 text-sm 
                                                text-gray-700 dark:text-gray-200"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #f1f5f9" }}
                    >
                      {generateTimeOptions(true, false).map((time, index) => {
                        const isSelected = isCurrentTime(time.value, newSubBooking?.startTime)
                        return (
                          <div
                            key={`start-${index}`}
                            onClick={() => handleClickStart(time.value)}
                            className={`flex items-center ps-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 
                                                            cursor-pointer py-1 ${isSelected ? "bg-blue-100 dark:bg-blue-800" : ""}`}
                            id={isSelected ? "selected-start-time" : ""}
                          >
                            <span className={`w-full text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-300"}`}
                            >
                              {time.display}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex-1" ref={endRef}>
              <div onClick={handleOpenEnd} className="flex space-x-2 bg-[#F8F8F8] rounded-lg flex-1 p-2 cursor-pointer">
                <ClockIcon />
                <div className="font-mono">{formatTimeDisplay(newSubBooking?.endTime)}</div>
              </div>
              {showEndDropdown && (
                <div className="absolute mt-2 z-20">
                  <div className="bg-white rounded-lg shadow-sm w-32 dark:bg-gray-700">
                    <div
                      ref={endTimeListRef}
                      className="h-48 px-3 pb-3 overflow-y-auto border-[#F8F8F8] rounded-lg border-2 
                                                text-sm text-gray-700 dark:text-gray-200"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #f1f5f9" }}
                    >
                      {generateTimeOptions(false, true).map((time, index) => {
                        const isSelected = isCurrentTime(time.value, newSubBooking?.endTime)
                        return (
                          <div
                            key={`end-${index}`}
                            onClick={() => handleClickEnd(time.value)}
                            className={`flex items-center ps-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600 
                                                            cursor-pointer py-1 ${isSelected ? "bg-blue-100 dark:bg-blue-800" : ""}`}
                            id={isSelected ? "selected-end-time" : ""}
                          >
                            <span
                              className={`w-full text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-gray-300"
                                }`}
                            >
                              {time.display}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
        }


        <div className="w-full h-[2px] bg-[#F8F8F8]"></div>
        <div onClick={handleOpenAddGroup} className="flex bg-[#F8F8F8] rounded-lg p-2 items-center mb-4 space-x-4">
          <AddUserIcon />
          <div className="font-mono">{newSubBooking.studentQuantity ? `${newSubBooking.studentQuantity} students ` : `Add Participant, ${newSubBooking?.studentsLeft} remain`}  </div>
        </div>
        <div id="participant">

        </div>
        <div className="w-full h-[2px] bg-[#F8F8F8] mb-2"></div>

        <form class="max-w-sm mx-auto">

          <select onChange={handleOnChangeReason} id="small" class="block w-full p-2 mb-2 text-sm font-mono text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
            <option selected={!newSubBooking.reason}>Choose certain reason</option>
            {CategoryDescription?.map((element) => {
              return (
                <option selected={choseReason == element.name ? true : false} value={element.name}>{element.name}</option>
              )
            })}
          </select>
        </form>
        <form hidden={choseReason != "Other"} ref={textAreaRef} class="max-w-sm mx-auto">
          <textarea value={moreDescription} onChange={(event) => { handleOnchangeDescription(event) }} id="message" rows="4" class="block font-mono p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a reason..."></textarea>
        </form>

        <div className="flex justify-center space-x-2 mt-4">
          <button onClick={handleCancelSubBooking} className="font-mono w-2/5 rounded-lg flex justify-center border-2 border-gray-300 py-1 hover:bg-gray-300 ">cancel</button>
          <button onClick={handleBeforeSaveBooking} className="font-mono w-2/5 rounded-lg flex justify-center bg-[#4757E3] py-1 text-white hover:bg-opacity-50 ">save</button>
        </div>


      </div>
      {isShowAddGroupModal ?
        <CreateGroupModal
          isAddGroupToCart={true}
          handleCloseModal={handleCloseAddGroup}
          handleConfirmGroupToCart={handleConfirmGroupToCart}
          selectedGroupsBefore={newSubBooking.groupInBookings ? newSubBooking.groupInBookings : []}
          activeStudents={newSubBooking.studentsLeft}
        />
        : null}

    </div>
  )
}

export default SubBookingDetail;