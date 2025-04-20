import { startOfWeek, endOfWeek, format, eachDayOfInterval, addDays, getDay, startOfMonth, subDays, setMonth, addMinutes, differenceInMinutes, parseISO, getHours, getMinutes } from "date-fns";
import {
  LeftChevronArrowIcon,
  RightChevronArrowIcon,
  DownChevronArrowIcon,
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  DownloadIcon,
  AddUserIcon
} from "../../icons";
import { swtoast } from "../../utils/swal";
import { useState, useRef, useEffect, useCallback } from "react";
import apiClient from "../../services/ApiClient";
import { timeToMinutes, minutesToTime } from "../../utils/dateUtils";
import { useSelector } from "react-redux";
import GroupModalUpdatingBooking from "./GroupModalUpdateBooking";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaArrowLeft, FaTimes, FaUsers, FaCalendarDay, FaClock, FaMapMarkerAlt, FaListAlt, FaUserCheck } from "react-icons/fa";

const typeColors = {
  0: 'bg-[#28A745]',  // belong to admin
  1: 'bg-[#7b7878]',  //belong to other
  2: 'bg-[#33D29C]',  // new subbooking   
  3: 'bg-[#FFC107]', // belong to user , not confirm
  4: 'bg-[#28A745]', // belong to user, confirmed
}

const typeSlots = {
  1: "Old Slot",
  2: "New Slot",
  3: "Out Slot"
}

const newSlots = [[0, 7, 9.25, 9.5, 11.75, 12.5, 14.75, 15, 17.25], ["00:00", "07:00", "09:15", "09:30", "11:45", "12:30", "14:45", "15:00", "17:15"]]
const oldSlots = [[0, 7, 8.5, 8.75, 10.25, 10.5, 12, 12.5, 14, 14.25, 15.75, 16, 17.5], ["00:00", "07:00", "08:30", "08:45", "10:15", "10:30", "12:00", "12:30", "14:00", "14:15", "15:45", "16:00", "17:30"]]

const SchedulePage = () => {
  const divRefs = useRef([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDayOfWeek, setEndDayOfWeek] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [eventBoxs, setEventBoxs] = useState({});
  const overflowDivRef = useRef(null);
  const { userId } = useSelector((state) => state.profile);
  const [account, setAccount] = useState();
  const [currentEventBox, setCurrentEventBox] = useState({ height: 0, top: 0 });
  const [isShowMonthModal, setIsShowMonthModal] = useState(false);
  const [divHeight, setDivHeight] = useState(48);
  const [TypeSlot, setTypeSlot] = useState(3);
  const [isShowTypeSlotSelection, setIsShowTypeSlotSelection] = useState(false);
  const [slotTimes, setSlotTimes] = useState(null);
  const [existedFirstDayWeek, setExistFirstDayInWeek] = useState([]);
  const [isShowSubBookingDetail, setIsShowSubBookingDetail] = useState(false);
  const [isViewGroupInBookingDetail, setIsViewGroupInBookingDetail] = useState(false);
  const [groups, setGroups] = useState([]);

  const handleMoveWeek = (direction) => {
    //0 back 1 forward
    if (direction == 0) {
      setFirstDayOfWeek(subDays(firstDayOfWeek, 7));
      setEndDayOfWeek(subDays(endDayOfWeek, 7));
    } else if (direction == 1) {
      setFirstDayOfWeek(addDays(firstDayOfWeek, 7));
      setEndDayOfWeek(addDays(endDayOfWeek, 7));
    }
  }

  const handleClickMonth = (month) => {
    let firstDay = startOfMonth(
      new Date(2025, month, 1)
    );
    let dayOfWeek = getDay(firstDay);

    let daysToAdd = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    setFirstDayOfWeek(addDays(firstDay, daysToAdd));
    setEndDayOfWeek(addDays(firstDay, daysToAdd + 6));
    setIsShowMonthModal(false)
  }

  const handleClickToday = useCallback(() => {
    setFirstDayOfWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setEndDayOfWeek(endOfWeek(new Date(), { weekStartsOn: 1 }))
  }, [])

  const handleOpenSubBookingDetail = (dateBooking, id, index) => {
    setCurrentEventBox({ ...eventBoxs[dateBooking][id] });
    setIsShowSubBookingDetail(true)
  }

  const handleUpdatePosition = (SubBookingsInDate) => {
    const arrayBookings = []
    Object.keys(SubBookingsInDate).map((id) => {
      arrayBookings.push({ ...SubBookingsInDate[id] });
    })
    arrayBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

    let count = 0;
    const buff = new Array(arrayBookings.length).fill("00:00:00");
    for (let i = 0; i < buff.length; i++) {
      for (let j = 0; j < buff.length; j++) {
        if (j > count) {
          count++;
        }
        if (buff[j] <= arrayBookings[i].startTime) {
          buff[j] = arrayBookings[i].endTime;
          arrayBookings[i].position = j;
          break;
        }
      }
    }
    for (let i = 0; i < arrayBookings.length; i++) {
      SubBookingsInDate[arrayBookings[i].id].width = 100 / (count + 1);
      SubBookingsInDate[arrayBookings[i].id].left = 100 / (count + 1) * arrayBookings[i].position;
    }
  }

  const handleHeightPosition = (SubBookingsInDate) => {
    const startMinutes = timeToMinutes(SubBookingsInDate.startTime);
    const endMinutes = timeToMinutes(SubBookingsInDate.endTime);
    const diffInMinutes = endMinutes - startMinutes;
    SubBookingsInDate.rateDiv = Math.round(diffInMinutes / 15);
    SubBookingsInDate.height = Math.round(diffInMinutes / 15) * divHeight / 4;
    SubBookingsInDate.rateTop = Math.round(startMinutes / 15);
    SubBookingsInDate.top = Math.round(startMinutes / 15) * divHeight / 4;
  }

  const handleRawData = (structuredData) => {
    for (let dateBooking in structuredData) {
      const SubBookingsInDate = structuredData[dateBooking];
      for (let id in SubBookingsInDate) {
        handleHeightPosition(SubBookingsInDate[id])
      }
      handleUpdatePosition(SubBookingsInDate);
    }
  }

  const handleDataAtFirst = (rawData) => {
    var structuredData = {};

    rawData.forEach(subBooking => {
      if (!structuredData[subBooking.date]) {
        structuredData[subBooking.date] = {}
      }
      if (subBooking.startTime == "00:00:00" && subBooking.endTime == "23:59:59") {
        subBooking.allday = true
      }
      structuredData[subBooking.date][subBooking.id] = subBooking
    });
    handleRawData(structuredData)
    setEventBoxs((prev) => {
      return { ...prev, ...structuredData }
    })
  }

  const getSubBookingInWeek = async () => {
    if (existedFirstDayWeek.includes(format(firstDayOfWeek, 'yyyy-MM-dd'))) {
      return;
    }
    const formattedStartTime = format(firstDayOfWeek, 'yyyy-MM-dd HH:mm:ss');
    const formattedEndTime = format(endDayOfWeek, 'yyyy-MM-dd HH:mm:ss');
    await apiClient.get('/Booking/SubBookingInWeekOfLecturer', {
      params: {
        StartTime: formattedStartTime,
        EndTime: formattedEndTime,
      }
    }).then((response) => {
      console.log("subBooking : ", response.data);
      handleDataAtFirst(response.data)
      setExistFirstDayInWeek(prev => {
        prev.push(format(firstDayOfWeek, 'yyyy-MM-dd'))
        return prev;
      })
    }).catch((error) => {
      console.log("error : ", error);
    })
  }

  const getAccountById = async (userId) => {
    try {
      const response = await apiClient.get(`/Account(${userId})`);
      setAccount(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching account by ID:", error);
      throw error;
    }
  }
  
  useEffect(() => {
    if (userId) {
      getAccountById(userId);
    }
  }, [userId]);

  const getColorAndTitleEvent = (subBooking) => {
    if (!account) return [typeColors[0], "Special"];
    if (subBooking.type == 6) return [typeColors[0], account.accountName];
    if (subBooking.lectureId && subBooking.lectureId != userId) return [typeColors[1], "Co Worker"];
    if (subBooking.isBooking) return [typeColors[2], "New Book"];
    if (subBooking.lectureId == userId && subBooking.approve == 0) return [typeColors[3], "Pending"];
    if (subBooking.lectureId == userId && subBooking.approve == 10) return [typeColors[4], account.accountName];
    return [typeColors[4], "Special"];
  }

  const handleViewGroupDetail = () => {
    setIsViewGroupInBookingDetail(true);
  }
  
  const handleCloseGroupDetail = () => {
    console.log("check grouppp : ", groups)
    setIsViewGroupInBookingDetail(false);
  }

  useEffect(() => {
    getSubBookingInWeek();
  }, [firstDayOfWeek])

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerHeight < 500) {
        setDivHeight(40);
      } else {
        setDivHeight(48);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [firstDayOfWeek]);

  const handleChangeTypeSlot = (typeSlot) => {
    setTypeSlot(typeSlot)
    setIsShowTypeSlotSelection(false)
    if (typeSlot != 3) {
      setSlotTimes(typeSlot == 2 ? newSlots : oldSlots)
      overflowDivRef.current.scrollTo({
        top: 300,
        behavior: 'smooth'
      })
    }
  }
  
  const handleClickTypeSlot = () => {
    setIsShowTypeSlotSelection(prev => !prev);
  }

  const getGroupsOfLecturer = async () => {
    await apiClient
      .get("/Group/GetGroupsOfLecturer", {})
      .then((response) => {
        handleDataGroupBeforeDisplay(response.data);
        console.log("data response : ", response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleDataGroupBeforeDisplay = (dataGroups) => {
    const modifiedGroups = [];
    Object.entries(dataGroups).map(([groupId, studentInGroup], index) => {
      modifiedGroups[index] = [];
      studentInGroup.forEach((student) => {
        let studentDetail = {
          accountDetail: {
            id: student.studentId,
            avatar: student.avatar,
            fullName: student.fullName,
            studentId: student.studentCode,
            groupId: groupId,
            groupName: studentInGroup[0].groupName,
            studentInGroup: student.studentInGroupId
          },
        };
        modifiedGroups[index].push(studentDetail);
      });
    });
    console.log('hah : ', modifiedGroups)
    setGroups(modifiedGroups);
  };

  const handleCloseViewDetail = () => {
    setCurrentEventBox({});
    setIsShowSubBookingDetail(false);
  }

  useEffect(() => {
    getGroupsOfLecturer();
  }, []);

  return (
    <div className="min-h-screen bg-indigo-50/50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-800 flex items-center">
            <FaCalendarDay className="mr-3 text-indigo-600" />
            My Schedule
          </h1>
          <p className="text-slate-600 mt-2">
            Manage all your room bookings and events
          </p>
        </div>
      
        <div className="flex flex-col lg:flex-row gap-6">
          <div 
            className={`${isShowSubBookingDetail ? "w-full lg:w-3/4" : "w-full"} 
            bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md 
            transition-all p-4 min-w-0`}
          >
            <div id="calendar-header" className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleClickToday}
                  className="px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 
                  font-medium hover:bg-indigo-100 transition-colors flex items-center"
                >
                  <FaCalendarDay className="mr-2" />
                  Today
                </button>
                
                <div className="flex rounded-xl border border-indigo-200 overflow-hidden">
                  <div className="px-4 py-2.5 font-medium text-indigo-800 bg-white min-w-[160px] text-center">
                    {format(firstDayOfWeek, "MMMM yyyy")}
                  </div>
                  <button
                    onClick={() => setIsShowMonthModal(true)}
                    className="px-3 py-2.5 border-l border-indigo-200 text-indigo-700 
                    hover:bg-indigo-100 transition-colors"
                  >
                    <DownChevronArrowIcon />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex rounded-xl border border-indigo-200 overflow-hidden">
                  <div className="px-4 py-2.5 font-medium border-r border-indigo-200">
                    Week
                  </div>
                  <button
                    onClick={() => handleMoveWeek(0)}
                    className="px-3 py-2.5 border-r border-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <LeftChevronArrowIcon />
                  </button>
                  <button
                    onClick={() => handleMoveWeek(1)}
                    className="px-3 py-2.5 hover:bg-indigo-100 transition-colors"
                  >
                    <RightChevronArrowIcon />
                  </button>
                </div>

                <div className="relative">
                  <button 
                    onClick={handleClickTypeSlot} 
                    className="flex items-center px-3 py-2.5 rounded-xl border border-indigo-200 
                    hover:bg-indigo-100 transition-colors"
                  >
                    <FilterIcon className="mr-2" />
                    <span className="font-medium">{typeSlots[TypeSlot]}</span>
                  </button>
                  
                  {isShowTypeSlotSelection && (
                    <div className="absolute right-0 mt-2 z-50 min-w-[140px]">
                      <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                        <ul className="py-1">
                          {Object.keys(typeSlots).map((slotKey) => (
                            <li key={slotKey}>
                              <button
                                onClick={() => handleChangeTypeSlot(parseInt(slotKey))}
                                className="flex w-full items-center px-4 py-2.5 hover:bg-indigo-50 text-left font-medium"
                              >
                                {parseInt(slotKey) === TypeSlot && (
                                  <FaCheck className="mr-2 text-indigo-600 h-3 w-3" />
                                )}
                                <span className={parseInt(slotKey) === TypeSlot ? "text-indigo-700" : ""}>
                                  {typeSlots[slotKey]}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {isShowSubBookingDetail && (
                  <button
                    onClick={handleCloseViewDetail}
                    className="flex items-center px-3 py-2.5 rounded-xl border border-indigo-200 
                    hover:bg-indigo-100 transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Close Details
                  </button>
                )}
              </div>
            </div>

            <div id="calendar-body" className="relative h-[600px] lg:h-[550px]">
              <div className="h-full">
                <div className="z-auto opacity-100 h-full">
                  <div className="flex flex-col h-full">
                    {/* Days of week header */}
                    <div id="day-in-week" className="flex bg-indigo-50 rounded-t-lg">
                      <div className="w-[60.725px] font-medium p-3 text-indigo-700">UTC +7</div>
                      <div className="flex flex-1">
                        {eachDayOfInterval({
                          start: firstDayOfWeek,
                          end: endDayOfWeek,
                        }).map((element, i) => {
                          // Check if it's today
                          const isToday = format(element, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                          
                          return (
                            <div
                              key={i}
                              className={`flex flex-1 items-center justify-center p-3 cursor-pointer
                              ${isToday ? 'bg-indigo-100 text-indigo-800 font-semibold' : ''}`}
                            >
                              <div>
                                {format(element, "EEE dd")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* All day events row */}
                    <div id="all-day" className="flex border-t border-b border-indigo-100">
                      <div className="flex min-w-[40px] font-medium text-slate-600 w-[60px] p-2">
                        All day
                      </div>
                      <div className="flex flex-1">
                        {eachDayOfInterval({
                          start: firstDayOfWeek,
                          end: endDayOfWeek,
                        }).map((date, i) => {
                          const formattedDate =
                            format(date, "yyyy-MM-dd") + "T00:00:00";
                          const events = eventBoxs?.[formattedDate];

                          const id =
                            events && Object.keys(events).length > 0
                              ? Object.keys(events)[0]
                              : null;
                          return (
                            <div
                              key={i}
                              className="flex flex-1 items-center justify-center border-l border-indigo-100 p-2"
                            >
                              {id && events[id]?.allday && (
                                <div
                                  className={`rounded-lg w-full h-full flex flex-1 justify-center 
                                  items-center py-1.5 text-white text-sm font-medium
                                  ${getColorAndTitleEvent(events[id])[0]}`}
                                >
                                  {getColorAndTitleEvent(events[id])[1]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Week detail grid */}
                    <div
                      id="week-detail"
                      ref={overflowDivRef}
                      className="flex relative overflow-auto flex-1 border-t border-indigo-100"
                    >
                      {/* Time labels */}
                      <div className="flex items-start min-w-[60px] bg-indigo-50/50">
                        <div className="relative">
                          {TypeSlot == 3 ? (
                            Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i}
                                style={{ height: divHeight }}
                                className="relative min-h-2 pr-2 text-right"
                              >
                                <span className="relative block text-sm font-medium text-indigo-800 -translate-y-1/2">
                                  {i == 0 ? null : `${i}:00`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <>
                              {Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                                <div
                                  key={i}
                                  style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                                  className={`relative min-h-2 px-2 text-right 
                                  ${i % 2 == 1 
                                    ? "flex justify-center text-sm font-medium text-white items-center rounded-lg bg-indigo-600" 
                                    : ""
                                  }`}
                                >
                                  {i % 2 == 1 ? (
                                    <div className="">Slot {Math.floor(i / 2) + 1}</div>
                                  ) : null}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Main calendar grid */}
                      <div className="flex flex-1 relative">
                        <div area-hidden="true" className="">
                          {TypeSlot == 3 ? (
                            Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i + "fd"}
                                style={{ height: divHeight }}
                                className="min-h-10 after:absolute after:w-full after:border-b after:border-indigo-100"
                              ></div>
                            ))
                          ) : (
                            <>
                              {Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                                <div
                                  key={i + "fd"}
                                  style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                                  className="min-h-2 after:absolute after:w-full after:border-t after:border-indigo-100"
                                ></div>
                              ))}
                              <div
                                key={"bottom-line"}
                                className="min-h-2 after:absolute after:w-full after:border-t after:border-indigo-100"
                              ></div>
                            </>
                          )}
                        </div>
                        
                        {/* Space divider */}
                        <div className="w-[8px] flex h-[960.8px]"></div>

                        {/* Day columns with events */}
                        {eachDayOfInterval({
                          start: firstDayOfWeek,
                          end: endDayOfWeek,
                        }).map((date, i) => {
                          const formattedDate =
                            format(date, "yyyy-MM-dd") + "T00:00:00";
                          const events = eventBoxs?.[formattedDate];
                          
                          // Check if it's today
                          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                          return (
                            <div
                              key={formattedDate}
                              style={{ height: divHeight * 24 }}
                              className={`relative flex flex-1 pr-[8px] border-l border-indigo-100
                                ${isToday ? 'bg-indigo-50/30' : ''}`}
                            >
                              <h2 hidden className="absolute"></h2>

                              <div
                                ref={(el) => (divRefs.current[i] = el)}
                                className="relative w-full h-full"
                              >
                                {events &&
                                  Object.keys(events).map((id) => {
                                    return (
                                      <EventBox
                                        key={id}
                                        id={id}
                                        dateBooking={events[id].date}
                                        height={
                                          (events[id]?.rateDiv * divHeight) /
                                          4
                                        }
                                        top={
                                          (events[id]?.rateTop * divHeight) /
                                          4
                                        }
                                        isShrinking={currentEventBox.id == id}
                                        handleMouseDownShrink={
                                          () => { }
                                        }
                                        startTime={events[id]?.startTime}
                                        endTime={events[id]?.endTime}
                                        subBooking={events[id]}
                                        lectureId={events[id]?.lectureId}
                                        allday={events[id]?.allday}
                                        width={events[id]?.width}
                                        left={events[id]?.left}
                                        handleOpenSubBookingDetail={
                                          handleOpenSubBookingDetail
                                        }
                                        type={events[id]?.type}
                                        index={i}
                                        colorAndTitle={getColorAndTitleEvent(events[id])}
                                      />
                                    );
                                  })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking details sidebar */}
          {isShowSubBookingDetail && (
            <div className="w-full lg:w-1/4">
              <SubBookingDetail 
                newSubBooking={currentEventBox} 
                handleViewGroupDetail={handleViewGroupDetail} 
                setGroups={setGroups} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Month selector modal */}
      {isShowMonthModal && (
        <MonthBox
          handleClickMonth={handleClickMonth}
          handleCloseMonth={setIsShowMonthModal}
        />
      )}

      {/* Group modal */}
      {isViewGroupInBookingDetail && (
        <GroupModalUpdatingBooking 
          typeModal={10} 
          inputGroups={groups} 
          handleCloseModal={handleCloseGroupDetail} 
          subBookingId={currentEventBox.id} 
          currentSubBooking={currentEventBox} 
        />
      )}
    </div>
  );
};

const EventBox = ({ 
  id, 
  dateBooking, 
  height, 
  top, 
  colorAndTitle, 
  isBuffer, 
  isShrinking, 
  handleMouseDownShrink, 
  startTime, 
  endTime, 
  width, 
  left, 
  handleOpenSubBookingDetail, 
  index 
}) => {
  return (
    <div 
      style={{ 
        top, 
        height, 
        width: width + "%", 
        left: left + "%" 
      }} 
      tabIndex={0} 
      className={`
        absolute rounded-lg shadow-sm border border-white/50
        ${colorAndTitle[0]} ${isShrinking ? 'opacity-50' : ''}
        cursor-pointer hover:shadow-md transition-all
      `}
    >
      {!isBuffer && (
        <div 
          onClick={(e) => {
            handleOpenSubBookingDetail(dateBooking, id, index);
            e.stopPropagation();
          }} 
          className="px-3 py-2 select-none h-full"
        >
          <div className="font-semibold text-sm text-wrap overflow-hidden text-ellipsis text-white">
            {colorAndTitle[1]}
          </div>
          <div className="text-xs text-white/90">
            {startTime.slice(0, 5)} - {endTime.slice(0, 5)}
          </div>
        </div>
      )}
      
      <div 
        onMouseDown={(e) => {
          handleMouseDownShrink(dateBooking, id);
          e.stopPropagation();
        }} 
        className="absolute z-50 bottom-0 left-0 right-0 h-[50%] max-h-[8px] cursor-n-resize"
      ></div>
    </div>
  )
}

const MonthBox = ({ handleClickMonth, handleCloseMonth }) => {
  return (
    <div
      onClick={() => handleCloseMonth(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
      >
        <div className="border-b border-indigo-100 p-4">
          <h3 className="text-lg font-semibold text-center text-indigo-800">Select Month</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-1 p-2">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleClickMonth(i)}
              className="py-3 text-center rounded-lg hover:bg-indigo-50 text-indigo-700 transition-colors"
            >
              {format(setMonth(new Date(), i), "MMMM")}
            </button>
          ))}
        </div>
        
        <div className="border-t border-indigo-100 p-3 flex justify-end">
          <button
            onClick={() => handleCloseMonth(false)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const SubBookingDetail = ({ newSubBooking, handleViewGroupDetail, setGroups }) => {
  const [isUpdate, setIsUpDate] = useState(null)
  const navigate = useNavigate();

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "00:00";
    const timePart = timeString.slice(0, 5);

    const [hours, minutes] = timePart.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const handleClickMarkAttendance = (subBooking) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const bookingDate = new Date(subBooking.date);
    const bookingDateString = bookingDate.toISOString().split('T')[0];
    const bookingPlusOne = new Date(bookingDate);
    bookingPlusOne.setDate(bookingDate.getDate() + 1);
    const bookingPlusOneString = bookingPlusOne.toISOString().split('T')[0];
    
    if (today == bookingDateString || today == bookingPlusOneString) {
      const startTime = new Date(`${today}T${subBooking.startTime}`);
      // Check time
      if (now >= startTime || today == bookingPlusOneString) {
        navigate('/mark-attendance/' + subBooking.id)
      } else {
        swtoast.warning({ text: "The session has not started yet.", timer: 1500 });
      }
    } else {
      if(today < bookingDateString) {
        swtoast.warning({ text: "The session has not started yet.", timer: 1500 });
      } else {
        swtoast.warning({ text: "Attendance marking period has expired.", timer: 1500 });
      }
    }
  }

  const checkUpdatingSubBooking = async () => {
    await apiClient.get("/Booking/checkUpdatingSubBooking", {
      params: {
        subBookingId: newSubBooking.id
      }
    }).then((response) => {
      // Handle response
    })
  }

  const getStudentInGroupOfBooking = async () => {
    await apiClient.get("/StudentInGroup/getStudentInBooking", {
      params: {
        subBookingId: newSubBooking.id
      }
    }).then((response) => {
      console.log("student in Booking : ", response.data)
      setGroups(prev => {
        const groupsInvolveBooking = [];
        prev.map((group) => {
          let isGroupInBooking = false;
          group.map((student) => {
            if (response.data.includes(student.accountDetail.studentInGroup)) {
              student.accountDetail.inBooking = true;
              student.accountDetail.isBookingNew = true;
              isGroupInBooking = true;
            }
            else {
              student.accountDetail.inBooking = false;
              student.accountDetail.isBookingNew = false;
            }
          })
          
          if (isGroupInBooking) {
            groupsInvolveBooking.unshift(group)
          }
          else {
            groupsInvolveBooking.push(group)
          }
        })
        
        return groupsInvolveBooking
      })
    }).catch((error) => {
      console.log("eeror : ", error)
    })
  }

  useEffect(() => {
    getStudentInGroupOfBooking();
  }, [newSubBooking])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all h-full">
      <div className="p-4 border-b border-indigo-100 bg-indigo-50/50">
        <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
          <FaCalendarDay className="mr-2 text-indigo-600" />
          Booking Details
        </h2>
      </div>
      
      <div className="p-4 flex flex-col h-[calc(100%-60px)] justify-between">
        <div className="space-y-4">
          {/* Room info */}
          <div className="flex items-center p-3 bg-indigo-50 rounded-xl">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
              <FaMapMarkerAlt className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-indigo-600 font-medium">Room</div>
              <div className="font-medium text-indigo-900">{newSubBooking.roomName}</div>
            </div>
          </div>
          
          {/* Date info */}
          <div className="flex items-center p-3 bg-indigo-50 rounded-xl">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
              <FaCalendarDay className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-indigo-600 font-medium">Date</div>
              <div className="font-medium text-indigo-900">
                {newSubBooking.date ? format(new Date(newSubBooking.date.split("T")[0]), "dd/MM/yyyy") : ""}
              </div>
            </div>
          </div>
          
          {/* Time info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center p-3 bg-indigo-50 rounded-xl">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
                <FaClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-indigo-600 font-medium">Start</div>
                <div className="font-medium text-indigo-900">
                  {formatTimeDisplay(newSubBooking?.startTime)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-indigo-50 rounded-xl">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
                <FaClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-indigo-600 font-medium">End</div>
                <div className="font-medium text-indigo-900">
                  {formatTimeDisplay(newSubBooking?.endTime)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Group info */}
          <button 
            onClick={handleViewGroupDetail}
            className="flex items-center w-full p-3 bg-indigo-50 rounded-xl 
            hover:bg-indigo-100 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
              <FaUsers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-indigo-600 font-medium">Participant List</div>
              <div className="font-medium text-indigo-900">
                {newSubBooking?.studentQuantity || 0} members - {newSubBooking?.groupQuantity || 0} groups
              </div>
            </div>
          </button>
          
          {/* Attendance button for mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => handleClickMarkAttendance(newSubBooking)}
              className="flex items-center w-full p-3 bg-indigo-50 rounded-xl 
              hover:bg-indigo-100 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mr-3">
                <FaUserCheck className="h-5 w-5" />
              </div>
              <div className="font-medium text-indigo-700">
                Mark Attendance
              </div>
            </button>
          </div>

          <div className="w-full h-[1px] bg-indigo-100 my-2"></div>

          {/* Approval info */}
          {newSubBooking.approve == 10 && newSubBooking.updatedAt && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-xl">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-lg p-2 mr-3">
                  <FaCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Approved</div>
                  <div className="text-sm text-indigo-100">
                    {newSubBooking.updatedAt 
                      ? format(new Date(newSubBooking.updatedAt), "dd/MM/yyyy HH:mm:ss") 
                      : "..."}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {newSubBooking.approve == 0 && (
            <div>
              <div className="font-medium text-indigo-800 mb-2">Booking Reason</div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                <p className="text-slate-700">{newSubBooking?.reason || "No reason provided"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {newSubBooking.approve == 10 && (
          <div className="mt-4">
            <button
              onClick={() => handleClickMarkAttendance(newSubBooking)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 
              text-white rounded-xl font-medium hover:shadow-md transition-all flex items-center justify-center"
            >
              <FaUserCheck className="mr-2" />
              Mark Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchedulePage;