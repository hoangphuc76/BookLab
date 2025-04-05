import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../services/ApiClient';
import { BookOpenIcon, CalendarIcon } from '../icons';
import { swConfirmDelete, swtoast } from '../utils/swal';
import WeekCalendar from '../components/WeekCalendar';
import AddStudentInGroupModal from '../components/AddStudentInGroupModal';

const GroupDetailPage = () => {
    console.log("group detail page");
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [isHoverTable, setIsHoverTable] = useState(false);
    const [isShowAddModal, setIsShowAddModal] = useState(false);
    const [totalCompletedBooking, setTotalCompletedBooking] = useState(null);
    const [totalUpcomingBooking, setTotalUpcomingBooking] = useState(null);
    const [totalPendingBooking, setTotalPendingBooking] = useState(null);
    const navigate = useNavigate();

    const handleHover = () => {
        console.log("hover");
        setIsHoverTable(true);
    }
    const handleUnhover = () => {
        console.log("un hover");
        setIsHoverTable(false);
    }

    const handleDeleteStudentInGroup = (studentInGroupId, studentName, deletedIndex) => {

        swConfirmDelete(async () => {
            await apiClient.delete("/StudentInGroup(" + studentInGroupId + ")", {})
                .then((response) => {
                    console.log("repin : ", response);
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
        await apiClient.get('/Group(' + groupId + ')', {
        })
            .then((response) => {
                console.log("data response : ", response.data)
                setGroup(response.data);
                setStatistics(response.data);

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
        <div className='ml-[60px] mr-[60px]  mt-[30px] bg-[#FAFAFA] rounded-lg '>
            {isShowAddModal ? (<div onClick={() => {
                setIsShowAddModal(false)
            }} id="default-modal" tabindex="-1" aria-hidden="true" class="overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed top-0 right-0 left-0 z-50 justify-center flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full">
                <AddStudentInGroupModal handleCloseModal={handleCloseModal} getGroupDetail={getGroupDetail} group={group} />
            </div>) : null}
            <div className='p-10 flex'>
                <div className='w-3/4 pr-10'>
                    <div className='mb-8'>
                        <div className='font-bold font-mono text-2xl'>Overview</div>
                        <div></div>
                    </div>
                    <div className='grid grid-cols-3 content-start gap-4 mb-8'>
                        <div className='h-44 rounded-lg bg-[#FFBD77]  pl-8 py-8 flex flex-col justify-between '>
                            <div className='flex'>
                                <div className='p-1 rounded-lg backdrop-blur-sm bg-white/30' >
                                    <BookOpenIcon />
                                </div>
                                <div className='text-white text-xl font-mono pl-2 ' >Booking</div>
                            </div>
                            <div className='text-white text-3xl font-mono'>{totalCompletedBooking != null ? (totalCompletedBooking < 10 ? "0" + totalCompletedBooking : totalCompletedBooking) : "..."}</div>
                            <div className='text-[#ffddbc] font-mono'>Complete</div>
                        </div>
                        <div className='h-44 rounded-lg bg-[#33D29C] pl-8 py-8 flex flex-col justify-between '>
                            <div className='flex'>
                                <div className='p-1 rounded-lg backdrop-blur-sm bg-white/30' >
                                    <BookOpenIcon />
                                </div>
                                <div className='text-white text-xl font-mono pl-2 ' >Upcoming</div>
                            </div>
                            <div className='text-white text-3xl font-mono'>{totalUpcomingBooking != null ? (totalUpcomingBooking < 10 ? "0" + totalUpcomingBooking : totalUpcomingBooking) : "..."}</div>
                            <div className='text-[#9ffcdb] font-mono'>quantity</div>
                        </div>
                        <div className='h-44 rounded-lg bg-[#43A8D8] pl-8 py-8 flex flex-col justify-between '>
                            <div className='flex'>
                                <div className='p-1 rounded-lg backdrop-blur-sm bg-white/30' >
                                    <BookOpenIcon />
                                </div>
                                <div className='text-white text-xl font-mono pl-2 ' >Pending</div>
                            </div>
                            <div className='text-white text-3xl font-mono'>{totalPendingBooking != null ? (totalPendingBooking < 10 ? "0" + totalPendingBooking : totalPendingBooking) : "..."}</div>
                            <div className='text-[#9cdefc] font-mono'>Slot</div>
                        </div>
                    </div>
                    {/* 
                    <div className='grid grid-cols-3 content-start gap-4 mb-8'>
                        <div className='h-64 rounded-lg bg-white'></div>
                        <div className='col-span-2 h-64 rounded-lg bg-white'></div>
                    </div> */}

                    <div className='mb-8 flex justify-between'>
                        <div className='font-bold font-mono text-2xl'>Student in {group ? group.name : "..."}</div>
                        <div className='flex space-x-4'>
                            <button
                                className="transition-opacity duration-300 font-mono bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700"
                                onClick={() => handleRemoveGroup()}
                            >
                                Delete Group
                            </button>
                            <button onClick={() => {
                                setIsShowAddModal(true);
                            }}
                                className="text-white font-mono p-1 transition-all duration-300 bg-[#FFBD77] hover:bg-[#ffaa56] text-white px-3 py-1 rounded-md "
                            >
                                Push Student
                            </button>
                        </div>
                    </div>

                    <div className='rounded-lg bg-white flex justify-center pb-4'>
                        <table className='w-[95%] transition-transform duration-500 ease-in-out transform hover:scale-[1.02]' onMouseEnter={handleHover} onMouseLeave={handleUnhover}>
                            <thead className="font-mono text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-8">
                                        No
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Trait
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Code
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Email
                                    </th>
                                    <th scope="col" class="px-6 py-3">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='font-mono'>
                                {group?.studentInGroups.map((element, index) => (
                                    <tr key={element.id} className="group rounded-lg hover:bg-[#FFF4E8] transition-all duration-300 transform hover:translate-x-2 hover:text-[#966a3a]">
                                        <th scope="col" class="px-6 py-3 rounded-l-lg">
                                            {index}
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            <div><img className='w-12 h-12 object-cover rounded-lg' src={element.avatar} /></div>
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-sm">
                                            {element.studentName}
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-sm">
                                            {element.studentCode}
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-sm">
                                            {element.gmail}
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            {element.status ? "Active" : "Disable"}
                                        </th>
                                        {isHoverTable ? (<th scope="col" className="px-6 py-3 w-0 rounded-r-lg">
                                            <button
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700"
                                                onClick={() => handleDeleteStudentInGroup(element.studentInGroupId, element.studentName, index)}
                                            >
                                                Delete
                                            </button>
                                        </th>) : null}

                                    </tr>
                                )
                                )}
                            </tbody>
                        </table>

                    </div>

                </div>
                <div className='w-1/4'>

                    <div className='mb-8'>
                        <div className='font-bold font-mono text-2xl'>Upcoming Lab</div>
                        <div></div>
                    </div>
                    <div className='bg-white rounded-lg max-h-98 pb-6'>
                        {group && <WeekCalendar studentsInGroup={group.studentInGroups} />}



                    </div>


                </div>

            </div>


        </div>

    )
}

export default GroupDetailPage;