import { startOfWeek, endOfWeek, format, eachDayOfInterval, addDays, getDay, startOfMonth, subDays, setMonth, addMinutes, differenceInMinutes, parseISO, getHours, getMinutes } from "date-fns";
import {
  LeftChevronArrowIcon,
  RightChevronArrowIcon,
  UpChevronArrowIcon,
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
import store from "../../store/store";
import { useSelector } from "react-redux";
import GroupModalUpdatingBooking from "./GroupModalUpdateBooking";
import { useNavigate } from "react-router-dom";
const typeColors = {
  0: 'bg-[#28A745]',  // belong to admin
  1: 'bg-[#7b7878]',  //belong to other
  2: 'bg-[#33D29C]',  // new subbooking   
  3: 'bg-[#FFC107]', // belong to user , not confirm
  4: 'bg-[#28A745]', // belong to user, confirmed
}
const typeSlots = {
  1: "old slot",
  2: "new slot",
  3: "out slot"
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
  //current eventbox
  const [currentEventBox, setCurrentEventBox] = useState({ height: 0, top: 0 });

  //month modal
  const [isShowMonthModal, setIsShowMonthModal] = useState(false);
  const [divHeight, setDivHeight] = useState(48);

  //description
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
    console.log("after set top and height : ", structuredData)

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

    console.log("structure : ", structuredData)

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
    console.log("subbooking : ", subBooking)

    console.log("userId : ", account)
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

  useEffect(() => {
    getGroupsOfLecturer();
  }, []);

  return (
    <div className="min-h-screen ">
      <div className="mx-16">
        <div className="font-mono text-3xl font-bold">Calendar</div>
      </div>
      <div className="mx-16 pt-8 flex  ">

        <div className={`${isShowSubBookingDetail ? "w-[75%]" : "w-full"} rounded-3xl p-4 border-gray-200 border-2  min-w-[500px] h-[650px]`}>
          <div id="calendar-header" className="flex justify-between mb-8">
            <div className="flex space-x-2">
              <div
                onClick={handleClickToday}
                className="rounded-2xl border-2 border-gray-300 hover:bg-gray-300 cursor-pointer "
              >
                <div className="font-mono font-bold p-2 ">Today</div>
              </div>
              <div className="flex border-gray-300 border-2 rounded-2xl ">
                <div className="p-2 font-mono w-36 flex justify-center">
                  {format(firstDayOfWeek, "MMMM yyyy")}{" "}
                </div>
                <div
                  onClick={() => {
                    setIsShowMonthModal(true);
                  }}
                  className="p-2 border-l-2 border-gray-300 hover:bg-gray-300 rounded-r-xl cursor-pointer"
                >
                  <DownChevronArrowIcon />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex rounded-2xl border-2 border-gray-300">
                <div className="font-mono p-2 border-r-2 border-gray-300">
                  Week
                </div>
                <div
                  onClick={() => {
                    handleMoveWeek(0);
                  }}
                  className="p-2 border-r-2 border-gray-300 hover:bg-gray-300 cursor-pointer"
                >
                  <LeftChevronArrowIcon />
                </div>
                <div
                  onClick={() => {
                    handleMoveWeek(1);
                  }}
                  className="p-2 hover:bg-gray-300 rounded-r-xl cursor-pointer"
                >
                  <RightChevronArrowIcon />
                </div>
              </div>
              <div className="flex relative">
                <div onClick={() => { handleClickTypeSlot() }} className="flex rounded-2xl border-2 border-gray-300">
                  <div className="p-2 border-r-2 border-gray-300">
                    <FilterIcon />
                  </div>
                  <div className="font-mono p-2 rounded-r-xl cursor-pointer hover:bg-gray-200">{typeSlots[TypeSlot]}</div>
                </div>
                {isShowTypeSlotSelection ? (
                  <div className="absolute mt-12 z-50 ">
                    <div id="dropdownSearch" class="z-10 bg-white rounded-xl shadow-sm w-32 dark:bg-gray-700">

                      <ul class=" px-3 border-[#F8F8F8] rounded-xl border-2 text-base text-gray-700 dark:text-gray-200" aria-labelledby="dropdownSearchButton">
                        {Object.keys(typeSlots).map((slotKey, n) => {
                          return (
                            <li>
                              <div onClick={() => { handleChangeTypeSlot(parseInt(slotKey)) }} class="flex items-center font-mono pl-1 py-1 my-1 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                                {typeSlots[slotKey]}
                              </div>
                            </li>
                          )
                        })}
                      </ul>

                    </div>
                  </div>
                ) : null}


              </div>

              <div className="flex rounded-2xl border-2 border-gray-300">
                <div className="p-2 border-r-2 border-gray-300">
                  <DownloadIcon />
                </div>
                <div className="font-mono p-2">Export</div>
              </div>
            </div>
          </div>
          <div id="calendar-body" className="relative h-full">
            <div className="h-full">
              <div className="z-auto opacity-100">
                <div className="flex flex-col h-full">
                  <div id="day-in-week" className="flex">
                    <div className="w-[60.725px] font-mono">UTC +7</div>
                    <div className="flex flex-1">
                      {eachDayOfInterval({
                        start: firstDayOfWeek,
                        end: endDayOfWeek,
                      }).map((element, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            handleSwitchDayView(element)
                          }
                          className="flex flex-1 items-center justify-center cursor-pointer"
                        >
                          <div className="font-mono">
                            {format(element, "EEE dd")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    id="all-day"
                    className="flex border-y-[1px] border-gray-300"
                  >
                    <div className="flex min-w-[40px] font-mono w-[60px]">
                      allday
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
                            onClick={() => {
                            }}
                            className="flex flex-1 items-center justify-center font-mono border-l-[1px] border-gray-300"
                          >
                            {
                              <div
                                className={` mr-2 rounded-md w-full h-full flex flex-1 justify-center hover:${typeColors[2]} transition-colors duration-300 ease-in-out font-mono ${id &&
                                  events[id]?.allday &&
                                  getColorAndTitleEvent(events[id])[0]
                                  } `}
                              ></div>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    id="week-detail"
                    ref={overflowDivRef}
                    className="flex relative overflow-auto h-[480px]"
                  >
                    <div className="flex items-start min-w-[40px]">
                      <div className="relative">
                        {TypeSlot == 3 ? Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            style={{ height: divHeight }}
                            className="relative min-h-2 pr-[8px] text-right"
                          >
                            <span className="relative px-[13px] block text-base font-mono -translate-y-1/2">
                              {i == 0
                                ? null
                                : i}
                            </span>
                          </div>
                        )) : (
                          <>
                            {Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                              <div
                                key={i}
                                style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                                className={`relative  min-h-2 px-[8px] text-right ${i % 2 == 1 ? "flex justify-center text-sm font-mono text-white  items-center rounded-lg bg-[#33D29C]" : ""} `}
                              >
                                {i % 2 == 1 ? (<div className="">slot {Math.floor(i / 2) + 1}</div>) : null}
                              </div>
                            ))}

                          </>
                        )}

                      </div>
                    </div>
                    <div

                      className="flex flex-1 relative"
                    >
                      <div area-hidden="true" className="">
                        {TypeSlot == 3 ? (
                          Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i + "fd"}
                              style={{ height: divHeight }}
                              className="min-h-10 after:absolute after:w-full after:border-b-[1px] after:border-gray-300"
                            ></div>
                          ))
                        ) : (
                          <>
                            {Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                              <div
                                key={i + "fd"}
                                style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                                className="min-h-2 after:absolute after:w-full after:border-t-[1px] after:border-gray-300"
                              ></div>
                            ))}
                            <div
                              key={"bottom-line"}
                              className="min-h-2 after:absolute after:w-full after:border-t-[1px] after:border-gray-300"
                            ></div>
                          </>
                        )}

                      </div>
                      <div className="w-[8px] flex h-[960.8px]"></div>

                      {eachDayOfInterval({
                        start: firstDayOfWeek,
                        end: endDayOfWeek,
                      }).map((date, i) => {
                        const formattedDate =
                          format(date, "yyyy-MM-dd") + "T00:00:00";
                        const events = eventBoxs?.[formattedDate];

                        return (
                          <div

                            key={formattedDate}
                            style={{ height: divHeight * 24 }}
                            className="relative flex flex-1 pr-[8px] border-l-[1px] border-gray-300"
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
        {
          isShowSubBookingDetail &&
          <div className="flex flex-1 ">
            <SubBookingDetail newSubBooking={currentEventBox} handleViewGroupDetail={handleViewGroupDetail} setGroups={setGroups} />
          </div>
        }
        {isShowMonthModal ? (
          <MonthBox
            handleClickMonth={handleClickMonth}
            handleCloseMonth={setIsShowMonthModal}
          />
        ) : null}

        {isViewGroupInBookingDetail ?
          <GroupModalUpdatingBooking typeModal={10} inputGroups={groups} handleCloseModal={handleCloseGroupDetail} subBookingId={currentEventBox.id} currentSubBooking={currentEventBox} />
          : null}
      </div>
    </div>
  );
};

const EventBox = ({ id, dateBooking, height, top, colorAndTitle, isBuffer, isShrinking, handleMouseDownShrink, startTime, endTime, width, left, handleOpenSubBookingDetail, index }) => {
  return (
    <div style={{ top: top, height: height, width: width + "%", left: left + "%" }} tabIndex={0} className={`w-full border-[1px] border-white absolute rounded-lg ${colorAndTitle[0]} ${isShrinking ? 'opacity-50' : ''} cursor-pointer`}>
      {isBuffer ? (null) : (<div onClick={(e) => {
        handleOpenSubBookingDetail(dateBooking, id, index);
        e.stopPropagation();
      }} className="pl-4 select-none">
        <div className="font-bold text-base font-mono text-wrap overflow-hidden text-ellipsis text-white">{colorAndTitle[1]}</div>
        <div className="font-mono text-xs whitespace-normal text-wrap break-words text-white">{startTime.slice(0, 5) + "-" + endTime.slice(0, 5)}</div>
      </div>)}
      <div onMouseDown={(e) => {
        handleMouseDownShrink(dateBooking, id);
        e.stopPropagation();

      }} className="absolute z-50 bottom-0 left-0 right-0 h-[50%] max-h-[8px] cursor-n-resize"></div>

    </div>
  )
}


const MonthBox = ({ handleClickMonth, handleCloseMonth }) => {

  return (
    <div
      onClick={() => handleCloseMonth(false)}
      id="default-modal"
      tabindex="-1"
      aria-hidden="true"
      class="overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed inset-0 z-60 justify-center flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-1/4 rounded-3xl border-[1px] bg-white "
      >
        <div className="flex justify-center items-center font-mono font-bold text-[#8834FE] py-2">
          Month
        </div>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            onClick={() => {
              handleClickMonth(i);
              handleCloseMonth(false);
            }}
            className="flex justify-center items-center font-mono py-2 border-t-[1px] border-gray-200 hover:bg-[#F3F4F6]"
          >
            {format(setMonth(new Date(), i), "MMMM")}
          </div>
        ))
        }
      </div>
    </div>
  )
}


const SubBookingDetail = ({ newSubBooking, handleViewGroupDetail, setGroups }) => {
  console.log("fuck : ", newSubBooking)
  const navigate = useNavigate();

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "00:00";
    const timePart = timeString.slice(0, 5);

    const [hours, minutes] = timePart.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const handleClickMarkAttendance = (subBookingId) => {
    navigate('/mark-attendance/' + subBookingId)
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
            console.log("sutdeddddddd : ", student)
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
    <div className="w-full border-2 border-gray-200 p-4 rounded-3xl bg-white">
      <div className="flex flex-col h-full justify-between">
        <div >
          <div className="flex space-x-4 bg-[#F8F8F8] rounded-lg p-2 items-center mb-4 cursor-pointer">
            <CalendarIcon />
            <div className="font-mono">{newSubBooking.date.split("T")[0]}</div>
          </div>

          <div className="flex space-x-4 flex-1 mb-4">
            <div className="relative flex-1">
              <div className="flex space-x-2 bg-[#F8F8F8] rounded-lg flex-1 p-2 cursor-pointer">
                <ClockIcon />
                <div className="font-mono">{formatTimeDisplay(newSubBooking?.startTime)}</div>
              </div>

            </div>
            <div className="relative flex-1" >
              <div className="flex space-x-2 bg-[#F8F8F8] rounded-lg flex-1 p-2 cursor-pointer">
                <ClockIcon />
                <div className="font-mono">{formatTimeDisplay(newSubBooking?.endTime)}</div>
              </div>

            </div>
          </div>

          <div onClick={handleViewGroupDetail} className="flex bg-[#F8F8F8] rounded-lg p-2 items-center mb-4 space-x-4 cursor-pointer">
            <AddUserIcon />
            <div className="font-mono"> {newSubBooking?.studentQuantity + " members - " + newSubBooking?.groupQuantity + " groups"} </div>
          </div>
          <div id="participant">

          </div>

          {/* Thẻ div điểm danh */}
          <div
            onClick={() => handleAttendance(newSubBooking.id)}
            className="flex bg-[#F8F8F8] rounded-lg p-2 items-center mb-4 space-x-4 cursor-pointer hover:bg-gray-200 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="w-full h-[2px] bg-[#F8F8F8] mb-2"></div>

          <div className="font-mono font-bold"> Description </div>
          <div class="max-w-sm mx-auto">
            <textarea disabled rows="4" readOnly value={newSubBooking?.reason} class="block font-mono p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a reason...">
            </textarea>
          </div>
        </div>

        <div className="flex justify-center space-x-2 mt-4">
          {newSubBooking.approve == 10 ? (<button onClick={() => { handleClickMarkAttendance(newSubBooking.id) }} className="font-mono w-3/5 rounded-lg flex justify-center bg-[#4757E3] py-1 text-white hover:bg-opacity-50 ">Mark Attendance</button>
          ) : null}
        </div>
      </div>

    </div>
  )

}




export default SchedulePage;