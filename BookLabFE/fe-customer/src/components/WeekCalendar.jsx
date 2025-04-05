import { useState, useEffect, useCallBack } from "react";
import { LeftChevronArrowIcon, RightChevronArrowIcon, CalendarIcon, PlusCircleIcon, FilterIcon, ClockIcon } from "../icons";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns';
import apiClient from "../services/ApiClient";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { swtoast } from "../utils/swal";
const dayInWeeks = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6
}

const dayInWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
const WeekCalendar = ({ studentsInGroup }) => {
    const { groupId } = useParams();
    const [firstDateOfMonth, setFirstDateOfMonth] = useState(startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [dateInMonth, setDateInMonth] = useState(null);
    const [dateGroupBooking, setDateGroupBooking] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [missedStudents, setMissedStudent] = useState([]);
    const [selectedSubBooking, setSelectedSubBooking] = useState(null);
    function getDatesWithDays(firstDateOfMonth) {
        const endDateOfMonth = endOfMonth(firstDateOfMonth);
        console.log("end of month : ", endDateOfMonth)
        const dates = eachDayOfInterval({ start: firstDateOfMonth, end: endDateOfMonth }).map((date, index) => ({
            dateNumber: index + 1,
            day: format(date, "EEEE"),
            dayNumber: dayInWeeks[format(date, "EEEE")],
            keyDate: format(date, "yyyy-MM-dd")
        }))
        return dates;
    }

    const handleNextMonth = () => {
        setFirstDateOfMonth(prev => {
            const newFirstDate = startOfMonth(addMonths(prev, 1))
            setDateInMonth(getDatesWithDays(newFirstDate));
            return newFirstDate;
        });

    }
    const handleLastMonth = () => {
        setFirstDateOfMonth(prev => {
            const newFirstDate = startOfMonth(subMonths(prev, 1))
            setDateInMonth(getDatesWithDays(newFirstDate));
            return newFirstDate;
        })
    }

    const handleOnclickDate = (date) => {
        setSelectedDate(date);

    }
    function convertTo12HourFormat(timeStr) {
        let [hour, minute, second] = timeStr.split(":").map(Number);
        let period = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12; // Convert 0 or 12 to 12, and 13-23 to 1-11
        return `${hour}:${period}`;
    }

    const handleOpenMissedStudents = (element) => {
        console.log("hoa : ", element)
        const missedStudents = [];
        studentsInGroup.map((student) => {
            if (element.studentInGroupIds.includes(student.studentInGroupId)) return;
            missedStudents.push(student);
        })
        if (missedStudents.length == 0) return;
        setSelectedSubBooking(element);
        setMissedStudent(missedStudents);
        setIsOpen(true);
    }
    const getApiGroupInBooking = async (firstDateOfMonth) => {
        const firstDateEncode = firstDateOfMonth.toISOString();
        const endDateEncode = endOfMonth(firstDateOfMonth).toISOString();
        apiClient.get(`Group/GetGroupInBooking?groupId=${groupId}&firstDateOfMonth=${firstDateEncode}&endDateOfMonth=${endDateEncode}`)
            .then((response) => {
                const data = response.data;
                const body = {};
                for (let i = 0; i < data.length; i++) {
                    const newKey = format(new Date(data[i].date), "yyyy-MM-dd");
                    if (!body[newKey]) {
                        body[newKey] = [];
                    }
                    body[newKey].push(data[i]);
                }
                setDateGroupBooking(body);
                console.log("body : ", body)
            })
            .catch((error) => {
                console.log("error : ", error);
            })
    }

    const handleCheckMissed = (element) => {
        const total = studentsInGroup.filter((student) => element.studentInGroupIds.includes(student.studentInGroupId));
        if (total.length == studentsInGroup.length) {
            return false;
        }
        return true;
    }

    useEffect(() => {
        setDateInMonth(getDatesWithDays(firstDateOfMonth));
    }, [])

    useEffect(() => {
        getApiGroupInBooking(firstDateOfMonth);
    }, [firstDateOfMonth])

    return (
        <div className="p-4">
            {isOpen ? <Popup subBooking={selectedSubBooking} missedStudents={missedStudents} onClose={() => { setIsOpen(false) }} /> : null}

            <div className="flex justify-between pb-6">
                <div onClick={handleLastMonth} className="font-mono font-bold "> <LeftChevronArrowIcon /></div>
                <div className="font-bold text-xl font-mono">{format(firstDateOfMonth, "MMMM, yyyy")}</div>
                <div onClick={handleNextMonth} className="font-mono font-bold "> <RightChevronArrowIcon /> </div>

            </div>

            <div>
                <div className="flex justify-between space-x-4 pb-4">
                    {dayInWeek.map((element, index) => (
                        <div key={element} className="font-mono text-gray-300">{element}</div>
                    ))}
                </div>

                {dateInMonth && <div className="grid grid-cols-7 content-start gap-4">
                    <div id="padding-layer" className={`${"col-span-" + dateInMonth[0].dayNumber}`}></div>
                    {
                        dateInMonth.map((element, index) => (
                            <div key={element.keyDate} onClick={() => {
                                handleOnclickDate(element.keyDate)
                            }} className={`font-mono py-[2px] flex items-center relative justify-center transition-all duration-300 rounded-full ${element.keyDate == selectedDate ? "bg-[#43A8D8] text-white" : ""} hover:bg-[#9cdefc]`}>
                                <div>{element.dateNumber}</div>
                                {dateGroupBooking && dateGroupBooking[element.keyDate] && <div className={` absolute w-[6px] h-[6px] rounded-full ${new Date(dateGroupBooking[element.keyDate][0].date) < new Date() ? 'bg-[#FFBD77]' : 'bg-[#33D29C]'}  translate-y-3`}></div>}
                            </div>
                        ))
                    }
                </div>}
            </div>
            {
                dateGroupBooking[selectedDate] ? (

                    dateGroupBooking[selectedDate].map((element, index) => (
                        <div className='pt-6 pl-6 flex'>
                            <div className="relative">
                                <div onClick={() => { handleOpenMissedStudents(element) }} className={`w-20 h-20 mr-4 cursor-pointer rounded-lg ${new Date(dateGroupBooking[selectedDate][0].date) < new Date() ? 'bg-[#FFBD77]' : 'bg-[#33D29C]'}  translate-y-3 flex justify-center items-center font-mono text-white font-bold text-2xl`}>
                                    {convertTo12HourFormat(element.startTime)}
                                </div >

                                {
                                    handleCheckMissed(element) ? <div className="absolute top-3 right-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 text-white">
                                            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />
                                        </svg>
                                    </div> : null
                                }



                            </div>

                            <div className='flex flex-col justify-center '>
                                <div className='font-mono font-bold text-xl'>{element.roomName}</div>
                                <div className='flex items-center'>
                                    <CalendarIcon className="text-gray-300" />
                                    <div className='ml-1 text-gray-500 text-sm font-mono'>{format(new Date(element.date), "dd-MM-yyyy")}</div>

                                </div>

                            </div>

                        </div>
                    ))

                ) : (null)

            }

        </div>
    )
}

const Popup = ({ missedStudents, onClose, subBooking }) => {
    const [load, setLoad] = useState(false);

    const handlePostStudent = async (studentInGroupId) => {
        const body = {
            groupInBookingId: subBooking.groupInSubBookingId,
            studentInGroupId: studentInGroupId,
            subBookingId: subBooking.subBookingId,
            roomId: subBooking.roomId
        }
        await apiClient.post('/Booking/AddStudentToGroupInBooking', JSON.stringify(body), {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((response) => {
                console.log("response : ", response.status)
                if (response.status == 400) {
                    swtoast.error({ text: 'Add Student To Booking fail' })
                    return;
                }
                if (response.status == 200) {
                    subBooking.studentInGroupIds.push(studentInGroupId);
                    for (let i = 0; i < missedStudents.length; i++) {
                        if (missedStudents[i].studentInGroupId == studentInGroupId) {
                            missedStudents.splice(i, 1)
                            break;
                        }
                    }
                    if (missedStudents.length == 0) {
                        onClose();
                    }
                    setLoad(prev => !prev)
                    swtoast.success({ text: 'Add Successfully' })
                    return;
                }

            })
            .catch((error) => {
                console.log("error ", error)
                swtoast.error({ text: 'Add Student To Booking fail' })

            })
    }
    console.log("li : ", missedStudents, subBooking)
    return createPortal(
        <div onClick={() => { onClose() }} className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-20">
            <div onClick={(e) => { e.stopPropagation() }} className="bg-[#FAFAFA] p-5 w-[30%] rounded-lg shadow-lg">
                <h2 className="text-xl font-bold font-mono">student may you miss</h2>
                <div className='mt-4'>
                    {missedStudents.map((element, index) => (
                        <div key={element.id} className="flex group items-center rounded-lg hover:bg-[#FFF4E8] transition-all duration-300 transform hover:translate-x-2 hover:text-[#966a3a]">

                            <div class="px-4 py-2">
                                <div><img className='w-12 h-12 object-cover rounded-lg' src={element.avatar} /></div>
                            </div>
                            <div class="px-4 py-2 font-mono text-sm">
                                {element.studentName}
                            </div>
                            <div class="px-4 py-2 font-mono text-sm">
                                {element.studentCode}
                            </div>

                            <div className="px-4 py-2 rounded-r-lg">
                                <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono bg-[#33D29C] text-white px-3 py-1 rounded-md hover:bg-[#04d189]"
                                    onClick={() => handlePostStudent(element.studentInGroupId)}
                                >
                                    push
                                </button>
                            </div>

                        </div>
                    )
                    )}
                </div>
                <div className="w-full flex justify-end mt-6 ">
                    <button onClick={onClose} className="mt-3 px-4 py-2 bg-red-500 text-white rounded">
                        close
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default WeekCalendar;