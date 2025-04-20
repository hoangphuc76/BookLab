import { useState, useEffect } from "react";
import { LeftChevronArrowIcon, RightChevronArrowIcon, CalendarIcon, PlusCircleIcon, FilterIcon, ClockIcon } from "../icons";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameDay } from 'date-fns';
import apiClient from "../services/ApiClient";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { swtoast } from "../utils/swal";
import { FaPlus, FaTimes, FaClock, FaCalendarAlt } from "react-icons/fa";

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
        const dates = eachDayOfInterval({ start: firstDateOfMonth, end: endDateOfMonth }).map((date, index) => ({
            dateNumber: index + 1,
            day: format(date, "EEEE"),
            dayNumber: dayInWeeks[format(date, "EEEE")],
            keyDate: format(date, "yyyy-MM-dd"),
            isToday: isSameDay(date, new Date())
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

    const handleOpenMissedStudents = (element) => {
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
            })
            .catch((error) => {
                console.log("error : ", error);
            })
    }

    const handleCheckMissed = (element) => {
        const total = studentsInGroup.filter((student) => element.studentInGroupIds.includes(student.studentInGroupId));
        return total.length !== studentsInGroup.length;
    }

    const isPastBooking = (dateTime, startTime) => {
        return new Date() > new Date(`${dateTime.slice(0, 10)}T${startTime}`);
    }

    useEffect(() => {
        setDateInMonth(getDatesWithDays(firstDateOfMonth));
    }, [])

    useEffect(() => {
        getApiGroupInBooking(firstDateOfMonth);
    }, [firstDateOfMonth])

    return (
        <div className="p-4">
            {isOpen && <Popup subBooking={selectedSubBooking} missedStudents={missedStudents} onClose={() => { setIsOpen(false) }} />}

            <div className="flex justify-between items-center pb-6">
                <button 
                    onClick={handleLastMonth} 
                    className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors"
                >
                    <LeftChevronArrowIcon className="w-5 h-5" />
                </button>
                <h3 className="font-semibold text-indigo-800">
                    {format(firstDateOfMonth, "MMMM, yyyy")}
                </h3>
                <button 
                    onClick={handleNextMonth} 
                    className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors"
                >
                    <RightChevronArrowIcon className="w-5 h-5" /> 
                </button>
            </div>

            <div>
                <div className="flex justify-between space-x-4 pb-4">
                    {dayInWeek.map((element) => (
                        <div key={element} className="text-xs font-semibold text-slate-400">{element}</div>
                    ))}
                </div>

                {dateInMonth && (
                    <div className="grid grid-cols-7 content-start gap-4">
                        {dateInMonth[0].dayNumber > 0 && (
                            <div className={`col-span-${dateInMonth[0].dayNumber}`}></div>
                        )}
                        
                        {dateInMonth.map((element) => (
                            <div 
                                key={element.keyDate} 
                                onClick={() => handleOnclickDate(element.keyDate)} 
                                className={`
                                    relative flex items-center justify-center h-8 w-8 mx-auto 
                                    rounded-full cursor-pointer transition-all duration-300
                                    ${element.keyDate === selectedDate 
                                        ? "bg-[#6B75CC] text-white font-semibold shadow-md" 
                                        : element.isToday
                                            ? "bg-[#6B75CC]/10 text-[#6B75CC] font-semibold"
                                            : "hover:bg-indigo-100 text-slate-700"
                                    }
                                `}
                            >
                                <div>{element.dateNumber}</div>
                                {dateGroupBooking && dateGroupBooking[element.keyDate] && (
                                    <div 
                                        className={`
                                            absolute bottom-0.5 w-1.5 h-1.5 rounded-full
                                            ${isPastBooking(element.keyDate, dateGroupBooking[element.keyDate][0].startTime)
                                                ? 'bg-amber-500' 
                                                : 'bg-emerald-400'
                                            }
                                        `}
                                    ></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {dateGroupBooking[selectedDate] && (
                <div className="mt-6 border-t border-indigo-100 pt-4">
                    <h4 className="text-sm font-semibold text-indigo-800 mb-3">
                        {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                    </h4>
                    
                    {dateGroupBooking[selectedDate].map((element, index) => (
                        <div key={index} className="mb-4 bg-white rounded-xl border border-indigo-100 overflow-hidden hover:shadow-md transition-all">
                            <div className="flex">
                                <div 
                                    onClick={() => handleOpenMissedStudents(element)} 
                                    className={`
                                        w-20 min-w-[5rem] cursor-pointer 
                                        ${isPastBooking(element.date, element.startTime)
                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        } 
                                        flex flex-col justify-center items-center py-4 relative
                                    `}
                                >
                                    <div className="font-semibold">
                                        {element.startTime.slice(0, 5)}
                                    </div>
                                    <div className="text-xs">to</div>
                                    <div className="font-semibold">
                                        {element.endTime.slice(0, 5)}
                                    </div>

                                    {handleCheckMissed(element) && (
                                        <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                                            <FaPlus className="w-3 h-3 text-[#6B75CC]" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col justify-center px-4 py-3 flex-grow">
                                    <div className="font-semibold text-slate-800">{element.roomName}</div>
                                    <div className="flex items-center mt-1">
                                        <FaCalendarAlt className="w-3 h-3 text-slate-400 mr-1.5" />
                                        <span className="text-xs text-slate-500">
                                            {format(new Date(element.date), "dd/MM/yyyy")}
                                        </span>
                                        
                                        <span className="mx-2 text-slate-300">•</span>
                                        
                                        <FaClock className="w-3 h-3 text-slate-400 mr-1.5" />
                                        <span className="text-xs text-slate-500">
                                            {element.startTime.slice(0, 5)} - {element.endTime.slice(0, 5)}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex">
                                        <div className="flex -space-x-2">
                                            {studentsInGroup.filter(student => 
                                                element.studentInGroupIds.includes(student.studentInGroupId)
                                            ).slice(0, 3).map((student, idx) => (
                                                <img 
                                                    key={idx}
                                                    src={student.avatar} 
                                                    alt={student.studentName}
                                                    className="w-6 h-6 rounded-full border border-white object-cover"
                                                />
                                            ))}
                                            
                                            {studentsInGroup.filter(student => 
                                                element.studentInGroupIds.includes(student.studentInGroupId)
                                            ).length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-xs text-indigo-600 font-semibold">
                                                    +{studentsInGroup.filter(student => 
                                                        element.studentInGroupIds.includes(student.studentInGroupId)
                                                    ).length - 3}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {handleCheckMissed(element) && (
                                            <button 
                                                onClick={() => handleOpenMissedStudents(element)}
                                                className="ml-auto text-xs text-[#6B75CC] hover:text-indigo-800 font-semibold flex items-center"
                                            >
                                                <FaPlus className="mr-1 w-3 h-3" />
                                                Add Students
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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
    
    return createPortal(
        <div 
            onClick={onClose} 
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center z-50"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-indigo-800">
                        Add Missing Students
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">
                    The following students are not yet added to this booking session.
                </p>
                
                <div className="max-h-80 overflow-y-auto">
                    {missedStudents.map((element) => (
                        <div 
                            key={element.id} 
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50/70 transition-all duration-300 group"
                        >
                            <div className="flex items-center">
                                <img 
                                    className="w-10 h-10 object-cover rounded-full border border-indigo-100" 
                                    src={element.avatar}
                                    alt={element.studentName}
                                />
                                <div className="ml-3">
                                    <div className="font-semibold text-slate-800">
                                        {element.studentName}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {element.studentCode}
                                    </div>
                                </div>
                            </div>

                            <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#6B75CC] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center"
                                onClick={() => handlePostStudent(element.studentInGroupId)}
                            >
                                <FaPlus className="mr-1.5" size={12} />
                                Add
                            </button>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default WeekCalendar;