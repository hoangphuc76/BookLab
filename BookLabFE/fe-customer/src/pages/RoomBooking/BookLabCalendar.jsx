import { startOfWeek, endOfWeek, format, eachDayOfInterval, addDays, getDay, startOfMonth, subDays, setMonth, addMinutes, differenceInMinutes, parseISO, getHours, getMinutes } from "date-fns";
import {
  LeftChevronArrowIcon,
  RightChevronArrowIcon,
  DownChevronArrowIcon,
  CalendarIcon,
  FilterIcon,
} from "../../icons";
import { motion, AnimatePresence } from "framer-motion";
import OneDayBooking from "../../components/OneDayBooking"
import { useState, useRef, useEffect, useCallback } from "react";
import CartBooking from "./CartBooking";
import apiClient from "../../services/ApiClient";
import { timeToMinutes, minutesToTime } from "../../utils/dateUtils";
import SubBookingDetail from "../../components/SubBookingDetail";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { swtoast } from "../../utils/swal";

// Modern Notification Popup Component
const NotificationPopup = ({ isOpen, onClose, type = 'warning', title, message, autoCloseTime = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoCloseTime > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  if (!isOpen) return null;

  // Define styles based on type
  const styles = {
    warning: {
      bg: 'from-amber-50 to-amber-100',
      border: 'border-amber-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-amber-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      textTitle: 'text-amber-700',
      textBody: 'text-amber-600'
    },
    error: {
      bg: 'from-rose-50 to-rose-100',
      border: 'border-rose-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-rose-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      textTitle: 'text-rose-700',
      textBody: 'text-rose-600'
    },
    success: {
      bg: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      textTitle: 'text-emerald-700',
      textBody: 'text-emerald-600'
    },
    info: {
      bg: 'from-sky-50 to-sky-100',
      border: 'border-sky-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-sky-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
      textTitle: 'text-sky-700',
      textBody: 'text-sky-600'
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end justify-center sm:items-start z-[100] pointer-events-none p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.25 }}
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
      >
        <div className={`rounded-lg shadow-lg overflow-hidden flex`}>
          {/* Color icon section */}
          <div className={`w-2 bg-gradient-to-b ${styles[type].bg}`}></div>

          {/* Content section */}
          <div className={`p-4 bg-white flex-1 flex`}>
            <div className="flex-shrink-0 mr-3">
              <div className={`w-10 h-10 rounded-full bg-${styles[type].bg} flex items-center justify-center`}>
                {styles[type].icon}
              </div>
            </div>

            <div className="flex-1 pt-0.5">
              <h3 className={`text-sm font-medium ${styles[type].textTitle}`}>
                {title || (type.charAt(0).toUpperCase() + type.slice(1))}
              </h3>
              <div className={`mt-1 text-sm ${styles[type].textBody}`}>
                {message}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={onClose}
                className="ml-4 inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// Keep original variable names
const typeColors = {
  0: 'bg-[#d91313]',  // belong to admin
  1: 'bg-[#7b7878]',  // belong to other
  2: 'bg-[#33D29C]',  // new subbooking   
  3: 'bg-[#FFC107]',  // belong to user, not confirm
  4: 'bg-[#28A745]',  // belong to user, confirmed
  5: 'background_stripe_1', // bảo trì
  6: 'background_stripe_2'  // khóa phòng
};

const typeSlots = {
  1: "Old Slot",
  2: "New Slot",
  3: "Out Slot" // Changed from "Out Slot" to "Custom Slot" for clarity
};

const newSlots = [[0, 7, 9.25, 9.5, 11.75, 12.5, 14.75, 15, 17.25], ["00:00", "07:00", "09:15", "09:30", "11:45", "12:30", "14:45", "15:00", "17:15"]];
const oldSlots = [[0, 7, 8.5, 8.75, 10.25, 10.5, 12, 12.5, 14, 14.25, 15.75, 16, 17.5], ["00:00", "07:00", "08:30", "08:45", "10:15", "10:30", "12:00", "12:30", "14:00", "14:15", "15:45", "16:00", "17:30"]];

const BookLabCalendar = ({ room }) => {
  // Add notification state
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    autoCloseTime: 3000
  });

  // Function to show notifications
  const showNotification = (type, message, title = '', autoCloseTime = 3000) => {
    setNotification({
      isOpen: true,
      type,
      title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
      message,
      autoCloseTime
    });
  };

  // Function to close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const divRefs = useRef([]);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [endDayOfWeek, setEndDayOfWeek] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isDragging, setIsDragging] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);
  const [eventBoxs, setEventBoxs] = useState({});
  const [subBookingCart, setSubBookingCart] = useState({});
  const [leftPositionSubBooking, setLeftPositionSubBooking] = useState(null);
  const overflowDivRef = useRef(null);
  const { userId } = useSelector((state) => state.profile);
  const [openViewDay, setOpenViewDay] = useState(false);
  const [dataForDay, setDataForDay] = useState({});
  const [date, setDate] = useState(null);
  const [currentEventBox, setCurrentEventBox] = useState({ height: 0, top: 0 });
  const [currentEventBoxSub, setCurrentEventBoxSub] = useState({});
  const [isShowMonthModal, setIsShowMonthModal] = useState(false);
  const [isCreateSubBooking, setIsCreateSubBooking] = useState(false);
  const [divHeight, setDivHeight] = useState(48);
  const [CategoryDescription, setCategoryDescription] = useState();
  const [TypeSlot, setTypeSlot] = useState(3);
  const [isShowTypeSlotSelection, setIsShowTypeSlotSelection] = useState(false);
  const [slotTimes, setSlotTimes] = useState(null);
  const [existedFirstDayWeek, setExistFirstDayInWeek] = useState([]);
  const [isShowCart, setIsShowCart] = useState(false);
  const timeLineRef = useRef();
  const currentTimeLineRef = useRef({});
  const labelTimeLineRef = useRef();
  const calanderRefs = useRef(null);
  const [dimensions, setDimensions] = useState({ height: 0, width: 0 });
  const [showDragTip, setShowDragTip] = useState(false);
  console.log("envet : ", currentEventBox)

  // Keep original useEffect implementations
  useEffect(() => {
    if (calanderRefs.current) {
      const { clientHeight, clientWidth } = calanderRefs.current;
      setDimensions((prev) => ({
        ...prev,
        height: 750,
        width: isShowCart ? 70 : 100,
      }));
    } else {
      setDimensions((prev) => ({
        ...prev,
        width: isShowCart ? 70 : 100,
      }));
    }
  }, [isShowCart]);

  const handleTriggerTimeLine = () => {
    const startMinutes = timeToMinutes(format(new Date(), "HH:mm:") + "00");
    const buff = Math.round(startMinutes / 15 * divHeight / 4) + "px";
    timeLineRef.current.style.top = buff;
    labelTimeLineRef.current.style.top = buff;
    if (currentTimeLineRef.current) {
      currentTimeLineRef.current.style.top = buff;
    }
  }

  // Keep all original function implementations
  const handleMouseDown = (e, date, i) => {
    e.preventDefault(); // Prevent browser context menu during drag
    handleTriggerTimeLine();
    if (TypeSlot != 3) {
      return;
    }
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
      showNotification('warning', "Please book at least 30 minutes from now", "Booking Time Error");
      return;
    }

    // Initialize with a minimum height for better visibility
    setCurrentEventBox({
      height: divide * 2, // Start with 30 min height for better visibility
      top: y,
      lecturerId: userId,
      left: parentDiv.left,
      width: parentDiv.width,
      date: formattedDate,
      rateTop: rateTop,
      startTime: startTime,
      endTime: minutesToTime(rateTop * 15 + 30), // Add initial 30 min
      index: i,
      typeSlot: TypeSlot
    });

    setIsDragging(true);
  }

  // Update handleMouseMove for smoother drag experience
  const handleMouseMove = (e) => {
    if (isDragging || isShrinking) {
      e.preventDefault(); // Prevent selection and context menu
      const parentDiv = divRefs.current[0].getBoundingClientRect();
      const y = e.clientY - parentDiv.top;

      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setCurrentEventBox(prev => {
          // Reduce sensitivity threshold for more responsive dragging
          if (Math.abs(y - (prev.top + prev.height)) > 1) {
            const newHeight = Math.max(y - prev.top, divHeight / 4); // Minimum height of 15 minutes
            const divide = divHeight / 4;
            const rateDiv = Math.max(Math.ceil(newHeight / divide), 1);
            const endTime = minutesToTime(timeToMinutes(prev.startTime) + rateDiv * 15);

            return {
              ...prev,
              height: newHeight,
              rateDiv: rateDiv,
              endTime: endTime
            };
          }
          return prev;
        });
      });
    }
  }

  const handleMouseUp = (e) => {
    console.log("handle Up : ", currentEventBox)
    if (e) e.preventDefault(); // Prevent context menu
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
          const totalStudentAndGroup = checkTotalStudentLeft(eventBoxs[prev.date], prev.startTime, prev.endTime)
          prev.rateDiv = Math.floor(prev.height / divide) + 1
          prev.height = prev.rateDiv * divide;
          prev.endTime = minutesToTime(timeToMinutes(prev.startTime) + prev.rateDiv * 15);
          prev.studentsLeft = TypeSlot == 3 ? totalStudentAndGroup.studentsLeft : 0;
          prev.groupsLeft = TypeSlot == 3 ? totalStudentAndGroup.groupsLeft : 0;
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
    if (eventBoxs[formattedDate][id].lectureId && eventBoxs[formattedDate][id].approve && eventBoxs[formattedDate][id].lectureId != userId) {
      showNotification('warning', "This booking has been approved and cannot be modified", "Fixed Booking");
      return;
    };

    if (eventBoxs[formattedDate][id].typeSlot != 3) {
      showNotification('warning', "This slot type cannot be modified", "Slot Type Restricted");
      return;
    }
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
      return { ...prev }
    })
    setIsShowCart(prev => {
      if (!prev) return true;
      return prev;
    })
    setIsCreateSubBooking(false);
    setCurrentEventBox({})
  }

  // Keep all original implementation functions
  const checkConditionPrivate = (buffDate, buffStartTime, buffEndTime) => {
    const dateEventBox = eventBoxs[buffDate];
    for (let id in dateEventBox) {
      if (!(dateEventBox[id].startTime >= buffEndTime || dateEventBox[id].endTime <= buffStartTime)) {
        if (dateEventBox[id].approve == 7) {
          showNotification('warning', "This time slot is reserved for maintenance and cannot be booked", "Maintenance Time");
          return false;
        }
        if (dateEventBox[id].approve == 8) {
          showNotification('warning', "This time slot has been locked by the administrator", "Locked Time Slot");
          return false;
        }
        if (dateEventBox[id].private) {
          showNotification('warning', "This time slot has a private booking that cannot be modified", "Private Booking");
          return false;
        }
        if (currentEventBox.rateDiv != null && ((dateEventBox[id].isBooking && id != currentEventBox.id) || dateEventBox[id]?.lectureId == userId)) {
          showNotification('warning', "You already have a booking during this time period", "Duplicate Booking");
          return false;
        }
      }
    }
    return true;
  }

  const checkTotalStudentLeft = (dateSubBooking, startTime, endTime) => {
    if (!dateSubBooking) {
      return { studentsLeft: room.capacity - 1, groupsLeft: room.groupSize };
    }
    const subBookingInterval = [];

    for (let id in dateSubBooking) {
      if (!(endTime <= dateSubBooking[id].startTime || startTime >= dateSubBooking[id].endTime)) {
        subBookingInterval.push(dateSubBooking[id]);
      }
    }
    let maxStudent = 0;
    let maxGroup = 0;
    for (let i = 0; i < subBookingInterval.length; i++) {
      if (subBookingInterval[i].isBooking) continue;
      const startTimeForChecking = subBookingInterval[i].startTime < startTime ? startTime : subBookingInterval[i].startTime;
      let totalStudents = 0;
      let totalGroups = 0;
      for (let j = 0; j < subBookingInterval.length; j++) {
        if (subBookingInterval[j].isBooking) continue;
        if (startTimeForChecking >= subBookingInterval[j].startTime && startTimeForChecking < subBookingInterval[j].endTime) {
          totalStudents += subBookingInterval[j].studentQuantity;
          totalGroups += subBookingInterval[j].groupQuantity;
        }
      }
      maxStudent = totalStudents > maxStudent ? totalStudents : maxStudent;
      maxGroup = totalGroups > maxGroup ? totalGroups : maxGroup;
    }
    return { studentsLeft: room.capacity - maxStudent - 1, groupsLeft: room.groupSize - maxGroup };
  }

  const handleOpenSubBookingDetail = (dateBooking, id, index) => {
    console.log("open popup")
    if (eventBoxs[dateBooking][id].isBooking || !eventBoxs[dateBooking][id].lectureId == userId) {
      setIsCreateSubBooking(true)
      setCurrentEventBox({ ...eventBoxs[dateBooking][id], left: divRefs.current[index].getBoundingClientRect().left });
      return;
    }
    showNotification('warning', "You don't have permission to modify this booking", "Access Denied");
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

      structuredData[subBooking.date][subBooking.id] = subBooking;
    }
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
      await handleDataAtFirst(response.data)
      setExistFirstDayInWeek(prev => {
        prev.push(format(firstDayOfWeek, 'yyyy-MM-dd'))
        return [...prev];
      })
    }).catch((error) => {
      swtoast.error({ text: "Something went wrong", timer: 3000 })
    })
  }

  const getColorAndTitleEvent = (subBooking) => {
    if (subBooking.approve == 7) return [typeColors[5], "Maintenance"]
    if (subBooking.approve == 8) return [typeColors[6], "Locked"]
    if (subBooking.type == 6) return [typeColors[0], "Reserved"];
    if (subBooking.lectureId && subBooking.lectureId != userId) return [typeColors[1], subBooking.lectureCode != "" ? subBooking.lectureCode : "Unknown"];
    if (subBooking.isBooking) return [typeColors[2], "New Book"];
    if (subBooking.lectureId == userId && subBooking.approve == 0) return [typeColors[3], "Pending"];
    if (subBooking.lectureId == userId && subBooking.approve == 10) return [typeColors[4], subBooking.lectureCode];
  }

  const handleClickAllDay = (date, i) => {
    if (date <= format(new Date, "yyyy-MM-dd") + "T00:00:00") {
      return;
    }
    if (eventBoxs[date] && Object.keys(eventBoxs[date]).length > 0) {
      showNotification('warning', "This day already has bookings and is not available for all-day booking", "Day Not Available");
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
      return { ...prev }
    })
  }

  const handleOpenSubBookingDetailIOneDay = (left, bookDetail) => {
    setLeftPositionSubBooking(left);
    setIsCreateSubBooking(true);
    handleHeightPosition(bookDetail)
    setCurrentEventBoxSub(bookDetail)
  }

  // Keep original useEffect hooks
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
      showNotification('warning', "You cannot view past days, please choose a current or future date", "Invalid Date Selection");
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
    setIsShowCart(prev => !prev)
  }

  const handleClickSlot = (e, date, i, height, top, indexSlot) => {
    handleTriggerTimeLine();
    if (TypeSlot == 3) {
      return;
    }
    if (isCreateSubBooking) {
      setCurrentEventBox({});
      setIsCreateSubBooking(false);
      return;
    }
    const formattedDate = format(date, "yyyy-MM-dd") + "T00:00:00";
    const parentDiv = divRefs.current[i].getBoundingClientRect();
    const divide = divHeight / 4;
    const rateTop = Math.floor(top / divide);

    const startTime = minutesToTime(rateTop * 15)
    const currentDate = format(new Date(), "yyyy-MM-dd") + "T00:00:00";
    const currentTime = minutesToTime(timeToMinutes(format(new Date(), "HH:mm:") + "00") + 30)
    if (formattedDate < currentDate || (formattedDate == currentDate && startTime < currentTime)) {
      setCurrentEventBox({});
      setIsCreateSubBooking(false);
      showNotification('warning', "Please book at least 30 minutes from current time", "Booking Time Error");
      return;
    }
    const rateDiv = Math.floor(height / divide)
    const endTime = minutesToTime(timeToMinutes(startTime) + rateDiv * 15);

    setCurrentEventBox({ height: height, top: top, lecturerId: userId, left: parentDiv.left, width: parentDiv.width, date: formattedDate, rateTop: rateTop, rateDiv: rateDiv, startTime: startTime, endTime: endTime, index: i, typeSlot: TypeSlot, indexSlot: indexSlot });
    setIsCreateSubBooking(true);
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

  useEffect(() => {
    if (TypeSlot === 3) {
      setShowDragTip(true);
      // No immediate timeout to hide - we'll use CSS transitions instead
    } else {
      setShowDragTip(false);
    }
  }, [TypeSlot]);

  // Add this function to handle the auto-hide with animation
  const handleDragTipAutoHide = () => {
    const dragTipElement = document.getElementById('drag-tip');
    if (dragTipElement) {
      // First fade out
      dragTipElement.classList.add('opacity-0');
      // Then hide after transition completes
      setTimeout(() => {
        setShowDragTip(false);
      }, 300); // Match this to your transition duration
    }
  };

  // Add a useEffect to handle the automatic hiding after 3 seconds
  useEffect(() => {
    if (showDragTip) {
      const timer = setTimeout(() => {
        handleDragTipAutoHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDragTip]);

  return (
    <div className="bg-cover bg-center backdrop-blur-sm">
      {/* Add notification component */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoCloseTime={notification.autoCloseTime}
      />

      <div className="flex space-x-2">
        {!openViewDay ? (
          <motion.div
            ref={calanderRefs}
            animate={{ width: isShowCart ? "70%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="rounded-3xl bg-white/50 min-w-[500px] h-[750px] border border-gray-300 shadow-lg overflow-hidden"
          >
            {/* Calendar Header - Improved UI with higher z-index */}
            <div id="calendar-header" className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white/70 backdrop-blur-sm z-[1000] relative">
              {/* Left side controls with consistent heights */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClickToday}
                  className="flex items-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Today
                </button>

                <button
                  onClick={() => setIsShowMonthModal(true)}
                  className="flex items-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-2">{format(firstDayOfWeek, "MMMM yyyy")}</span>
                  <DownChevronArrowIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Right side controls with consistent heights */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center h-10 bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <span className="flex items-center h-full px-3 text-sm font-medium text-gray-700 border-r border-gray-300">
                    Week
                  </span>
                  <button
                    onClick={() => handleMoveWeek(0)}
                    className="flex items-center justify-center h-10 w-10 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <LeftChevronArrowIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveWeek(1)}
                    className="flex items-center justify-center h-10 w-10 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <RightChevronArrowIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-[1010]">
                  <button
                    onClick={handleClickTypeSlot}
                    className={`flex items-center h-10 px-4 text-sm font-medium ${TypeSlot === 3
                      ? 'text-indigo-700 bg-indigo-50 border border-indigo-300'
                      : 'text-gray-700 bg-white border border-gray-300'
                      } rounded-lg hover:bg-gray-100 transition-colors`}
                  >
                    <FilterIcon className="w-4 h-4 mr-2" />
                    <span>{typeSlots[TypeSlot]}</span>
                    {TypeSlot === 3 && (
                      <span className="ml-2 text-xs text-indigo-600">
                        (Drag to select)
                      </span>
                    )}
                  </button>

                  {isShowTypeSlotSelection && (
                    <div className="absolute right-0 mt-2 z-[1020]">
                      <div className="w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        {Object.keys(typeSlots).map((slotKey) => (
                          <button
                            key={slotKey}
                            onClick={() => handleChangeTypeSlot(parseInt(slotKey))}
                            className={`w-full text-left px-4 py-2 text-sm ${parseInt(slotKey) === TypeSlot
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-100'
                              } transition-colors flex justify-between items-center`}
                          >
                            <span>{typeSlots[slotKey]}</span>
                            {parseInt(slotKey) === 3 && (
                              <span className="text-xs text-indigo-500">Custom time</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsShowCart(prev => !prev)}
                  className="flex items-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>
                  Booking Cart
                </button>
              </div>
            </div>


            {/* Show drag tip when TypeSlot is 3 */}
            {showDragTip && TypeSlot === 3 && (
              <motion.div
                id="drag-tip"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center transition-opacity duration-300 ease-in-out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-medium">Click and drag to select custom time range</span>
                  <span className="text-xs text-indigo-100 mt-1">Drag vertically to adjust duration</span>
                </div>
                <button onClick={handleDragTipAutoHide} className="ml-4 hover:bg-indigo-700 p-1 rounded transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Calendar Body */}
            <div id="calendar-body" className=" h-[calc(100%-70px)]">
              <div className="h-full flex flex-col">
                {/* Days of Week Header */}
                <div id="day-in-week" className="flex bg-gray-50 border-b border-gray-200">
                  <div className="w-[60px] p-3 text-xs font-medium text-gray-500">
                    UTC +7
                  </div>
                  <div className="flex flex-1">
                    {eachDayOfInterval({
                      start: firstDayOfWeek,
                      end: endDayOfWeek,
                    }).map((element, i) => (
                      <button
                        key={i}
                        onClick={() => handleSwitchDayView(element)}
                        className="flex-1 p-3 text-center hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-700">
                          {format(element, "EEE")} {format(element, "dd")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Day Row */}
                <div id="all-day" className="flex border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-center min-w-[60px] px-2 text-xs font-medium text-gray-500">
                    All day
                  </div>
                  <div className="flex flex-1">
                    {eachDayOfInterval({
                      start: firstDayOfWeek,
                      end: endDayOfWeek,
                    }).map((date, i) => {
                      const formattedDate = format(date, "yyyy-MM-dd") + "T00:00:00";
                      const events = eventBoxs?.[formattedDate];
                      const id = events && Object.keys(events).length > 0 ? Object.keys(events)[0] : null;

                      return (
                        <div
                          onClick={() => handleClickAllDay(formattedDate, i)}
                          className="flex-1 h-10 border-l border-gray-200 hover:bg-gray-50 transition-colors"
                          key={i}
                        >
                          {id && events[id]?.allday && (
                            <div className={`h-full w-full ${getColorAndTitleEvent(events[id])[0]} rounded-md`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Grid */}
                <div
                  id="week-detail"
                  ref={overflowDivRef}
                  className="flex flex-1 overflow-auto relative"
                >
                  {/* Time Labels */}
                  <div className="flex items-start min-w-[60px] bg-gray-50 border-r border-gray-200">
                    <div className="relative w-full">
                      <div
                        ref={labelTimeLineRef}
                        className="absolute z-10 pr-2 right-0 text-right"
                      >
                        <span className="block text-xs font-medium bg-[#62dbb1] px-2 py-1 rounded text-white -translate-y-1/2">
                          {format(new Date(), "HH:mm")}
                        </span>
                      </div>

                      {TypeSlot == 3 ? (
                        Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            style={{ height: divHeight }}
                            className="relative pr-2 text-right"
                          >
                            <span className="block text-xs font-medium text-gray-500 -translate-y-1/2">
                              {i == 0 ? null : `${i}:00`}
                            </span>
                          </div>
                        ))
                      ) : (
                        Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                          <div
                            key={i}
                            style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                            className={`relative pr-2 ${i % 2 == 1
                              ? "flex justify-center items-center rounded-lg bg-[#33D29C]"
                              : ""
                              }`}
                          >
                            {i % 2 == 1 && (
                              <div className="text-xs font-medium text-white">
                                slot {Math.floor(i / 2) + 1}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div
                    onMouseMove={(event) => handleMouseMove(event)}
                    className="flex flex-1 relative"
                  >
                    {/* Time Grid Lines */}
                    <div area-hidden="true">
                      <div
                        ref={timeLineRef}
                        className="absolute w-full z-30 after:absolute after:w-full after:border-b-2 after:border-[#33D29C]">
                      </div>

                      {TypeSlot == 3 ? (
                        Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i + "line-separate"}
                            style={{ height: divHeight }}
                            className="min-h-10 after:absolute after:w-full after:border-b after:border-gray-200"
                          ></div>
                        ))
                      ) : (
                        Array.from({ length: slotTimes[0].length - 1 }).map((_, i) => (
                          <div
                            key={i + "fd"}
                            style={{ height: (slotTimes[0][i + 1] - slotTimes[0][i]) * divHeight }}
                            className="min-h-2 after:absolute after:w-full after:border-t after:border-gray-200"
                          ></div>
                        ))
                      )}
                    </div>

                    {/* Day Columns */}
                    {eachDayOfInterval({
                      start: firstDayOfWeek,
                      end: endDayOfWeek,
                    }).map((date, i) => {
                      const formattedDate = format(date, "yyyy-MM-dd") + "T00:00:00";
                      const events = eventBoxs?.[formattedDate];
                      const isToday = format(new Date(), "yyyy-MM-dd") + "T00:00:00" === formattedDate;
                      const isPastDate = formattedDate < (format(new Date(), "yyyy-MM-dd") + "T00:00:00");

                      return (
                        <div
                          onMouseDown={(event) => handleMouseDown(event, date, i)}
                          key={formattedDate}
                          style={{ height: divHeight * 24 }}
                          className={`relative flex-1 border-l border-gray-200 ${isPastDate
                            ? 'bg-gray-50/50'
                            : TypeSlot === 3
                              ? 'hover:bg-indigo-50/70 hover:backdrop-blur-sm transition-colors cursor-ns-resize'
                              : 'hover:bg-gray-50/30'
                            }`}
                        >
                          {/* Current time indicator */}
                          {isToday && (
                            <div ref={currentTimeLineRef} className="absolute left-0 right-0 h-0.5 bg-[#019e67] z-10"></div>
                          )}

                          {/* Slot indicators for non-custom slots */}
                          {TypeSlot !== 3 && (
                            Array.from(
                              { length: Math.floor((slotTimes[0].length - 2) / 2) + 1 },
                              (_, idx) => idx * 2 + 1
                            ).map((index) => {
                              let buffHeight = (slotTimes[0][index + 1] - slotTimes[0][index]) * divHeight;
                              let buffTop = slotTimes[0][index] * divHeight;
                              return (
                                <div
                                  onClick={(event) => handleClickSlot(event, date, i, buffHeight, buffTop, Math.floor(index / 2))}
                                  key={index}
                                  style={{
                                    height: buffHeight,
                                    top: buffTop,
                                  }}
                                  className="absolute w-full border border-white z-10 rounded-lg opacity-50 transition-colors duration-200 hover:bg-[#33D29C]"
                                ></div>
                              );
                            })
                          )}

                          {/* Custom Slot visual hint */}
                          {TypeSlot === 3 && !isPastDate && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
                              <div className={`text-indigo-300 text-opacity-0 ${isToday ? 'mt-20' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 opacity-10">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 5.25-2.25h13.5A2.25 2.25 0 0 0 21 6.75v11.25A2.25 2.25 0 0 1 18.75 18H4.75A2.25 2.25 0 0 1 3 18.75z" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Current dragging event */}
                          {currentEventBox.date === formattedDate && (isDragging || isShrinking || isCreateSubBooking) && (
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
                                    : (currentEventBox.rateDiv * divHeight) / 4
                                }
                                colorAndTitle={["bg-[#33D29C]", ""]}
                                top={(currentEventBox.rateTop * divHeight) / 4}
                                isDragging={isDragging}
                              />
                            </div>
                          )}

                          {/* Events for this day */}
                          <div
                            onMouseUp={handleMouseUp}
                            ref={(el) => (divRefs.current[i] = el)}
                            className="relative w-full h-full"
                          >
                            {events &&
                              Object.keys(events).map((id) => (
                                <EventBox
                                  key={id}
                                  id={id}
                                  dateBooking={events[id].date}
                                  height={(events[id]?.rateDiv * divHeight) / 4}
                                  top={(events[id]?.rateTop * divHeight) / 4}
                                  isShrinking={currentEventBox.id == id}
                                  handleMouseDownShrink={handleMouseDownShrink}
                                  startTime={events[id]?.startTime}
                                  endTime={events[id]?.endTime}
                                  subBooking={events[id]}
                                  lectureId={events[id]?.lectureId}
                                  allday={events[id]?.allday}
                                  width={events[id]?.width}
                                  left={events[id]?.left}
                                  handleOpenSubBookingDetail={handleOpenSubBookingDetail}
                                  type={events[id]?.type}
                                  index={i}
                                  colorAndTitle={getColorAndTitleEvent(events[id])}
                                />
                              ))}
                          </div>
                        </div>
                      );
                    })}
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

        {/* Cart Animation */}
        <AnimatePresence>
          {isShowCart && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-1 border border-gray-300 rounded-3xl bg-white/95 shadow-lg h-[750px] overflow-hidden"
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
                activeStudents={room.capacity}
                activeGroups={room.groupSize}
                onlyGroupStatus={room.onlyGroupStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Month Selection Modal */}
        {isShowMonthModal && (
          <MonthBox
            handleClickMonth={handleClickMonth}
            handleCloseMonth={setIsShowMonthModal}
          />
        )}

        {/* SubBooking Detail Modal without backdrop blur */}
        {isCreateSubBooking && (
          <div
            onClick={handleCancelSubBooking}
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gray-900/20"
          >
            <SubBookingDetail
              left={
                openViewDay
                  ? leftPositionSubBooking
                  : divRefs.current[currentEventBox.index].getBoundingClientRect().left + 100
              }
              subBooking={openViewDay ? currentEventBoxSub : currentEventBox}
              handleCancelSubBooking={handleCancelSubBooking}
              handleSaveSubBooking={handleSaveSubBooking}
              checkTotalStudentLeft={checkTotalStudentLeft}
              checkConditionPrivate={checkConditionPrivate}
              typeSlot={openViewDay ? currentEventBoxSub.typeSlot ?? 3 : currentEventBox.typeSlot}
              handleHeightPosition={handleHeightPosition}
              onlyGroupStatus={room.onlyGroupStatus}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced modern EventBox component with improved drag UI
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
  index,
  isDragging
}) => {
  return (
    <div
      style={{
        top: top,
        height: height,
        width: isBuffer ? "100%" : (width + "%"),
        left: isBuffer ? "0" : (left + "%"),
        transition: isDragging ? 'none' : 'height 0.1s ease-out' // Only add transition when not actively dragging
      }}
      tabIndex={0}
      className={`absolute rounded-lg z-20 
        ${isBuffer
          ? 'backdrop-blur-sm transition-all duration-100'
          : colorAndTitle?.[0] || ''}
        ${isShrinking ? 'opacity-70' : ''} 
        ${isDragging ? 'cursor-ns-resize' : 'cursor-pointer'} 
        overflow-hidden shadow-lg`}
    >
      {/* Show content for existing events */}
      {!isBuffer && startTime && endTime && (
        <div
          onClick={(e) => {
            if (handleOpenSubBookingDetail) {
              handleOpenSubBookingDetail(dateBooking, id, index);
              e.stopPropagation();
            }
          }}
          className="p-2.5 h-full select-none"
          title={`${colorAndTitle?.[1] || ''} ${startTime?.slice(0, 5) + "-" + endTime?.slice(0, 5)}`}
        >
          <div className="font-medium text-sm text-white truncate">{colorAndTitle?.[1] || ''}</div>
          <div className="text-xs text-white/90 mt-0.5">{startTime?.slice(0, 5) + "-" + endTime?.slice(0, 5)}</div>
        </div>
      )}

      {/* Modern glass-morphism time selection UI */}
      {isBuffer && (
        <div className={`h-full w-full flex flex-col relative ${isDragging
          ? 'bg-gradient-to-b from-indigo-500/30 to-purple-500/30 border-2 border-dashed border-indigo-400 animate-pulse'
          : 'bg-gradient-to-b from-emerald-500/40 to-teal-600/40 border-2 border-emerald-400'
          }`}>
          {/* Top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-r from-indigo-600/90 to-indigo-500/90 backdrop-blur-md flex items-center px-2.5 shadow-sm">
            <div className="flex items-center space-x-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium tracking-wide text-white">New Booking</span>
            </div>
            {isDragging && (
              <div className="ml-auto flex items-center">
                <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-sm text-white">
                  Adjusting...
                </span>
              </div>
            )}
          </div>

          {/* Time indicators with modernized design */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-gradient-to-b from-transparent to-black/20 backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">Start</span>
              <div className="text-sm font-bold text-white flex items-center space-x-1 bg-indigo-700/80 px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-indigo-200">
                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                </svg>
                <span>{startTime?.slice(0, 5)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">End</span>
              <div className="text-sm font-bold text-white flex items-center space-x-1 bg-indigo-700/80 px-2 py-0.5 rounded-md shadow-sm backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-indigo-200">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                <span>{endTime?.slice(0, 5)}</span>
              </div>
            </div>
          </div>

          {/* Visual duration indicator */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDragging
              ? 'bg-white/10 border border-dashed border-white/30'
              : 'bg-white/20 border border-white/40'
              }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 text-white ${isDragging ? 'animate-spin' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {height > 80 && (
              <div className="mt-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                {startTime?.slice(0, 5)} - {endTime?.slice(0, 5)}
              </div>
            )}
          </div>

          {/* Pattern overlay for visual interest */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

          {/* Vertical guide lines */}
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-1/4 w-px bg-white/10 pointer-events-none"></div>
        </div>
      )}

      {/* Enhanced resize handle with better visual feedback */}
      {handleMouseDownShrink && (
        <div
          onMouseDown={(e) => {
            handleMouseDownShrink(dateBooking, id);
            e.stopPropagation();
          }}
          className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-black/20 to-transparent cursor-ns-resize group"
        >
          <div className="absolute inset-x-0 bottom-0 flex justify-center items-center h-5 hover:bg-black/20 transition-colors">
            <div className="w-10 h-1.5 bg-white/60 rounded-full group-hover:bg-white/80 transition-colors"></div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded px-1.5 py-0.5 text-[10px] text-indigo-800 font-medium">
              Resize
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Month Selection modal with consistent styling
const MonthBox = ({ handleClickMonth, handleCloseMonth }) => {
  return createPortal(
    <div
      onClick={() => handleCloseMonth(false)}
      className="fixed inset-0 z-30 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="py-3 text-center font-medium text-indigo-600 border-b border-gray-100">
          Select Month
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-100">
          {Array.from({ length: 12 }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                handleClickMonth(i);
                handleCloseMonth(false);
              }}
              className="py-3 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              {format(setMonth(new Date(), i), "MMMM")}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BookLabCalendar;