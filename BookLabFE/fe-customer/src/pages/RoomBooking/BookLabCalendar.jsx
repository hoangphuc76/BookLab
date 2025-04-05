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
  AddUserIcon,
  ListTaskIcon
} from "../../icons";
import { motion, AnimatePresence } from "framer-motion";
import OneDayBooking from "../../components/OneDayBooking"
import { swtoast } from "../../utils/swal";
import { useState, useRef, useEffect, useCallback } from "react";
import CartBooking from "./CartBooking";
import apiClient from "../../services/ApiClient";
import { timeToMinutes, minutesToTime } from "../../utils/dateUtils";
import store from "../../store/store";
import SubBookingDetail from "../../components/SubBookingDetail";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
const typeColors = {
  0: 'bg-[#d91313]',  // belong to admin
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



const BookLabCalendar = ({ room }) => {

  const divRefs = useRef([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDayOfWeek, setEndDayOfWeek] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDragging, setIsDragging] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const [eventBoxs, setEventBoxs] = useState({});
  const [subBookingCart, setSubBookingCart] = useState({});
  //const [roomId, setRoomId] = useState('cfbad18f-5e95-461e-951c-985e216edd6c')
  //const [userId, setUserId] = useState('4737d04e-69f1-4229-a7ac-eff389832d06')
  const [leftPositionSubBooking, setLeftPositionSubBooking] = useState(null);
  const overflowDivRef = useRef(null);
  const { userId } = useSelector((state) => state.profile);
  //state view
  const [openViewDay, setOpenViewDay] = useState(false);
  const [dataForDay, setDataForDay] = useState({});
  const [date, setDate] = useState(null);

  //current eventbox
  const [currentEventBox, setCurrentEventBox] = useState({ height: 0, top: 0 });
  const [currentEventBoxSub, setCurrentEventBoxSub] = useState({})
  console.log("current booxxxx : ", currentEventBoxSub)

  //month modal
  const [isShowMonthModal, setIsShowMonthModal] = useState(false);
  const [isCreateSubBooking, setIsCreateSubBooking] = useState(false);
  const [divHeight, setDivHeight] = useState(48);

  //description
  const [CategoryDescription, setCategoryDescription] = useState();
  const [TypeSlot, setTypeSlot] = useState(3);
  const [isShowTypeSlotSelection, setIsShowTypeSlotSelection] = useState(false);
  const [slotTimes, setSlotTimes] = useState(null);
  const [existedFirstDayWeek, setExistFirstDayInWeek] = useState([]);
  const [isShowCart, setIsShowCart] = useState(false);
  const timeLineRef = useRef();
  const currentTimeLineRef = useRef({});
  const labelTimeLineRef = useRef()

  //take height and width
  const calanderRefs = useRef(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });
  useEffect(() => {
    if (calanderRefs.current) {
      const { clientHeight, clientWidth } = calanderRefs.current;
      // setDimensions({ height: clientHeight, width: clientWidth });
      setDimensions((prev) => ({
        ...prev,
        height: 650,
        width: isShowCart ? 805.2 : 1099,
      }));
    } else {
      setDimensions((prev) => ({
        ...prev,
        width: isShowCart ? 805.2 : 1099,
      }));
    }
  }, [isShowCart]);

  console.log("evenboox all : ", eventBoxs)

  const handleTriggerTimeLine = () => {

    const startMinutes = timeToMinutes(format(new Date(), "HH:mm:") + "00");
    const buff = Math.round(startMinutes / 15 * divHeight / 4) + "px";
    timeLineRef.current.style.top = buff;
    labelTimeLineRef.current.style.top = buff;
    if (currentTimeLineRef.current) {
      currentTimeLineRef.current.style.top = buff;
    }

  }

  const handleMouseDown = (e, date, i) => {
    handleTriggerTimeLine();
    if (isCreateSubBooking) {
      setCurrentEventBox({});
      setIsCreateSubBooking(false);
      return;
    }
    const formattedDate = format(date, "yyyy-MM-dd") + "T00:00:00";
    const parentDiv = divRefs.current[i].getBoundingClientRect();
    const divide = divHeight / 4;
    const rateTop = Math.floor((e.clientY - parentDiv.top) / divide);
    const y = Math.floor((e.clientY - parentDiv.top) / divide) * divide;

    const startTime = minutesToTime(rateTop * 15)
    const currentDate = format(new Date(), "yyyy-MM-dd") + "T00:00:00";
    const currentTime = minutesToTime(timeToMinutes(format(new Date(), "HH:mm:") + "00") + 30)
    if (formattedDate < currentDate || (formattedDate == currentDate && startTime < currentTime)) {
      setCurrentEventBox({});
      setIsCreateSubBooking(false);
      swtoast.warning({ text: "Please book before 30.M from now", timer: 1500 })
      return;
    }
    setCurrentEventBox({ height: 0, top: y, lecturerId: userId, left: parentDiv.left, width: parentDiv.width, date: formattedDate, rateTop: rateTop, startTime: startTime, index: i, typeSlot: TypeSlot });
    setIsDragging(true);
  }

  const handleMouseMove = (e) => {
    const parentDiv = divRefs.current[0].getBoundingClientRect();
    const y = e.clientY - parentDiv.top;
    const height = y - currentEventBox.top;
    if (isDragging || isShrinking) {
      setCurrentEventBox(prev => {
        if (Math.abs(height - prev.height) > 3) {
          prev.height = height;
          return { ...prev };
        }
        return prev;
      })
    }
  }

  const handleMouseUp = () => {
    if (isDragging || isShrinking) {
      if (currentEventBox.height > 2) {
        const divide = divHeight / 4;
        setIsDragging(false);
        setIsShrinking(false);
        const buffEndTime = minutesToTime(timeToMinutes(currentEventBox.startTime) + (Math.floor(currentEventBox.height / divide) + 1) * 15);
        if (!checkConditionPrivate(currentEventBox.date, currentEventBox.startTime, buffEndTime)) {
          setCurrentEventBox({});
          return;
        }
        setIsCreateSubBooking(true);

        setCurrentEventBox(prev => {
          prev.rateDiv = Math.floor(prev.height / divide) + 1
          prev.height = prev.rateDiv * divide;
          prev.endTime = minutesToTime(timeToMinutes(prev.startTime) + prev.rateDiv * 15);
          prev.studentsLeft = TypeSlot == 3 ? checkTotalStudentLeft(eventBoxs[prev.date], prev.startTime, prev.endTime) : 0;
          prev.studentQuantity = 1
          return { ...prev }
        })

        return;

      }
      setIsDragging(false);
      setIsShrinking(false)
      setCurrentEventBox({});
    }

  }

  const handleMouseDownShrink = (formattedDate, id) => {
    if (eventBoxs[formattedDate][id].author) {
      swtoast.warning({ text: "This Booking was fixed", timer: 1500 });
      return;
    };
    setCurrentEventBox({ ...eventBoxs[formattedDate][id] })
    setIsShrinking(true);


  }

  const handleMoveWeek = (direction) => {
    //0 back 1 forward
    if (direction == 0) {
      const newDate = subDays(firstDayOfWeek, 7);
      const endDate = subDays(endDayOfWeek, 7);
      setFirstDayOfWeek(newDate);
      setEndDayOfWeek(endDate);


    } else if (direction == 1) {
      const newDate = addDays(firstDayOfWeek, 7);
      const endDate = addDays(endDayOfWeek, 7);
      setFirstDayOfWeek(newDate);
      setEndDayOfWeek(endDate);
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

  const handleCancelSubBooking = () => {
    setIsCreateSubBooking(false);
    setCurrentEventBox({})
  }

  const handleSaveSubBooking = () => {
    if (openViewDay) {
      setEventBoxs(prev => {
        const rand = crypto.randomUUID()
        currentEventBoxSub.id = rand
        currentEventBoxSub.isBooking = true
        if (!prev[currentEventBoxSub.date]) {
          prev[currentEventBoxSub.date] = {};
        }
        prev[currentEventBoxSub.date][rand] = { ...currentEventBoxSub };
        handleUpdatePosition(prev[currentEventBoxSub.date])
        setSubBookingCart(prevSub => {
          if (!prevSub[currentEventBoxSub.date]) {
            prevSub[currentEventBoxSub.date] = {};
          }
          prevSub[currentEventBoxSub.date][rand] = { ...prev[currentEventBoxSub.date][rand] }
          return { ...prevSub };
        })
        return { ...prev }
      })

      setIsCreateSubBooking(false);
      setCurrentEventBoxSub({})
      return;
    }

    setEventBoxs(prev => {
      console.log("current boook ; ", currentEventBox)
      if (currentEventBox.id) {
        prev[currentEventBox.date][currentEventBox.id] = { ...currentEventBox }
        handleUpdatePosition(prev[currentEventBox.date])
        setSubBookingCart(prevSub => {
          prevSub[currentEventBox.date][currentEventBox.id] = { ...prev[currentEventBox.date][currentEventBox.id] }
          return { ...prevSub };
        })
        return { ...prev };
      }
      if (!prev[currentEventBox.date]) {
        prev[currentEventBox.date] = {};
      }
      const rand = crypto.randomUUID()
      currentEventBox.id = rand
      currentEventBox.isBooking = true
      prev[currentEventBox.date][rand] = { ...currentEventBox };
      handleUpdatePosition(prev[currentEventBox.date])
      setSubBookingCart(prevSub => {
        if (!prevSub[currentEventBox.date]) {
          prevSub[currentEventBox.date] = {};
        }
        prevSub[currentEventBox.date][rand] = { ...prev[currentEventBox.date][rand] }
        return { ...prevSub };
      })
      console.log("save : ", prev)
      return { ...prev }
    })
    setIsShowCart(prev => {
      if (!prev) return true;
      return prev;
    })
    setIsCreateSubBooking(false);
    setCurrentEventBox({})
  }

  const checkConditionPrivate = (buffDate, buffStartTime, buffEndTime) => {
    const dateEventBox = eventBoxs[buffDate];
    for (let id in dateEventBox) {
      if (dateEventBox[id].private || (dateEventBox[id].isBooking && id != currentEventBox.id) || dateEventBox[id]?.lectureId == userId) {
        console.log(dateEventBox[id].top + "> " + (currentEventBox.top + currentEventBox.height) + " || " + (dateEventBox[id].top + dateEventBox[id].height) + " < " + currentEventBox.top)
        if (!(dateEventBox[id].startTime >= buffEndTime || dateEventBox[id].endTime <= buffStartTime)) {
          swtoast.warning({ text: dateEventBox[id].private ? "This Booking is private" : "You was Booking this period", timer: 1500 })
          return false;
        }
      }
    }
    return true;
  }

  const checkTotalStudentLeft = (dateSubBooking, startTime, endTime) => {
    if (!dateSubBooking) {
      return room.capacity - 1;
    }
    const subBookingInterval = [];

    for (let id in dateSubBooking) {
      if (!(endTime <= dateSubBooking[id].startTime || startTime >= dateSubBooking[id].endTime)) {
        subBookingInterval.push(dateSubBooking[id]);
      }
    }
    let max = 0;
    for (let i = 0; i < subBookingInterval.length; i++) {
      if (subBookingInterval[i].isBooking) continue;
      const startTimeForChecking = subBookingInterval[i].startTime < startTime ? startTime : subBookingInterval[i].startTime;
      let totalStudents = 0;
      for (let j = 0; j < subBookingInterval.length; j++) {
        if (subBookingInterval[j].isBooking) continue;
        if (startTimeForChecking >= subBookingInterval[j].startTime && startTimeForChecking < subBookingInterval[j].endTime) {
          totalStudents += subBookingInterval[j].studentQuantity;
        }
      }
      max = totalStudents > max ? totalStudents : max;
    }
    return room.capacity - max - 1;


  }


  const handleOpenSubBookingDetail = (dateBooking, id, index) => {
    if (eventBoxs[dateBooking][id].isBooking || !eventBoxs[dateBooking][id].lectureId == userId) {
      setIsCreateSubBooking(true)
      setCurrentEventBox({ ...eventBoxs[dateBooking][id], left: divRefs.current[index].getBoundingClientRect().left });
      return;
    }
    swtoast.warning({ text: "Not avaliable for you" })
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
    for (let i = 0; i < arrayBookings.length; i++) {
      let checkIsolated = true;
      for (let j = 0; j < arrayBookings.length; j++) {
        if (i != j) {
          if (!(SubBookingsInDate[arrayBookings[i].id].startTime > SubBookingsInDate[arrayBookings[j].id].endTime || SubBookingsInDate[arrayBookings[i].id].endTime < SubBookingsInDate[arrayBookings[j].id].startTime)) {
            checkIsolated = false;
            break;
          }

        }
      }
      if (checkIsolated) {
        SubBookingsInDate[arrayBookings[i].id].width = 100;
        SubBookingsInDate[arrayBookings[i].id].left = 0;
      }
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

  const handleDataAtFirst = async (rawData) => {
    var structuredData = {};

    // Duyệt qua từng subBooking trong rawData
    for (const subBooking of rawData) {
      if (!structuredData[subBooking.date]) {
        structuredData[subBooking.date] = {};
      }
      if (subBooking.startTime === "00:00:00" && subBooking.endTime === "23:59:59") {
        subBooking.allday = true;
      }

      // Nếu subBooking có userId (hoặc lectureId tùy theo tên trường), lấy account
      if (subBooking.lectureId) {
        try {
          const account = await getAccountById(subBooking.lectureId);
          subBooking.accountName = account.accountName || "Unknown"; // Thêm accountName vào subBooking
        } catch (error) {
          console.error(`Error fetching account for userId ${userId}:`, error);
          subBooking.accountName = "Error"; // Gán giá trị mặc định nếu lỗi
        }
      }

      structuredData[subBooking.date][subBooking.id] = subBooking;
    }

    console.log("structure : ", structuredData);

    handleRawData(structuredData);
    setEventBoxs((prev) => {
      return { ...prev, ...structuredData };
    });
  };

  const getSubBookingInWeek = async () => {
    if (existedFirstDayWeek.includes(format(firstDayOfWeek, 'yyyy-MM-dd'))) {
      return;
    }
    const formattedStartTime = format(firstDayOfWeek, 'yyyy-MM-dd HH:mm:ss');
    const formattedEndTime = format(endDayOfWeek, 'yyyy-MM-dd HH:mm:ss');
    await apiClient.get('/Booking/SubBookingInWeekOfRoom', {
      params: {
        StartTime: formattedStartTime,
        EndTime: formattedEndTime,
        RoomId: room.id,
        OnlyLecturer: false
      }
    }).then(async (response) => {
      console.log("subBooking : ", response.data);
      await handleDataAtFirst(response.data)
      setExistFirstDayInWeek(prev => {
        prev.push(format(firstDayOfWeek, 'yyyy-MM-dd'))
        return [...prev];
      })
    }).catch((error) => {
      console.log("error : ", error);
    })


  }
  const getAccountById = async (userId) => {
    try {
      const response = await apiClient.get(`/Account(${userId})`);
      return response.data;
    } catch (error) {
      console.error("Error fetching account by ID:", error);
      throw error;
    }
  }
  const getColorAndTitleEvent = (subBooking) => {
    if (subBooking.type == 6) return [typeColors[0], "Reserved"];
    if (subBooking.lectureId && subBooking.lectureId != userId) return [typeColors[1], subBooking.accountName];
    if (subBooking.isBooking) return [typeColors[2], "New Book"];
    if (subBooking.lectureId == userId && subBooking.approve == 0) return [typeColors[3], "Pending"];
    if (subBooking.lectureId == userId && subBooking.approve == 10) return [typeColors[4], subBooking.accountName];

  }

  const handleClickAllDay = (date, i) => {
    if (date <= format(new Date, "yyyy-MM-dd") + "T00:00:00") {
      return;
    }
    if (eventBoxs[date] && Object.keys(eventBoxs[date]).length > 0) {
      swtoast.warning({ text: "This day not available", timer: 1500 })
      return;
    }
    setIsCreateSubBooking(true);
    setCurrentEventBox({ height: 96 * divHeight / 4, width: 100, date: date, top: 0, rateTop: 0, rateDiv: 96, left: 0, startTime: "00:00:00", endTime: "23:59:59", index: i });
  }

  const handleRemoveSubBooking = (date, id) => {
    setEventBoxs(prev => {

      delete prev[date][id];
      handleUpdatePosition(prev[date])
      if (Object.keys(prev[date]).length == 0) {
        delete prev[date]
      }

      return { ...prev }
    })
    setSubBookingCart(prev => {
      delete prev[date][id];
      if (Object.keys(prev[date]).length == 0) {
        delete prev[date]
      }
      return prev;
    })


  }

  const handleOpenSubBookingDetailIOneDay = (left, bookDetail) => {
    setLeftPositionSubBooking(left);
    setIsCreateSubBooking(true);
    handleHeightPosition(bookDetail)
    setCurrentEventBoxSub(bookDetail)
  }

  useEffect(() => {
    handleTriggerTimeLine();
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
  }, []);

  const handleSwitchDayView = (element) => {
    const date = format(element, "yyyy-MM-dd") + "T00:00:00";
    if (date < format(new Date(), "yyyy-MM-dd") + "T00:00:00") {
      swtoast.warning({ text: "please choose another day", timer: 1500 });
      return;
    }
    eventBoxs[date] = eventBoxs[date] ?? {};
    setDataForDay(eventBoxs[date]);
    setDate(date);
    setOpenViewDay(true);
  }

  const handleChangeView = useCallback(() => {
    setDataForDay(null)
    setOpenViewDay(false)
  }, [])

  const handleSetCurrentEvent = useCallback((subBooking) => {
    setCurrentEventBox(subBooking)
  }, [])

  const getDescriptionCategory = async () => {
    await apiClient.get('/Booking/CategoryDescription')
      .then((response) => {
        console.log("category description : ", response.data);
        setCategoryDescription(response.data)
      })
      .catch((error) => {
        console.log(error)
      })

  }

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

  const handleShowCart = () => {
    setIsShowCart(prev => {
      var bool = !prev;
      return bool;
    })
  }

  useEffect(() => {
    const startMinutes = timeToMinutes(format(new Date(), "HH:mm:") + "00");
    const focusPosition = Math.round(startMinutes / 15) * divHeight / 4;
    overflowDivRef.current.scrollTo({
      top: focusPosition - 50,
      behavior: "smooth",
    });
  }, [])

  useEffect(() => {
    getDescriptionCategory();
  }, [])

  return (
    <div className="bg-cover bg-center backdrop-blur-sm " >

      <div className=" flex space-x-2 ">

        {!openViewDay ? (
          <motion.div ref={calanderRefs} animate={{ width: isShowCart ? "70%" : "100%" }} transition={{ duration: 0.5, ease: "easeInOut" }} className="rounded-3xl p-4 bg-white/50 backdrop-blur-md min-w-[500px] h-[650px] border-2 border-gray-300 p-6 bg-white/95 shadow-2xl">
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
              <div className="flex space-x-2 ">
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                    </svg>

                  </div>
                  <div onClick={() => { setIsShowCart(prev => !prev) }} className="font-mono p-2 hover:bg-gray-300 rounded-r-xl cursor-pointer ">cart</div>
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
                                handleClickAllDay(formattedDate, i);
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
                          <div
                            ref={labelTimeLineRef}
                            className="absolute z-10 pr-[8px] right-[-6px] text-right"
                          >
                            <span className="relative block text-base font-mono bg-[#62dbb1]  rounded-md -translate-y-1/2">
                              {format(new Date(), "HH:mm")}
                            </span>
                          </div>
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
                        onMouseMove={() => {
                          handleMouseMove(event);
                        }}
                        className="flex flex-1 relative"
                      >
                        <div area-hidden="true" className="">
                          <div ref={timeLineRef} className="absolute w-full z-30 after:absolute after:w-full after:border-b-[1px] after:border-[#33D29C]"></div>
                          {TypeSlot == 3 ? (
                            Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i + "line-separate"}
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
                          const formattedDate = format(date, "yyyy-MM-dd") + "T00:00:00";
                          const events = eventBoxs?.[formattedDate];

                          return (

                            <div
                              onMouseDown={(event) =>
                                handleMouseDown(event, date, i)
                              }
                              key={formattedDate}
                              style={{ height: divHeight * 24 }}
                              className="relative flex flex-1 pr-[8px] border-l-[1px] border-gray-300"
                            >

                              {format(new Date(), "yyyy-MM-dd") + "T00:00:00" == formattedDate ? <div ref={currentTimeLineRef} className="absolute left-0 right-0 h-1 border-x-[6px] border-t-[6px] border-[#019e67]"> </div> : null}



                              {currentEventBox.date === formattedDate &&
                                (isDragging ||
                                  isShrinking ||
                                  isCreateSubBooking) && (
                                  <div
                                    onMouseUp={handleMouseUp}
                                    className="absolute top-0 bottom-0 left-0 right-0"
                                  >
                                    <EventBox
                                      key="abcxyznmas"
                                      isBuffer={true}
                                      height={
                                        isDragging || isShrinking
                                          ? currentEventBox.height
                                          : (currentEventBox.rateDiv *
                                            divHeight) /
                                          4
                                      }
                                      colorAndTitle={["bg-[#33D29C]", ""]}
                                      top={
                                        (currentEventBox.rateTop *
                                          divHeight) /
                                        4
                                      }
                                    />
                                  </div>
                                )}

                              <div
                                onMouseUp={handleMouseUp}
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
                                          handleMouseDownShrink
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

          </motion.div>
        ) : (
          <OneDayBooking
            dateDay={dataForDay}
            handleChangeView={handleChangeView}
            day={date}
            room={room}
            handleOpenSubBookingDetailIOneDay={handleOpenSubBookingDetailIOneDay}
            handleSetCurrentEvent={handleSetCurrentEvent}
            typeSlot={TypeSlot}
            size={dimensions}
          />
        )}
        <AnimatePresence>
          {isShowCart && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-1 border-2 border-gray-300 rounded-3xl p-6 bg-white/95 shadow-2xl h-[650px]"
            >
              <CartBooking
                handleRemoveSubBooking={handleRemoveSubBooking}
                subBookingCart={subBookingCart}
                overflowDivRef={overflowDivRef}
                setFirstDayOfWeek={setFirstDayOfWeek}
                setEndDayOfWeek={setEndDayOfWeek}
                setIsCreateSubBooking={setIsCreateSubBooking}
                setCurrentEventBox={setCurrentEventBox}
                roomId={room.id}
                openViewDay={openViewDay}
                handleShowCart={handleShowCart}
                CategoryDescription={CategoryDescription}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isShowMonthModal ? (
          <MonthBox
            handleClickMonth={handleClickMonth}
            handleCloseMonth={setIsShowMonthModal}
          />
        ) : null}
        {isCreateSubBooking ? (
          <div
            onClick={handleCancelSubBooking}
            className="fixed inset-0 z-50 flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full "
          >
            <SubBookingDetail
              left={
                openViewDay ? leftPositionSubBooking :
                  divRefs.current[currentEventBox.index].getBoundingClientRect()
                    .left + 100
              }
              subBooking={openViewDay ? currentEventBoxSub : currentEventBox}
              handleCancelSubBooking={handleCancelSubBooking}
              handleSaveSubBooking={handleSaveSubBooking}
              checkTotalStudentLeft={checkTotalStudentLeft}
              checkConditionPrivate={checkConditionPrivate}
              CategoryDescription={CategoryDescription}
              typeSlot={openViewDay ? currentEventBoxSub.typeSlot ?? 3 : currentEventBox.typeSlot}
              handleHeightPosition={handleHeightPosition}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};


const EventBox = ({ id, dateBooking, height, top, colorAndTitle, isBuffer, isShrinking, handleMouseDownShrink, startTime, endTime, width, left, handleOpenSubBookingDetail, index }) => {
  console.log("all day :", startTime, endTime)
  return (
    <div style={{ top: top, height: height, width: width + "%", left: left + "%" }} tabIndex={0} className={`w-full border-[1px] border-white absolute rounded-lg ${colorAndTitle[0]} ${isShrinking ? 'opacity-50' : ''} cursor-pointer`}>
      {isBuffer ? (null) : (<div onClick={(e) => {
        handleOpenSubBookingDetail(dateBooking, id, index);
        e.stopPropagation();
      }} className="pl-4 select-none" title={`${colorAndTitle[1]} ${startTime.slice(0, 5) + "-" + endTime.slice(0, 5)}`}>
        <div className={`font-bold text-base text-white font-mono text-wrap overflow-hidden text-ellipsis `}>{colorAndTitle[1]}</div>
        <div className={`font-mono text-xs text-white whitespace-normal text-wrap text-ellipsis overflow-hidden `}>{startTime.slice(0, 5) + "-" + endTime.slice(0, 5)}</div>
      </div>)
      }
      <div onMouseDown={(e) => {
        handleMouseDownShrink(dateBooking, id);
        e.stopPropagation();

      }} className="absolute z-50 bottom-0 left-0 right-0 h-[50%] max-h-[8px] cursor-n-resize"></div>

    </div >
  )
}

const MonthBox = ({ handleClickMonth, handleCloseMonth }) => {

  return createPortal(
    <div
      onClick={() => handleCloseMonth(false)}
      id="default-modal"
      tabindex="-1"
      aria-hidden="true"
      class="overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed inset-0 z-30 justify-center flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full"
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
    </div>, document.body
  )
}

export default BookLabCalendar;