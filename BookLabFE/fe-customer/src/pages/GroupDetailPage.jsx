import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/ApiClient';
import { BookOpenIcon, CalendarIcon } from '../icons';
import { swConfirmDelete, swtoast } from '../utils/swal';
import WeekCalendar from '../components/WeekCalendar';
import AddStudentInGroupModal from '../components/AddStudentInGroupModal';
import { FaTrash, FaUserPlus, FaBook, FaCalendarAlt, FaClock } from 'react-icons/fa';

const GroupDetailPage = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [isShowAddModal, setIsShowAddModal] = useState(false);
    const [totalCompletedBooking, setTotalCompletedBooking] = useState(null);
    const [totalUpcomingBooking, setTotalUpcomingBooking] = useState(null);
    const [totalPendingBooking, setTotalPendingBooking] = useState(null);
    const navigate = useNavigate();

    const handleDeleteStudentInGroup = (studentInGroupId, studentName, deletedIndex) => {
        swConfirmDelete(async () => {
            await apiClient.delete("/StudentInGroup(" + studentInGroupId + ")", {})
                .then((response) => {
                    setGroup(prev => {
                        prev.studentInGroups.splice(deletedIndex, 1);
                        return prev;
                    })
                    swtoast.success({ text: "Delete successfully", timer: 1500 })
                })
                .catch((error) => {
                    console.log("error : ", error);
                    swtoast.error({ text: "Delete fail", timer: 1500 })
                })
        }, studentName, "Student was deleted");
        return;
    }

    const getGroupDetail = async () => {
        await apiClient.get('/Group(' + groupId + ')', {})
            .then((response) => {
                setGroup(response.data);
                setStatistics(response.data);
                console.log("Group detail: ", response.data);
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const setStatistics = (statisticsData) => {
        setTotalCompletedBooking(statisticsData.completedBooking);
        setTotalUpcomingBooking(statisticsData.upcomingBooking);
        setTotalPendingBooking(statisticsData.pendingBooking);
    }

    const handleCloseModal = () => {
        setIsShowAddModal(false);
    }

    const handleRemoveGroup = async () => {
        await swConfirmDelete(async () => {
            await apiClient.delete("/Group(" + groupId + ")", {})
                .then((response) => {
                    swtoast.success({ text: "Delete successfully", timer: 1500 })
                })
                .catch((error) => {
                    swtoast.error({ text: "Delete fail", timer: 1500 })
                })
        }, group.name, "Group was Deleted");
        navigate("/student-manage");
        return;
    }

    useEffect(() => {
        getGroupDetail();
    }, [])

    return (
        <div className='min-h-screen bg-indigo-50/50 py-8 px-6 sm:px-10'>
            {isShowAddModal && (
                <div 
                    onClick={() => setIsShowAddModal(false)} 
                    className="overflow-y-auto overflow-x-hidden bg-slate-900/75 backdrop-blur-sm fixed top-0 right-0 left-0 z-50 justify-center flex items-center w-full h-[calc(100%)]"
                >
                    <AddStudentInGroupModal 
                        handleCloseModal={handleCloseModal} 
                        getGroupDetail={getGroupDetail} 
                        group={group} 
                    />
                </div>
            )}
            
            <div className='max-w-7xl mx-auto'>
                <div className='flex flex-col lg:flex-row gap-8'>
                    <div className='lg:w-3/4'>
                        {/* Header */}
                        <div className='mb-8'>
                            <button
                                onClick={() => navigate("/student-manage")}
                                className="flex items-center mb-3 text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                <span className="text-sm font-semibold">Back to Group Management</span>
                            </button>
                            <h1 className='text-3xl font-bold text-indigo-800'>Group Overview</h1>
                            <p className='text-slate-600 mt-1'>
                                Manage students and view activity for {group ? group.name : "loading..."}
                            </p>
                        </div>
                        
                        {/* Statistics Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                            {/* Completed Bookings */}
                            <div className='rounded-xl shadow-sm bg-gradient-to-br from-[#6B75CC] to-[#5A63B5] p-6 flex flex-col justify-between hover:shadow-md transition-all'>
                                <div className='flex items-center mb-4'>
                                    <div className='p-2 rounded-lg backdrop-blur-sm bg-white/20'>
                                        <FaBook className="text-white" size={20} />
                                    </div>
                                    <div className='text-white text-lg font-semibold ml-3'>Completed</div>
                                </div>
                                <div className='text-white text-3xl font-bold'>
                                    {totalCompletedBooking != null 
                                        ? (totalCompletedBooking < 10 ? "0" + totalCompletedBooking : totalCompletedBooking) 
                                        : "..."}
                                </div>
                                <div className='text-indigo-200 text-sm mt-1'>Total completed bookings</div>
                            </div>
                            
                            {/* Upcoming Bookings */}
                            <div className='rounded-xl shadow-sm bg-gradient-to-br from-[#5E81FC] to-[#4A6DE5] p-6 flex flex-col justify-between hover:shadow-md transition-all'>
                                <div className='flex items-center mb-4'>
                                    <div className='p-2 rounded-lg backdrop-blur-sm bg-white/20'>
                                        <FaCalendarAlt className="text-white" size={20} />
                                    </div>
                                    <div className='text-white text-lg font-semibold ml-3'>Upcoming</div>
                                </div>
                                <div className='text-white text-3xl font-bold'>
                                    {totalUpcomingBooking != null 
                                        ? (totalUpcomingBooking < 10 ? "0" + totalUpcomingBooking : totalUpcomingBooking) 
                                        : "..."}
                                </div>
                                <div className='text-blue-200 text-sm mt-1'>Upcoming sessions</div>
                            </div>
                            
                            {/* Pending Bookings */}
                            <div className='rounded-xl shadow-sm bg-gradient-to-br from-[#7F8DE1] to-[#6B75CC] p-6 flex flex-col justify-between hover:shadow-md transition-all'>
                                <div className='flex items-center mb-4'>
                                    <div className='p-2 rounded-lg backdrop-blur-sm bg-white/20'>
                                        <FaClock className="text-white" size={20} />
                                    </div>
                                    <div className='text-white text-lg font-semibold ml-3'>Pending</div>
                                </div>
                                <div className='text-white text-3xl font-bold'>
                                    {totalPendingBooking != null 
                                        ? (totalPendingBooking < 10 ? "0" + totalPendingBooking : totalPendingBooking) 
                                        : "..."}
                                </div>
                                <div className='text-indigo-200 text-sm mt-1'>Awaiting approval</div>
                            </div>
                        </div>

                        {/* Student Section */}
                        <div className='mb-6 flex justify-between items-center'>
                            <h2 className='text-2xl font-bold text-indigo-800'>
                                Students in {group ? group.name : "..."}
                            </h2>
                            <div className='flex space-x-3'>
                                <button
                                    onClick={handleRemoveGroup}
                                    className="flex items-center gap-2 text-white bg-rose-500 hover:bg-rose-600 font-semibold rounded-[20px] text-sm px-4 py-2 transition-all duration-300"
                                >
                                    <FaTrash size={14} />
                                    <span>Delete Group</span>
                                </button>
                                <button 
                                    onClick={() => setIsShowAddModal(true)}
                                    className="flex items-center gap-2 text-white bg-[#6B75CC] hover:bg-opacity-90 font-semibold rounded-[20px] text-sm px-4 py-2 transition-all duration-300"
                                >
                                    <FaUserPlus size={14} />
                                    <span>Add Student</span>
                                </button>
                            </div>
                        </div>

                        {/* Student Table */}
                        <div className='bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden'>
                            <div className="overflow-x-auto">
                                <table className='w-full'>
                                    <thead>
                                        <tr className="bg-indigo-50/80 border-b border-indigo-100">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                No
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Avatar
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Code
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group?.studentInGroups.map((element, index) => (
                                            <tr 
                                                key={element.id} 
                                                className="border-b border-indigo-50 hover:bg-indigo-50/30 transition-all duration-200"
                                            >
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <img 
                                                        className='w-10 h-10 object-cover rounded-full border border-indigo-100' 
                                                        src={element.avatar} 
                                                        alt={element.studentName}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                                    {element.studentName}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {element.studentCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {element.gmail}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        element.status 
                                                            ? "bg-green-100 text-green-800" 
                                                            : "bg-slate-100 text-slate-800"
                                                    }`}>
                                                        {element.status ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        className="bg-rose-100 text-rose-600 hover:bg-rose-200 px-3 py-1 rounded-lg text-xs font-medium flex items-center transition-colors"
                                                        onClick={() => handleDeleteStudentInGroup(element.studentInGroupId, element.studentName, index)}
                                                    >
                                                        <FaTrash className="mr-1" size={12} />
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar */}
                    <div className='lg:w-1/4'>
                        <div className='mb-6'>
                            <h2 className='text-2xl font-bold text-indigo-800'>Upcoming Labs</h2>
                            <p className='text-slate-600 text-sm mt-1'>Schedule for this week</p>
                        </div>
                        
                        <div className='bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden'>
                            {group && <WeekCalendar studentsInGroup={group.studentInGroups} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GroupDetailPage;