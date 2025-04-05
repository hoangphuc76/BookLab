import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { readListStudentFile } from '../utils/excelUtils';
import CreateGroupModal from '../components/CreateGroupModal';
import apiClient from '../services/ApiClient';
import { RightArrowIcon, DownloadIcon, PlusIcon } from '../icons/Icons';
import { useNavigate } from 'react-router-dom';



const StudentManagePage = () => {
    console.log("!Open StudentManagePage");
    const [isModalGroup, setIsModalGroup] = useState(false)
    const [inputGroups, setInputGroups] = useState({})
    const [dataGroups, setDataGroups] = useState(null);
    const [isAddNewGroup, setIsAddNewGroup] = useState(false);
    const [openedGroup, setOpenedGroup] = useState(null);
    const [typeModal, setTypeModal] = useState(1);
    const [clickedGroup, setClickedGroup] = useState(null);
    const navigate = useNavigate();

    const handleCloseModal = () => {
        console.log("=handleCloseModal ? StudentManagePage");
        setIsModalGroup(false);
        setInputGroups({});
    }
    const handleFileChange = async (event) => {
        console.log("=handleFileChange ? StudentManagePage");
        const file = event.target.files[0];
        if (file) {
            const data = await readListStudentFile(file);

            const headerArrays = [];
            data.forEach((student) => {
                headerArrays.push(student.studentID);
            })
            const checkAccountDetails = {};
            await apiClient.get('/Group/checkstudentcode', {
                headers: {
                    list: JSON.stringify(headerArrays),
                },
            })
                .then((response) => {
                    response.data.forEach((accountDetail) => {
                        checkAccountDetails[accountDetail.studentId] = accountDetail;
                    })
                })
                .catch((error) => {
                    return;
                })

            const groups = {};
            data.forEach((student) => {
                if (!groups[student.groupName]) {
                    groups[student.groupName] = [];
                }
                let studentDetail = {
                    student: student,
                    accountDetail: checkAccountDetails[student.studentID] ? checkAccountDetails[student.studentID] : null
                }

                groups[student.groupName].push(studentDetail);
            });
            setIsModalGroup(true);
            setInputGroups(groups);
            setOpenedGroup(null);
            setIsAddNewGroup(false);
            setTypeModal(1);
            event.target.value = "";
        }


    }
    const handleClickGroup = (groupId, studentInGroup) => {
        console.log("click group ");
        setClickedGroup(prev => {
            if (prev == groupId) {
                setOpenedGroup(null);
                return null;
            }
            else {
                setOpenedGroup(studentInGroup);
                return groupId;
            }
        })
    }

    const handleOpenAddNewGroup = () => {
        console.log("=handleOpenAddNewGroup ? StudentManagePage");
        setIsAddNewGroup(true);
        setIsModalGroup(true);
        setOpenedGroup(null);
        setTypeModal(2);
    }

    const handleOpenGroup = (studentInGroup) => {
        console.log("=handleOpenGroup ? StudentManagePage");
        const groups = {}

        studentInGroup.forEach((student) => {
            if (!groups[student.groupName]) {
                setOpenedGroup(student.groupId);
                setIsAddNewGroup(false);
                groups[student.groupName] = [];
            }
            let studentDetail = {
                accountDetail: {
                    id: student.studentId,
                    avatar: student.avatar,
                    fullName: student.fullName,
                    studentId: student.studentCode,

                }
            }
            groups[student.groupName].push(studentDetail)

        })

        setInputGroups(groups);
        setIsModalGroup(true);
        setTypeModal(3);
    }

    const handleClickGroupDetail = () => {
        if (clickedGroup) {
            navigate("/student-manage/" + clickedGroup)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            console.log("=useEffect ? StudentManagePage");
            try {
                const response = await apiClient.get('/Group/GetGroupsOfLecturer');
                setDataGroups(response.data);
                console.log("data response : ", response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData(); // Call the async function

        return () => {
            console.log("Cleanup function executed.");
        };
    }, []);




    return (
        <div className='ml-[60px] mr-[60px] mt-[30px] bg-[#EFF2F9] h-[80%] rounded-lg'>
            {isModalGroup ? (
                <CreateGroupModal typeModal={typeModal} openedGroup={openedGroup} isAddNewGroup={isAddNewGroup} inputGroups={inputGroups} getImportGroup={setDataGroups} handleCloseModal={handleCloseModal} allGroup={dataGroups} />
            ) : null}
            <div className='flex h-full'>
                <div id='viewGroupList' className={`pb-8 pt-6 pl-10 ${clickedGroup ? 'w-2/3' : 'w-full pr-10'} max-h-[600px] overflow-y-auto transition-all duration-500 ease-in-out`}>
                    <div className='flex justify-between '>
                        <div>
                            <form class="max-w-md mx-auto">
                                <div class="flex">
                                    <label for="location-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Your Email</label>
                                    <div class="relative w-full  ">
                                        <input type="search" id="location-search" class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-white rounded-[10px]   " placeholder="group name" required />
                                        <button type="submit" class="absolute top-0 end-0 h-full p-2.5 text-sm font-medium text-gray-900  ">
                                            <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                            </svg>
                                            <span class="sr-only">Search</span>
                                        </button>
                                    </div>
                                </div>
                            </form>


                        </div>
                        <div className='flex'>
                            <button onClick={() => document.getElementById('fileInput').click()} type="button" class="flex text-white bg-[#6B75CC] hover:bg-opacity-75 font-medium rounded-[20px] text-sm px-5 py-2.5 me-2 mb-2 ">
                                <DownloadIcon />
                                Import Group
                            </button>
                            <button onClick={handleOpenAddNewGroup} type="button" class="flex text-gray-500 font-mono bg-white hover:bg-gray-300 hover:text-white font-medium rounded-[20px] text-sm px-5 py-2.5 me-2 mb-2 ">
                                <PlusIcon />
                                Add Group
                            </button>
                            <input id="fileInput" type='file' accept='.xlsx, .xls' onChange={handleFileChange} style={{ display: 'none' }} />

                        </div>
                    </div>
                    <div className='font-mono font-bold pl-2 text-lg'>{dataGroups && Object.keys(dataGroups).length > 0 ? 'Available Group' : 'Let make your own group'}</div>

                    <div className='mt-10'>

                        <div className={`grid ${clickedGroup ? 'grid-cols-3' : 'grid-cols-5'} content-start gap-6`}>

                            {
                                dataGroups ? Object.entries(dataGroups).map(([groupId, studentInGroup], index) => {
                                    const isActive = groupId === clickedGroup;
                                    console.log("helo : ", groupId)

                                    return (
                                        <div
                                            onClick={() => handleClickGroup(groupId, studentInGroup)}
                                            key={groupId}
                                            className={`shape_group transition-colors duration-300 ${isActive ? "bg-[#6B75CC]" : "bg-white hover:bg-[#6B75CC] hover:bg-opacity-75"
                                                }`}
                                        >
                                            <div className="pl-8 pt-8 pb-12">
                                                <div className="text-xs text-gray-300 font-mono font-medium tracking-wide">WITH STUDENTS</div>

                                                <div className="flex mt-2 ml-3">
                                                    {console.log("student in group : ", studentInGroup)}
                                                    {studentInGroup.slice(0, 3).map((student, index) => (

                                                        <img
                                                            key={index}
                                                            src={student.avatar}
                                                            className={`w-8 h-8 object-cover rounded-full border-2 ${isActive ? "border-white" : "border-[#6B75CC]"
                                                                } -ml-3`}
                                                            alt="User"
                                                        />
                                                    ))}
                                                    {studentInGroup.length > 3 ? (
                                                        <div
                                                            className={`w-8 h-8 flex items-center justify-center border-2 border-dashed rounded-full ${isActive ? "border-white" : "border-[#6B75CC]"
                                                                } -ml-3`}
                                                        >
                                                            <div className='rounded-full w-7 h-7 bg-white flex items-center justify-center'>
                                                                +{studentInGroup.length - 3}
                                                            </div>

                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="pl-8">
                                                <p className="text-xs text-gray-300 font-mono font-medium tracking-wide">Group</p>
                                                <p className={`text-lg font-semibold font-mono ${isActive ? "text-white" : "text-black"}`}>
                                                    {studentInGroup[0].groupName}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }) : null

                            }
                        </div>
                    </div>

                </div>
                {
                    clickedGroup ? (
                        <div id='viewListStudent' className={`w-1/3 relative bg-white rounded-r-lg border-[#EFF2F9] border-2 pt-6 px-4 ${clickedGroup ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
                            }`}>
                            {/* Thêm nút X ở góc trên bên phải */}
                            <button
                                onClick={() => {
                                    setClickedGroup(null);
                                    setOpenedGroup(null);
                                }}
                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="font-mono font-bold pl-2 text-lg">Student In Group</div>
                            <div className="max-h-[450px] overflow-y-auto">
                                {openedGroup?.map((student, index) => (
                                    <div
                                        key={index}
                                        className="student-item rounded-lg bg-[#EFF2F9] flex p-2 mt-4 hover:bg-[#6B75CC] hover:bg-opacity-75 transition-colors duration-300 opacity-0 translate-y-4 animate-slideIn"
                                    >
                                        <div>
                                            <img
                                                src={student.avatar}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="pl-2 mt-2">
                                            <div className="text-base font-semibold font-mono">{student.fullName}</div>
                                            <div className="text-xs text-gray-300 font-mono font-medium">{student.studentCode}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className='absolute w-full bottom-0 flex justify-center'>
                                <button onClick={handleClickGroupDetail} type="button" className="flex text-white font-mono bg-[#6B75CC] hover:bg-opacity-75 font-medium rounded-[20px] text-sm px-16 py-2 me-2 mb-2">
                                    Go to detail
                                </button>
                            </div>
                        </div>
                    ) : null
                }

            </div>


        </div>
    )
}

export default StudentManagePage;

