import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react"
import { useSelector } from "react-redux";
import { swtoast } from "../utils/swal"
import { BackIcon } from "../icons"
import SubBookingDetail from "./SubBookingDetail"
import { format } from "date-fns"
import { minutesToTime, timeToMinutes } from "../utils/dateUtils"
import { data } from "react-router-dom";

const OneDayBooking = ({ room = null, dateDay = null, typeSlot = 3, day = null, handleChangeView, handleSetCurrentEvent, handleOpenSubBookingDetailIOneDay, size }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null);
  const tooltipRef = useRef(null)
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false)
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    timePeriod: "",
    students: 0,
    groups: 0,
  })
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 600 });

  // Booking selection state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    date: day,
    startTime: "",
    endTime: "",
    timeRange: "",
    students: 1,
    groups: 1,
  })

  const [slotPositions, setSlotPositions] = useState([])

  const { userId } = useSelector(state => state.profile)

  // Store bar positions for interaction
  const [barPositions, setBarPositions] = useState([])

  // Store positions for each time interval
  const [timePositions, setTimePositions] = useState([])

  // Track if mouse is over a bar
  const [isHoveringBar, setIsHoveringBar] = useState(false)

  // Timeout ref for delayed tooltip hiding
  const hideTimeoutRef = useRef(null)

  const [renderKey, setRenderKey] = useState(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const handleRender = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Force a redraw
          setRenderKey((prev) => prev + 1);
        }
      }
      animationFrameRef.current = requestAnimationFrame(handleRender);
    };

    animationFrameRef.current = requestAnimationFrame(handleRender);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Define the complete 24-hour timeline with 15-minute intervals
  const fullTimeline = useMemo(() => {
    const timeline = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const nextMinute = minute + 15
        const nextHour = nextMinute === 60 ? hour + 1 : hour
        const formattedMinute = minute === 0 ? "00" : minute
        const formattedNextMinute = nextMinute === 60 ? "00" : nextMinute
        const formattedNextHour = nextHour === 24 ? 0 : nextHour
        timeline.push(`${hour}:${formattedMinute}-${formattedNextHour}:${formattedNextMinute}`)
      }
    }
    return timeline
  }, [])

  // Original data for specific time periods
  // const originalTimePeriods = [
  //   "7:00-9:00",
  //   "9:00-10:00",
  //   "10:00-11:00",
  //   "11:00-13:00",
  //   "13:00-15:00",
  //   "15:00-17:00",
  //   "17:00-18:00",
  //   "18:00-20:45",
  // ]
  // const originalStudentsData = [20, 10, 15, 25, 30, 22, 18, 12]
  // const originalGroupsData = [4, 1, 2, 5, 6, 4, 3, 2]
  // Data processing
  const processedData = useMemo(() => {
    let originalTimePeriods = [];
    let originalStudentsData = [];
    let originalGroupsData = [];
    let originalLecturerData = [];
    let originalPrivateData = [];
    let originalInternalData = [];
    let timeMap = new Map();

    const addTimeSlot = (
      start,
      end,
      students,
      groups,
      lecturerId,
      privateStatus,
      internalStatus
    ) => {
      const timeKey = `${start}-${end}`;
      if (!timeMap.has(timeKey)) {
        timeMap.set(timeKey, originalTimePeriods.length);
        originalTimePeriods.push(timeKey);
        originalStudentsData.push(students);
        originalGroupsData.push(groups);
        originalLecturerData.push([...lecturerId]);
        originalPrivateData.push(privateStatus);
        originalInternalData.push(internalStatus);
      }
    };

    const updateTimeSlot = (
      start,
      end,
      students,
      groups,
      lecturerId,
      privateStatus
    ) => {
      const timeKey = `${start}-${end}`;
      if (timeMap.has(timeKey)) {
        const index = timeMap.get(timeKey);
        originalStudentsData[index] += students;
        originalGroupsData[index] += groups;
        originalLecturerData[index].push(...lecturerId);
        // originalPrivateData.push(privateStatus);
      }
    };

    if (dateDay) {
      console.log("Daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: ", dateDay)
      const sortedBookings = Object.values(dateDay).sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );

      sortedBookings.forEach((booking, index) => {
        console.log(" bookkkkk  --------------:  ", booking);
        let startTime = booking.startTime.slice(0, 5);
        let closeTime = booking.endTime.slice(0, 5);
        let students = Number(booking.studentQuantity);
        let groups = Number(booking.groupQuantity);
        let lecturerId = [booking.lecturerId];
        let privateStatus = booking.private ?? false;
        let typeBooking = booking.type == 6;

        if (originalTimePeriods.length == 0) {
          addTimeSlot(
            startTime,
            closeTime,
            students,
            groups,
            lecturerId,
            privateStatus,
            typeBooking
          );
        } else if (originalTimePeriods.includes(`${startTime}-${closeTime}`)) {
          updateTimeSlot(
            startTime,
            closeTime,
            students,
            groups,
            lecturerId,
            privateStatus
          );
        } else {
          let fakeTimePeriods = [];
          let resultTimePeriods = [...originalTimePeriods];
          let resultStudentData = [...originalStudentsData];
          let resultGroupsData = [...originalGroupsData];
          let resultLecturerData = [...originalLecturerData];
          let resultPrivateData = [...originalPrivateData];
          let resultInternalData = [...originalInternalData];

          const affectedSlots = [...timeMap.keys()]
            .filter((key) => {
              const [existingStart, existingEnd] = key.split("-");
              return existingStart <= startTime && existingEnd >= closeTime;
            })
            .map((time) => time.split("-"))
            .flat();

          let existingTimes = [...timeMap.keys()]
            .map((time) => time.split("-"))
            .flat();
          existingTimes = [...new Set(existingTimes)];
          existingTimes.sort();

          let splitTimes = [startTime];
          existingTimes.forEach((time) => {
            if (time > startTime && time < closeTime) {
              console.log("splitTimesssssss: ", time);
              splitTimes.push(time);
            }
          });
          splitTimes.push(closeTime);

          // just can have only one period time -> 2 elements
          if(affectedSlots.length > 0){
            const key = `${affectedSlots[0]}-${affectedSlots[1]}`;
            const index = timeMap.get(key);
            resultTimePeriods.splice(
              index,
              1,
              `${affectedSlots[0]}-${startTime}`,
              `${startTime}-${closeTime}`,
              `${closeTime}-${affectedSlots[1]}`
            );
            resultStudentData.splice(
              index,
              1,
              originalStudentsData[index],
              originalStudentsData[index] + students,
              originalStudentsData[index]
            );
            resultGroupsData.splice(
              index,
              1,
              originalGroupsData[index],
              originalGroupsData[index] + groups,
              originalGroupsData[index]
            );
            resultLecturerData.splice(
              index,
              1,
              originalLecturerData[index],
              [...originalLecturerData[index], ...lecturerId],
              originalLecturerData[index]
            );
            resultPrivateData.splice(
              index,
              1,
              privateStatus,
              privateStatus,
              privateStatus
            );
          }else if (splitTimes.length == 2) {
            console.log("Comeeeeeeeeeee hereeeeeeeeeeeeeeeeeee")
            const timeKey = `${startTime}-${closeTime}`;
            if (!timeMap.has(timeKey)) {
              resultTimePeriods.push(timeKey);
              resultStudentData.push(students);
              resultGroupsData.push(groups);
              resultLecturerData.push([...lecturerId]);
              resultPrivateData.push(privateStatus);
              resultInternalData.push(typeBooking);
            } 
          } else {
            for (let i = 0; i < splitTimes.length - 1; i++) {
              const key = `${splitTimes[i]}-${splitTimes[i + 1]}`;
              if (originalTimePeriods.includes(key)) {
                const index = timeMap.get(key);
                resultStudentData[index] += students;
                resultGroupsData[index] += groups;
                resultLecturerData[index].push(...lecturerId)
              } else {
                fakeTimePeriods.push(key);
              }
            }

            console.log("Fakeeeeeeeeeeeeeeeee: ", fakeTimePeriods);

            for (let i = 0; i < originalTimePeriods.length; i++) {
              const checkStartTime = originalTimePeriods[i]
                .split("-")[0]
                .slice(0, 5);
              const checkEndTime = originalTimePeriods[i]
                .split("-")[1]
                .slice(0, 5);
              if (checkEndTime < startTime) continue;
              let indexPlus = i;
              for (let m = 0; m < fakeTimePeriods.length; m++) {
                const plusStartTime = fakeTimePeriods[m]
                  .split("-")[0]
                  .slice(0, 5);
                const plusEndTime = fakeTimePeriods[m]
                  .split("-")[1]
                  .slice(0, 5);
                if (checkStartTime === plusStartTime) {
                  if (plusEndTime < checkEndTime) {
                    resultTimePeriods.splice(
                      indexPlus,
                      1,
                      `${plusStartTime}-${plusEndTime}`,
                      `${plusEndTime}-${checkEndTime}`
                    );
                    resultStudentData.splice(
                      indexPlus,
                      1,
                      originalStudentsData[i] + students,
                      originalStudentsData[i]
                    );
                    resultGroupsData.splice(
                      indexPlus,
                      1,
                      originalGroupsData[i] + groups,
                      originalGroupsData[i]
                    );
                    resultLecturerData.splice(
                      indexPlus,
                      1,
                      [...originalLecturerData[i], ...lecturerId],
                      originalLecturerData[i]
                    );
                    resultPrivateData.splice(
                      i,
                      1,
                      privateStatus,
                      privateStatus
                    );
                    resultInternalData.splice(
                      i,
                      1,
                      typeBooking,
                      typeBooking
                    );
                    indexPlus += 2;
                  } else {
                    resultTimePeriods.splice(
                      indexPlus,
                      1,
                      `${plusStartTime}-${checkEndTime}`,
                      `${checkEndTime}-${plusEndTime}`
                    );
                    resultStudentData.splice(
                      indexPlus,
                      1,
                      originalStudentsData[i] + students,
                      originalStudentsData[i]
                    );
                    resultGroupsData.splice(
                      indexPlus,
                      1,
                      originalGroupsData[i] + groups,
                      originalGroupsData[i]
                    );
                    resultLecturerData.splice(
                      indexPlus,
                      1,
                      [...originalLecturerData[i], ...lecturerId],
                      originalLecturerData[i]
                    );
                    resultPrivateData.splice(
                      i,
                      1,
                      privateStatus,
                      privateStatus
                    );
                    resultInternalData.splice(
                      i,
                      1,
                      typeBooking,
                      typeBooking
                    );
                    indexPlus += 2;
                  }
                } else if (
                  checkStartTime < plusStartTime &&
                  plusStartTime < checkEndTime
                ) {
                  if (plusEndTime < checkEndTime) {
                    resultTimePeriods.splice(
                      indexPlus,
                      1,
                      `${checkStartTime}-${plusStartTime}`,
                      `${plusStartTime}-${plusEndTime}`,
                      `${plusEndTime}-${checkEndTime}`
                    );
                    resultStudentData.splice(
                      indexPlus,
                      1,
                      originalStudentsData[i],
                      originalStudentsData[i] + students,
                      originalStudentsData[i]
                    );
                    resultGroupsData.splice(
                      indexPlus,
                      1,
                      originalGroupsData[i],
                      originalGroupsData[i] + groups,
                      originalGroupsData[i]
                    );
                    resultLecturerData.splice(
                      indexPlus,
                      1,
                      originalLecturerData[i],
                      [...originalLecturerData[i], ...lecturerId],
                      originalLecturerData[i]
                    );
                    resultPrivateData.splice(
                      indexPlus,
                      1,
                      privateStatus,
                      privateStatus,
                      privateStatus
                    );
                    resultInternalData.splice(
                      indexPlus,
                      1,
                      typeBooking,
                      typeBooking,
                      typeBooking
                    );
                    indexPlus += 3;
                  } else if (plusEndTime === checkEndTime) {
                    resultTimePeriods.splice(
                      indexPlus,
                      1,
                      `${checkStartTime}-${plusStartTime}`,
                      `${plusStartTime}-${plusEndTime}`
                    );
                    resultStudentData.splice(
                      indexPlus,
                      1,
                      originalStudentsData[i],
                      originalStudentsData[i] + students
                    );
                    resultGroupsData.splice(
                      indexPlus,
                      1,
                      originalGroupsData[i],
                      originalGroupsData[i] + groups
                    );
                    resultLecturerData.splice(
                      indexPlus,
                      1,
                      originalLecturerData[i],
                      [...originalLecturerData[i], ...lecturerId]
                    );
                    resultPrivateData.splice(
                      indexPlus,
                      1,
                      privateStatus,
                      privateStatus
                    );
                    resultInternalData.splice(
                      indexPlus,
                      1,
                      typeBooking,
                      typeBooking
                    );
                    indexPlus += 2;
                  } else {
                    resultTimePeriods.splice(
                      indexPlus,
                      1,
                      `${checkStartTime}-${plusStartTime}`,
                      `${plusStartTime}-${checkEndTime}`,
                      `${checkEndTime}-${plusEndTime}`
                    );
                    resultStudentData.splice(
                      indexPlus,
                      1,
                      originalStudentsData[i],
                      originalStudentsData[i] + students,
                      originalStudentsData[i]
                    );
                    resultGroupsData.splice(
                      indexPlus,
                      1,
                      originalGroupsData[i],
                      originalGroupsData[i] + groups,
                      originalGroupsData[i]
                    );
                    resultLecturerData.splice(
                      indexPlus,
                      1,
                      originalLecturerData[i],
                      [...originalLecturerData[i], ...lecturerId],
                      originalLecturerData[i]
                    );
                    resultPrivateData.splice(
                      indexPlus,
                      1,
                      privateStatus,
                      privateStatus,
                      privateStatus
                    );
                    resultInternalData.splice(
                      indexPlus,
                      1,
                      typeBooking,
                      typeBooking,
                      typeBooking
                    );
                    indexPlus += 3;
                  }
                } else if (
                  checkEndTime <= plusStartTime &&
                  !resultTimePeriods.includes(`${plusStartTime}-${plusEndTime}`)
                ) {
                  resultTimePeriods.push(`${plusStartTime}-${plusEndTime}`);
                  resultStudentData.push(students);
                  resultGroupsData.push(groups);
                  resultLecturerData.push(lecturerId);
                  resultPrivateData.push(privateStatus);
                  resultInternalData.push(typeBooking);
                }
              }
            }
          }

          originalTimePeriods = resultTimePeriods;
          originalStudentsData = resultStudentData;
          originalGroupsData = resultGroupsData;
          originalLecturerData = resultLecturerData;
          originalPrivateData = resultPrivateData;
          originalInternalData = resultInternalData;
          timeMap.clear();
          originalTimePeriods.forEach((period, idx) =>
            timeMap.set(period, idx)
          );
        }
        console.log("Lannnnnnnnnnnnnnnnnnnnnnn: ", index);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalTimePeriods);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalStudentsData);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalGroupsData);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalLecturerData);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalPrivateData);
        console.log("Afterrrrrrrrrrrrrrrrrrr: ", originalInternalData);
      });
    }

    return {
      originalTimePeriods,
      originalStudentsData,
      originalGroupsData,
      originalLecturerData,
      originalPrivateData,
      originalInternalData,
      timeMap,
    }
  }, [Object.values(dateDay).length]);

  // Define capacity limits for each time period
  const maxCapacity = useMemo(
    () => ({
      students: room ? room.capacity : 30,
      groups: room ? room.groupSize : 8,
    }),
    [room]
  )

  const { originalTimePeriods, originalStudentsData, originalGroupsData, originalLecturerData, originalPrivateData, originalInternalData } =
    processedData

  // Additional details for each time period
  // Cần xem xét lại
  const timeDetails = Array(originalTimePeriods.length)
    .fill(null)
    .map((_, i) => {
      // Check if this time period is at full capacity
      const isFullyBooked =
        originalStudentsData[i] >= maxCapacity.students || originalGroupsData[i] >= maxCapacity.groups

      return {
        private: originalPrivateData[i],
        internal: originalInternalData[i],
        teacher: `Nguyễn Văn ${String.fromCharCode(65 + i)}`,
        room: `P${Math.floor(i / 3) + 1}${(i % 3) + 1}`,
        isFullyBooked,
      }
    })

  // Function to show tooltip
  const showTooltip = (index, x, y) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    setTooltip({
      visible: true,
      x: x,
      y: y,
      timePeriod: originalTimePeriods[index],
      students: originalStudentsData[index],
      groups: originalGroupsData[index],
    })
  }

  // Function to hide tooltip with delay
  const hideTooltipWithDelay = () => {
    // Only set a timeout if there isn't one already
    if (!hideTimeoutRef.current) {
      hideTimeoutRef.current = setTimeout(() => {
        // Only hide if we're still not hovering over either element
        if (!isHoveringBar && !isHoveringTooltip) {
          setTooltip((prev) => ({ ...prev, visible: false }))
        }
        hideTimeoutRef.current = null
      }, 100) // 100ms delay before hiding
    }
  }

  // Helper function to get nice round scale values
  const getNiceScale = (max, steps) => {
    // Round up max to a nice number
    const step = max / steps

    const scale = []
    for (let i = 0; i <= steps; i++) {
      scale.push(Math.round(i * step))
    }

    return {
      max,
      scale,
    }
  }

  // Take index of fulltime
  const getIndexOfFullTime = (index) => {
    const timeString = originalTimePeriods[index]
    const [startTimeString, endTimeString] = timeString.split("-")

    const [startHour, startMinute] = startTimeString.split(":").map(Number)
    const [endHour, endMinute] = endTimeString.split(":").map(Number)

    const obj = {}

    obj.startIndex = startHour === 0 ? 0 : startHour * 4 + startMinute / 15
    obj.endIndex = endHour === 0 ? 0 : endHour * 4 - 1 + endMinute / 15

    return obj
  }

  // Function to get time string from index
  // Cần xem xét lại
  const getTimeFromIndex = (index) => {
    if (index < 0 || index >= fullTimeline.length) return ""
    return fullTimeline[index]
  }

  // Function to get time range from indices
  const getTimeRangeFromIndices = (startIndex, endIndex) => {
    if (startIndex < 0 || endIndex >= fullTimeline.length || startIndex > endIndex) return ""

    const startTime = fullTimeline[startIndex].split("-")[0].length == 4 ? "0"+fullTimeline[startIndex].split("-")[0] : fullTimeline[startIndex].split("-")[0];
    const endTime = fullTimeline[endIndex].split("-")[1].length == 4 ? "0"+fullTimeline[endIndex].split("-")[1] : fullTimeline[endIndex].split("-")[1];

    return `${startTime}-${endTime}`
  }

  // Function to find the closest time index to a given x position
  const findClosestTimeIndex = (x) => {
    if (!timePositions.length) return -1

    let closestIndex = 0
    let minDistance = Math.abs(timePositions[0].centerX - x)

    for (let i = 1; i < timePositions.length; i++) {
      const distance = Math.abs(timePositions[i].centerX - x)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }

    return closestIndex
  }

  // Function to get all fully booked periods that overlap with a range
  const getFullyBookedPeriodsInRange = (startIndex, endIndex) => {
    const overlappingPeriods = []

    for (let i = 0; i < originalTimePeriods.length; i++) {
      if (timeDetails[i].isFullyBooked) {
        const period = getIndexOfFullTime(i)

        // Check if this period overlaps with the selection range
        if (!(period.endIndex < startIndex || period.startIndex > endIndex)) {
          overlappingPeriods.push(i)
        }
      }
    }

    return overlappingPeriods
  }

  // Function to check private in range
  const checkPrivate = (startIndex, endIndex) => {
    for (let i = 0; i < originalTimePeriods.length; i++) {
      if (timeDetails[i].private) {
        const period = getIndexOfFullTime(i)

        // Check if this period overlaps with the selection range
        if (!(period.endIndex < startIndex || period.startIndex > endIndex)) {
          return {
            startPrivateIndex: period.startIndex,
            endPrivateIndex: period.endIndex,
            statusPrivate: true
          }
        }
      }
    }

    return { statusPrivate: false }
  }

  // Function to internal private in range
  const checkInternal = (startIndex, endIndex) => {
    for (let i = 0; i < originalTimePeriods.length; i++) {
      if (timeDetails[i].internal) {
        const period = getIndexOfFullTime(i)

        // Check if this period overlaps with the selection range
        if (!(period.endIndex < startIndex || period.startIndex > endIndex)) {
          return {
            startInternalIndex: period.startIndex,
            endInternalIndex: period.endIndex,
            statusInternal: true
          }
        }
      }
    }

    return { statusInternal: false }
  }

  // Function to get the max student and group in range
  const getAvailableInRange = (timeRange) => {
    const [startTime, endTime] = timeRange.split("-");
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    let maxStudents = 0;
    let maxGroups = 0;

    originalTimePeriods.forEach((period, index) => {
      const [periodStart, periodEnd] = period.split("-").map(timeToMinutes);

      if (periodStart < endMinutes && periodEnd > startMinutes) {
        maxStudents = Math.max(maxStudents, originalStudentsData[index]);
        maxGroups = Math.max(maxGroups, originalGroupsData[index]);
      }
    });

    const availableStudents = maxCapacity.students - maxStudents;
    const availableGroups = maxCapacity.groups - maxGroups;
    return { availableStudents, availableGroups };
  }

  // Function to get divisor of students and groups
  const findCommonDivisors = (a, b) => {
    let commonDivisors = [];
    let min = Math.min(a, b);

    for (let i = 1; i <= min; i++) {
      if (a % i === 0 && b % i === 0) {
        commonDivisors.push(i);
      }
    }

    if (commonDivisors.length === 0) return null;
    return commonDivisors[Math.floor(commonDivisors.length / 2)];
  };


  // Function check duplicate booking
  const checkDuplicateBooking = (timeRange) => {
    const [startTime, endTime] = timeRange.split("-");
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    let status = false;
    console.log("originalLecturerData: ", originalLecturerData)
    originalTimePeriods.forEach((period, index) => {
      const [periodStart, periodEnd] = period.split("-").map(timeToMinutes);
      if (periodStart < endMinutes && periodEnd > startMinutes) {
        status = originalLecturerData[index].includes(userId)
        if (status) {
          return status
        }
      }
    });

    return status
  }

  // Resize canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        containerRef.current.style.height = `${size.height}px`
        containerRef.current.style.width = `${size.width}px`

        setCanvasSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight - 100,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [size]);


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Canvas dimensions
    const width = canvas.width
    const height = canvas.height
    const padding = 60
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Draw chart background
    ctx.fillStyle = "#f8f8f8"
    ctx.fillRect(padding, padding, chartWidth, chartHeight)

    // Find max values for scaling
    const maxStudents = maxCapacity.students
    const maxGroups = maxCapacity.groups

    // Get nice scales for both axes
    const steps = findCommonDivisors(maxStudents, maxGroups)
    const studentsScale = getNiceScale(maxStudents, steps)
    const groupsScale = getNiceScale(maxGroups, steps)

    // Draw y-axis for students (left)
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw y-axis for groups (right)
    ctx.beginPath()
    ctx.moveTo(width - padding, padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw x-axis
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw top x-axis line for booking selection
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(width - padding, padding)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw horizontal grid lines
    ctx.strokeStyle = "#ddd"
    ctx.setLineDash([5, 5])

    studentsScale.scale.forEach((value, i) => {
      if (i === 0) return // Skip the 0 line (it's the x-axis)

      const y = height - padding - (value / studentsScale.max) * chartHeight

      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    })

    ctx.setLineDash([]) // Reset line dash

    // Draw y-axis labels for students
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#000"
    ctx.font = "12px Arial"

    studentsScale.scale.forEach((value) => {
      const y = height - padding - (value / studentsScale.max) * chartHeight
      ctx.fillText(value.toString(), padding - 10, y)
    })

    // Draw y-axis title for students
    ctx.save()
    ctx.translate(padding - 40, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Students", 0, 0)
    ctx.restore()

    // Draw y-axis labels for groups
    ctx.textAlign = "left"
    groupsScale.scale.forEach((value) => {
      const y = height - padding - (value / groupsScale.max) * chartHeight
      ctx.fillText(value.toString(), width - padding + 10, y)
    })

    // Draw y-axis title for groups
    ctx.save()
    ctx.translate(width - padding + 40, height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("Groups", 0, 0)
    ctx.restore()

    // Calculate positions for each time period (equal width for each 15-minute interval)
    const positions = []
    const intervalWidth = chartWidth / fullTimeline.length // Equal width for each 15-minute interval

    for (let i = 0; i < fullTimeline.length; i++) {
      const startX = padding + i * intervalWidth
      const endX = startX + intervalWidth
      const centerX = startX + intervalWidth / 2

      positions.push({
        startX,
        endX,
        centerX,
        width: intervalWidth,
        index: i,
      })
    }

    // Store time positions for interaction
    setTimePositions(positions)

    // Draw vertical grid lines based on typeSlot
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Determine which slots to use based on typeSlot
    const slots =
      typeSlot === 1
        ? [
            { startTime: "07:00:00", endTime: "08:30:00" },
            { startTime: "08:45:00", endTime: "10:15:00" },
            { startTime: "10:30:00", endTime: "12:00:00" },
            { startTime: "12:30:00", endTime: "14:00:00" },
            { startTime: "14:15:00", endTime: "15:45:00" },
            { startTime: "16:00:00", endTime: "17:30:00" },
          ]
        : typeSlot === 2 ? [
            { startTime: "07:00:00", endTime: "09:15:00" },
            { startTime: "09:30:00", endTime: "11:45:00" },
            { startTime: "12:30:00", endTime: "14:45:00" },
            { startTime: "15:00:00", endTime: "17:15:00" },
          ]
        : null;

    const slotPositions = []

    // Draw vertical lines at each time slot boundary
    slots?.forEach((slot, slotIndex) => {
      // Draw line at start time
      const startHour = Number.parseInt(slot.startTime.split(":")[0])
      const startMinute = Number.parseInt(slot.startTime.split(":")[1])
      const startIndex = startHour * 4 + startMinute / 15

      let startX = 0
      if (startIndex >= 0 && startIndex < positions.length) {
        startX = positions[startIndex].startX

        ctx.beginPath()
        ctx.moveTo(startX, padding - 4)
        ctx.lineTo(startX, padding + 4)
        ctx.stroke()
      }

      // Draw line at end time
      const endHour = Number.parseInt(slot.endTime.split(":")[0])
      const endMinute = Number.parseInt(slot.endTime.split(":")[1])
      const endIndex = endHour * 4 + endMinute / 15

      let endX = 0
      if (endIndex >= 0 && endIndex < positions.length) {
        endX = positions[endIndex].startX

        ctx.beginPath()
        ctx.moveTo(endX, padding - 4)
        ctx.lineTo(endX, padding + 4)
        ctx.stroke()
      }

      // Add slot label
      if (startX > 0 && endX > 0) {
        const centerX = (startX + endX) / 2;

        const overlappingFullyBookedPeriods = getFullyBookedPeriodsInRange(startIndex, endIndex)
        const hasFullyBooked = overlappingFullyBookedPeriods.length > 0
        const { statusPrivate } = checkPrivate(startIndex, endIndex)
        const { statusInternal } = checkInternal(startIndex, endIndex)
        const isUnavailable = hasFullyBooked || statusPrivate || statusInternal

        slotPositions.push({
          x: centerX,
          y: padding - 10,
          width: 50,
          height: 15,
          startIndex: startIndex,
          endIndex: endIndex,
          label: `Slot ${slotIndex + 1}`,
          isUnavailable: isUnavailable,
        });
      }
    })

    setSlotPositions(slotPositions)

    slotPositions?.forEach((slot) => {
      ctx.fillStyle = slot.isUnavailable ? "rgba(255, 82, 82, 0.2)" : "rgba(0, 200, 83, 0.2)"
      ctx.fillRect(slot.x - 25, padding - 20, 50, 15)
          
      ctx.strokeStyle = slot.isUnavailable ? "rgba(255, 82, 82, 0.5)" : "rgba(0, 200, 83, 0.5)"
      ctx.lineWidth = 2
      ctx.strokeRect(slot.x - 25, padding - 20, 50, 15)

      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${slot.label}`, slot.x, padding - 7.5);
    })

    // Draw x-axis labels (time periods) - only show hour labels
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = "10px Arial"

    // Only show hour labels (every 4 intervals)
    for (let i = 0; i < fullTimeline.length; i += 4) {
      const hourLabel = `${Math.floor(i / 4)}h`
      ctx.fillText(hourLabel, positions[i].centerX, height - padding + 10)
    }

    // Draw "Thời gian" label
    ctx.font = "12px Arial"
    ctx.fillText("Time", width - padding - chartWidth / 2, height - padding + 25)

    // Store bar positions for interaction
    const newBarPositions = []

    // Draw student bars
    originalStudentsData.forEach((value, i) => {
      const barHeight = originalInternalData[i] ? chartHeight : (value / studentsScale.max) * chartHeight
      const { startIndex, endIndex } = getIndexOfFullTime(i)
      const barWidth = positions[i].width * (endIndex - startIndex + 1)
      const x = positions[startIndex].startX
      const y = height - padding - barHeight

      // Store position for interaction
      newBarPositions.push({
        x,
        y,
        width: barWidth,
        height: barHeight,
        index: i,
      })

      // Draw with hover effect if this is the active bar
      if (originalInternalData[i] && (tooltip.visible && tooltip.timePeriod === originalTimePeriods[i])){
        ctx.fillStyle = "#d45d70" // Dark pink for hover
      } else if ((originalPrivateData[i] || timeDetails[i].isFullyBooked) && (tooltip.visible && tooltip.timePeriod === originalTimePeriods[i])) {
        ctx.fillStyle = "#ff3d3d" // Darker red for hover
      } else if (tooltip.visible && tooltip.timePeriod === originalTimePeriods[i]) {
        ctx.fillStyle = "#4caf50" // Darker green for hover
      } else if (originalInternalData[i]) {
        ctx.fillStyle = "#f67280" // Light pink for internal
      } else if (originalPrivateData[i] || timeDetails[i].isFullyBooked) {
        ctx.fillStyle = "#ff5252" // Red for fully booked
      } else {
        ctx.fillStyle = "#8bc34a" // Light green color
      }

      // Only draw if there's a value
      if (value >= 0) {
        ctx.fillRect(x, y, barWidth, barHeight)
      }
    })

    setBarPositions(newBarPositions)

    // Draw groups line
    ctx.beginPath()
    let firstPointDrawn = false

    originalGroupsData.forEach((value, i) => {
      const { startIndex, endIndex } = getIndexOfFullTime(i)
      const barWidth = positions[i].width * (endIndex - startIndex + 1)
      const x = positions[startIndex].startX + barWidth / 2
      const y = height - padding - (value / groupsScale.max) * chartHeight

      // Only include points with values in the line
      if (value > 0) {
        if (!firstPointDrawn) {
          ctx.moveTo(x, y)
          firstPointDrawn = true
        } else {
          ctx.lineTo(x, y)
        }
      }
    })

    ctx.strokeStyle = "#e91e63" // Pink color
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw group points
    originalGroupsData.forEach((value, i) => {
      const { startIndex, endIndex } = getIndexOfFullTime(i)
      const barWidth = positions[i].width * (endIndex - startIndex + 1)
      const x = positions[startIndex].startX + barWidth / 2
      const y = height - padding - (value / groupsScale.max) * chartHeight

      // Only draw points with values
      if (value > 0) {
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)

        // Highlight the active point
        if (tooltip.visible && tooltip.timePeriod === originalTimePeriods[i]) {
          ctx.fillStyle = "#c2185b" // Darker pink for hover
        } else {
          ctx.fillStyle = "#e91e63" // Pink color
        }

        ctx.fill()
      }
    })

    // Draw selection area if dragging
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startX = Math.min(dragStart, dragEnd)
      const endX = Math.max(dragStart, dragEnd)

      // Only draw if within chart area
      if (startX >= padding && endX <= width - padding) {
        // Find time indices for the current drag
        const startIndex = findClosestTimeIndex(startX)
        const endIndex = findClosestTimeIndex(endX)

        // Check if any part of the selection overlaps with fully booked periods
        const overlappingFullyBookedPeriods = getFullyBookedPeriodsInRange(startIndex, endIndex)
        const hasFullyBooked = overlappingFullyBookedPeriods.length > 0

        // Check private
        const { statusPrivate } = checkPrivate(startIndex, endIndex)

        // Check internal
        const { statusInternal } = checkInternal(startIndex, endIndex)

        // Draw selection with appropriate color
        ctx.fillStyle = (hasFullyBooked || statusPrivate || statusInternal) ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 123, 255, 0.3)"
        ctx.fillRect(startX, padding - 5, endX - startX, 10)

        // Draw border
        ctx.strokeStyle = (hasFullyBooked || statusPrivate || statusInternal) ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 123, 255, 0.8)"
        ctx.lineWidth = 2
        ctx.strokeRect(startX, padding - 5, endX - startX, 10)
      }
    }

    // Draw legend
    const legendY = height - 20

    // Students legend
    ctx.fillStyle = "#8bc34a" // Light green color
    ctx.fillRect(padding, legendY, 20, 10)
    ctx.fillStyle = "#000"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText("Students", padding + 30, legendY + 5)

    // Groups legend
    ctx.beginPath()
    ctx.moveTo(padding + 130, legendY + 5)
    ctx.lineTo(padding + 150, legendY + 5)
    ctx.strokeStyle = "#e91e63" // Pink color
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(padding + 140, legendY + 5, 4, 0, Math.PI * 2)
    ctx.fillStyle = "#e91e63" // Pink color
    ctx.fill()

    ctx.fillStyle = "#000"
    ctx.fillText("Groups", padding + 160, legendY + 5)

    // Fully booked legend
    ctx.fillStyle = "#ff5252" // Red color
    ctx.fillRect(padding + 250, legendY, 20, 10)
    ctx.fillStyle = "#000"
    ctx.fillText("Full || Private", padding + 280, legendY + 5)

    // Internal booked legend
    ctx.fillStyle = "#f67280" // Pink color
    ctx.fillRect(padding + 410, legendY, 20, 10)
    ctx.fillStyle = "#000"
    ctx.fillText("Internal", padding + 440, legendY + 5)

    // Draw booking instruction
    ctx.fillStyle = "#555"
    ctx.textAlign = "center"
    ctx.fillText("Drag to select appointment time", width / 2, padding - 30)
  }, [tooltip, isDragging, dragStart, dragEnd, renderKey])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Handle mouse hover interactions
  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // If dragging, update the end position
    if (isDragging) {
      setDragEnd(x)
      return
    }

    // Check if mouse is over a slot label
    const hoveredSlot = slotPositions.find(
      (slot) =>
        x >= slot.x - slot.width / 2 &&
        x <= slot.x + slot.width / 2 &&
        y >= slot.y - slot.height / 2 &&
        y <= slot.y + slot.height / 2,
    )

    if (hoveredSlot) {
      canvas.style.cursor = "pointer"
      return
    }

    // Check if mouse is over the top x-axis area (for booking)
    const padding = 60
    const isOverBookingArea = y >= padding - 10 && y <= padding + 20 && x >= padding && x <= canvas.width - padding

    if (isOverBookingArea) {
      canvas.style.cursor = "ew-resize"
      return
    }

    // Check if mouse is over a bar
    const hoveredBar = barPositions.find(
      (bar) => x >= bar.x && x <= bar.x + bar.width && y >= bar.y && y <= bar.y + bar.height,
    )

    if (hoveredBar) {
      setIsHoveringBar(true)
      const index = hoveredBar.index
      showTooltip(index, hoveredBar.x + hoveredBar.width / 2, hoveredBar.y)
      canvas.style.cursor = "pointer"
    } else {
      setIsHoveringBar(false)
      // Use delayed hiding
      hideTooltipWithDelay()
      canvas.style.cursor = "default"
    }
  }

  // Handle mouse leave to hide tooltip
  const handleCanvasMouseLeave = () => {
    setIsHoveringBar(false)
    // Use delayed hiding
    hideTooltipWithDelay()

    // End dragging if it was in progress
    if (isDragging) {
      finalizeDragSelection()
    }
  }

  // Handle mouse down to start dragging
  const handleCanvasMouseDown = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicked on a slot label
    const clickedSlot = slotPositions.find(
      (slot) =>
        x >= slot.x - slot.width / 2 &&
        x <= slot.x + slot.width / 2 &&
        y >= slot.y - slot.height / 2 &&
        y <= slot.y + slot.height / 2,
    )

    if (clickedSlot) {
      // Simulate a completed drag for this slot
      simulateSlotSelection(clickedSlot.startIndex, clickedSlot.endIndex)
      return
    }

    // Check if mouse is over the top x-axis area (for booking)
    const padding = 60
    const isOverBookingArea = y >= padding - 10 && y <= padding + 20 && x >= padding && x <= canvas.width - padding

    if (isOverBookingArea) {
      const index = findClosestTimeIndex(x) + 1
      const startTime = minutesToTime(index * 15);
      const currentDate = format(new Date(), "yyyy-MM-dd") + "T00:00:00";
      const currentTime = minutesToTime(
        timeToMinutes(format(new Date(), "HH:mm:") + "00") + 30
      );
      console.log("Day: ", day);
      console.log("CurrentDate: ", currentDate);
      if (day < currentDate) {
        swtoast.warning({ text: "Cannot schedule past dates", timer: 1000 });
        return;
      }
      if (day == currentDate && startTime < currentTime) {
        swtoast.warning({ text: "you have to book earlier than 30 minutes", timer: 1000 });
        return;
      }
      setIsDragging(true);
      setDragStart(x);
      setDragEnd(x);
    }
  }

  // Function to simulate a slot selection (when clicking on a slot label)
  const simulateSlotSelection = (startIndex, endIndex) => {
    const timeRange = getTimeRangeFromIndices(startIndex, endIndex)

    // Check duplicate booking
    const duplicateBooking = checkDuplicateBooking(timeRange)

    // Check if selection includes fully booked periods
    const overlappingFullyBookedPeriods = getFullyBookedPeriodsInRange(startIndex, endIndex)

    // Check private
    const { statusPrivate, startPrivateIndex, endPrivateIndex } = checkPrivate(startIndex, endIndex)

    // Check internal
    const { statusInternal, startInternalIndex, endInternalIndex } = checkInternal(startIndex, endIndex)

    if (duplicateBooking) {
      swtoast.warning({
        text: `Unable to book: You have a schedule at the time of measurement.`,
      })
    } else if (statusPrivate) {
      const timeRangePrivate = getTimeRangeFromIndices(startPrivateIndex, endPrivateIndex)
      swtoast.warning({
        text: `Unable to book: Time slot ${timeRangePrivate} is private`,
      })
    } else if (statusInternal) {
      const timeRangeInternal = getTimeRangeFromIndices(startInternalIndex, endInternalIndex)
      swtoast.warning({
        text: `Unable to book: Time slot ${timeRangeInternal} is internal`,
      })
    } else if (overlappingFullyBookedPeriods.length > 0) {
      // Show warning alert
      const fullyBookedTimes = overlappingFullyBookedPeriods.map((index) => originalTimePeriods[index]).join(", ")
      swtoast.warning({
        text: `Unable to book: Time slot ${fullyBookedTimes} is full`,
      })
    } else {
      const { availableStudents, availableGroups } = getAvailableInRange(timeRange)
      // Set booking details and open modal
      const bookDetail = {
        date: day,
        startTime: timeRange.split("-")[0] + ":00",
        endTime: timeRange.split("-")[1] + ":00",
        timeRange,
        studentsLeft: availableStudents,
        groupsLeft: availableGroups,
        studentQuantity: 1,
        groupQuantity: 1,
        lecturerId: userId,
        typeSlot: typeSlot,
        index: (new Date(day).getDay() + 6) % 7,
      }
      setBookingDetails(bookDetail)
      handleOpenSubBookingDetailIOneDay(canvasSize.width / 2, bookDetail)
    }
  }

  // Handle mouse up to end dragging
  const handleCanvasMouseUp = () => {
    if (isDragging) {
      finalizeDragSelection()
    }
  }

  // Finalize the drag selection and open booking modal
  const finalizeDragSelection = () => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startX = Math.min(dragStart, dragEnd)
      const endX = Math.max(dragStart, dragEnd)

      // Find closest time indices
      const startIndex = findClosestTimeIndex(startX)
      const endIndex = findClosestTimeIndex(endX)

      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const timeRange = getTimeRangeFromIndices(startIndex, endIndex);

        // Check duplicate booking
        const duplicateBooking = checkDuplicateBooking(timeRange);
        // Check if selection includes fully booked periods
        const overlappingFullyBookedPeriods = getFullyBookedPeriodsInRange(startIndex, endIndex);

        // Check private
        const { statusPrivate, startPrivateIndex, endPrivateIndex } = checkPrivate(startIndex, endIndex);

        // Check internal
        const { statusInternal, startInternalIndex, endInternalIndex } = checkInternal(startIndex, endIndex)
        
        if (duplicateBooking) {
          swtoast.warning({
            text: `Unable to book: You have a schedule at the time of measurement.`,
          });
        } else if (statusPrivate) {
          const timeRangePrivate = getTimeRangeFromIndices(
            startPrivateIndex,
            endPrivateIndex
          );
          swtoast.warning({
            text: `Unable to book: Time slot ${timeRangePrivate} is private`,
          });
        } else if (statusInternal) {
          const timeRangeInternal = getTimeRangeFromIndices(startInternalIndex, endInternalIndex)
          swtoast.warning({
            text: `Unable to book: Time slot ${timeRangeInternal} is internal`,
          })
        } else if (overlappingFullyBookedPeriods.length > 0) {
          // Show warning alert
          const fullyBookedTimes = overlappingFullyBookedPeriods
            .map((index) => originalTimePeriods[index])
            .join(", ");
          swtoast.warning({
            text: `Unable to book: Time slot ${fullyBookedTimes} is full`,
          });
        } else {
          const { availableStudents, availableGroups } =
            getAvailableInRange(timeRange);
          // Set booking details and open modal
          const bookDetail = {
            date: day,
            startTime: timeRange.split("-")[0] + ":00",
            endTime: timeRange.split("-")[1] + ":00",
            timeRange,
            studentsLeft: availableStudents,
            groupsLeft: availableGroups,
            studentQuantity: 1,
            groupQuantity: 1,
            lecturerId: userId,
            typeSlot: typeSlot,
            index: (new Date(day).getDay() + 6) % 7
          }
          setBookingDetails(bookDetail)
          handleOpenSubBookingDetailIOneDay(canvasSize.width / 2, bookDetail)
          // setShowBookingModal(true)
        }
      }
    }

    // Reset dragging state
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }

  // Handle mouse enter/leave for tooltip
  const handleTooltipMouseEnter = () => {
    setIsHoveringTooltip(true)
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false)
    // Use delayed hiding
    hideTooltipWithDelay()
  }

  // Handle booking form submission
  const handleBookingSubmit = (e) => {
    e.preventDefault()

    // Here you would typically send the booking data to your backend
    console.log("Booking submitted:", bookingDetails)

    // Close the modal
    setShowBookingModal(false)

    // Show success message
    swtoast.success({ text: "Booking successful" })
    // setAlert({
    //   visible: true,
    //   message: `Đặt lịch thành công cho thời gian ${bookingDetails.timeRange} với ${bookingDetails.students} học sinh và ${bookingDetails.groups} nhóm`,
    //   type: "success",
    // })
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center p-4 max-w-4xl mx-auto relative bg-white/50 backdrop-blur-md 
                rounded-3xl min-w-[500px] h-[650px] border-2 border-gray-300 shadow-2xl"
    >
      <div className="relative w-full flex items-center justify-center mb-8 pt-2">
        <button
          onClick={handleChangeView}
          className="absolute left-0 p-2 text-gray-600 hover:text-gray-800 transition-all duration-300"
        >
          <BackIcon width="1.75rem" height="1.75rem" />
        </button>
        <h2 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
          Student and group chart on {day?.slice(0, -9)}
        </h2>
      </div>

      <div className="relative">
        <canvas
          key={`canvas-${JSON.stringify(dateDay)}-${room?.id}-${day}-${canvasSize.width}-${canvasSize.height}`}
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border border-gray-300 rounded-md bg-white"
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={handleCanvasMouseLeave}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
        />

        {tooltip.visible && (
          <div
            ref={tooltipRef}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            className="absolute bg-white bg-opacity-95 border border-gray-300 rounded-md p-3 shadow-lg z-10 min-w-[200px] pointer-events-auto"
            style={{
              left: tooltip.x,
              top: tooltip.y - 120,
              transform: "translateX(-50%)",
            }}
          >
            <div className="border-b border-gray-200 pb-1 mb-2 font-bold">
              {tooltip.timePeriod}
            </div>
            <div className="flex justify-between mb-1">
              <span>Students:</span>
              <span className="font-bold">{tooltip.students}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Groups:</span>
              <span className="font-bold">{tooltip.groups}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="mt-1">
                <span className="font-bold">Status: </span>
                {timeDetails[originalTimePeriods.indexOf(tooltip.timePeriod)]
                  ?.isFullyBooked ? (
                  <span className="text-red-600">Full</span>
                ) : timeDetails[originalTimePeriods.indexOf(tooltip.timePeriod)]
                  ?.private ? (
                  <span className="text-green-600">Private</span>
                ) : (
                  <span className="text-green-600">Available</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal with Tailwind CSS */}

      {/* <div
          onClick={handleCancelBooking}
          className="absolute inset-0 z-50 top-0 bottom-0 left-0 right-0 flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full "
        >
          <SubBookingDetail
            left={canvasSize.width / 2}
            subBooking={bookingDetails}
            handleCancelSubBooking={handleCancelBooking}
            handleSaveSubBooking={handleSaveSubBooking}
          />
        </div> */}

    </div>
  );
}

export default memo(OneDayBooking, (prevProps, nextProps) => {
  return (
    prevProps.room?.id === nextProps.room?.id &&
    prevProps.dateDay === nextProps.dateDay &&
    prevProps.typeSlot === nextProps.typeSlot &&
    prevProps.day === nextProps.day &&
    prevProps.size === nextProps.size
  )
})


