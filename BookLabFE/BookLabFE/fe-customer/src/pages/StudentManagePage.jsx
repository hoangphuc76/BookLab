import React, { useState, useEffect } from 'react';
import { readListStudentFile } from '../utils/excelUtils';
import CreateGroupModal from '../components/CreateGroupModal';
import apiClient from '../services/ApiClient';
import { RightArrowIcon, DownloadIcon, PlusIcon } from '../icons/Icons';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaTimes, FaSearch, FaArrowRight } from 'react-icons/fa';

const StudentManagePage = () => {
    const [isModalGroup, setIsModalGroup] = useState(false);
    const [inputGroups, setInputGroups] = useState({});
    const [dataGroups, setDataGroups] = useState(null);
    const [isAddNewGroup, setIsAddNewGroup] = useState(false);
    const [openedGroup, setOpenedGroup] = useState(null);
    const [typeModal, setTypeModal] = useState(1);
    const [clickedGroup, setClickedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleCloseModal = () => {
        setIsModalGroup(false);
        setInputGroups({});
    }

    const handleFileChange = async (event) => {
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
        setIsAddNewGroup(true);
        setIsModalGroup(true);
        setOpenedGroup(null);
        setTypeModal(2);
    }

    const handleOpenGroup = (studentInGroup) => {
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

    // Filter groups based on search term
    const filteredGroups = dataGroups ? 
        Object.entries(dataGroups).filter(([_, studentInGroup]) => 
            studentInGroup[0].groupName.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/Group/GetGroupsOfLecturer');
                setDataGroups(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='min-h-screen bg-indigo-50/50 p-6 sm:p-8'>
            {isModalGroup && (
                <CreateGroupModal 
                    typeModal={typeModal} 
                    openedGroup={openedGroup} 
                    isAddNewGroup={isAddNewGroup} 
                    inputGroups={inputGroups} 
                    getImportGroup={setDataGroups} 
                    handleCloseModal={handleCloseModal} 
                    allGroup={dataGroups} 
                />
            )}
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-indigo-800 flex items-center">
                        <FaUsers className="mr-3 text-indigo-600" />
                        Group Management
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Create and manage student groups for your courses
                    </p>
                </div>
                
                <div className='flex h-full'>
                    <div id='viewGroupList' className={`${clickedGroup ? 'w-2/3 pr-4' : 'w-full'} transition-all duration-300 ease-in-out`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 hover:shadow-md transition-all p-5 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="relative w-full max-w-md">
                                    <div className="relative">
                                        <input 
                                            type="search" 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-2.5 pl-11 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
                                            placeholder="Search group name..." 
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex">
                                    <button 
                                        onClick={() => document.getElementById('fileInput').click()} 
                                        type="button" 
                                        className="flex items-center justify-center gap-2 text-white bg-[#6B75CC] hover:bg-opacity-90 font-semibold rounded-[20px] text-sm px-5 py-2.5 me-2 mb-2 transition-all duration-300"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        <span>Import Group</span>
                                    </button>
                                    <button 
                                        onClick={handleOpenAddNewGroup} 
                                        type="button" 
                                        className="flex items-center justify-center gap-2 text-gray-700 font-semibold bg-white hover:bg-gray-100 border border-gray-300 rounded-[20px] text-sm px-5 py-2.5 me-2 mb-2 transition-all duration-300"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        <span>Add Group</span>
                                    </button>
                                    <input id="fileInput" type='file' accept='.xlsx, .xls' onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>
                            </div>
                        </div>

                        {dataGroups && Object.keys(dataGroups).length > 0 ? (
                            <h2 className="font-semibold text-lg text-indigo-800 mb-4">Available Groups</h2>
                        ) : (
                            <div className="bg-white rounded-2xl p-10 text-center border border-indigo-100">
                                <FaUsers className="mx-auto text-4xl text-indigo-300 mb-3" />
                                <h3 className="text-xl font-semibold text-indigo-800 mb-2">No Groups Yet</h3>
                                <p className="text-slate-600 mb-6">Create your first group to get started</p>
                                <button
                                    onClick={handleOpenAddNewGroup}
                                    className="inline-flex items-center px-4 py-2 bg-[#6B75CC] text-white rounded-[20px] hover:bg-opacity-90 transition-colors font-semibold"
                                >
                                    <PlusIcon className="mr-2 w-5 h-5" />
                                    Create New Group
                                </button>
                            </div>
                        )}

                        <div className={`grid ${clickedGroup ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'} gap-6`}>
                            {filteredGroups.map(([groupId, studentInGroup]) => {
                                const isActive = groupId === clickedGroup;
                                
                                return (
                                    <div
                                        onClick={() => handleClickGroup(groupId, studentInGroup)}
                                        key={groupId}
                                        className={`shape_group transition-all duration-300 cursor-pointer
                                            ${isActive 
                                                ? "bg-gradient-to-br from-[#6B75CC] to-[#5A63B5] text-white border-none shadow-xl shadow-[#6B75CC]/40 transform scale-[1.03]" 
                                                : "bg-white hover:bg-gradient-to-br hover:from-[#F8F9FF] hover:to-[#E8EBFF] border-2 border-[#6B75CC]/30 hover:border-[#6B75CC] hover:shadow-lg hover:shadow-[#6B75CC]/30 hover:transform hover:scale-[1.02]"}
                                            relative overflow-hidden`}
                                        style={{
                                            boxShadow: isActive ? '0 10px 25px -5px rgba(107, 117, 204, 0.4)' : '0 4px 6px -1px rgba(107, 117, 204, 0.1)',
                                        }}
                                    >
                                        {/* Add decorative elements for more visual punch */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full 
                                            ${isActive ? "bg-white/10" : "bg-[#6B75CC]/5"}`}></div>
                                        <div className={`absolute bottom-0 left-0 w-16 h-16 -ml-8 -mb-8 rounded-full 
                                            ${isActive ? "bg-white/5" : "bg-[#6B75CC]/3"}`}></div>
                                        
                                        <div className="p-6 relative z-10">
                                            <div className={`text-xs tracking-wide mb-3 font-semibold ${isActive ? "text-white" : "text-[#6B75CC]"}`}>
                                                with students
                                            </div>

                                            <div className="flex ml-3 mb-6">
                                                {studentInGroup.slice(0, 3).map((student, index) => (
                                                    <img
                                                        key={index}
                                                        src={student.avatar}
                                                        className={`w-9 h-9 object-cover rounded-full ${
                                                            isActive ? "border-white shadow-md" : "border-[#6B75CC] shadow-sm"
                                                        } -ml-3 ${isActive ? "" : "hover:transform hover:scale-110 hover:z-10"} transition-all`}
                                                        alt={`${student.fullName}`}
                                                    />
                                                ))}
                                                {studentInGroup.length > 3 && (
                                                    <div
                                                        className={`w-9 h-9 flex items-center justify-center rounded-full border-2 
                                                            ${isActive 
                                                                ? "border-white shadow-md" 
                                                                : "border-[#6B75CC] shadow-sm"
                                                            } -ml-3 transition-all`}
                                                    >
                                                        <div className={`rounded-full w-8 h-8 
                                                            ${isActive 
                                                                ? "bg-white text-[#6B75CC]" 
                                                                : "bg-[#6B75CC]/10 text-[#6B75CC]"} 
                                                            flex items-center justify-center font-semibold text-sm`}>
                                                            +{studentInGroup.length - 3}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <div className={`text-xs mb-1 font-semibold uppercase ${isActive ? "text-white/80" : "text-gray-500"}`}>
                                                    GROUP NAME
                                                </div>
                                                <div className={`text-lg font-semibold flex justify-between items-center ${isActive ? "text-white" : "text-gray-800"}`}>
                                                    <span className="truncate">{studentInGroup[0].groupName}</span>
                                                    {isActive ? (
                                                        <div className="bg-white/20 p-1.5 rounded-full">
                                                            <FaArrowRight className="text-white" size={14} />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-[#6B75CC]/10 p-1.5 rounded-full group-hover:bg-[#6B75CC]/20">
                                                            <FaArrowRight className="text-[#6B75CC]" size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {clickedGroup && (
                        <div id='viewListStudent' className={`w-1/3 bg-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-all h-min relative ${clickedGroup ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                            <div className="p-5 border-b border-indigo-100 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-indigo-800">
                                    Students in Group
                                </h2>
                                <button
                                    onClick={() => {
                                        setClickedGroup(null);
                                        setOpenedGroup(null);
                                    }}
                                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                    aria-label="Close details"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            <div className="p-4 max-h-[500px] overflow-y-auto">
                                {openedGroup?.map((student, index) => (
                                    <div
                                        key={index}
                                        className="bg-indigo-50/60 rounded-xl flex items-center gap-3 p-3 mb-3 hover:bg-indigo-100 transition-colors animate-fadeIn"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex-shrink-0">
                                            <img
                                                src={student.avatar}
                                                className="w-12 h-12 object-cover rounded-lg border border-indigo-100"
                                                alt={student.fullName}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-800">
                                                {student.fullName}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                @{student.studentCode}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-indigo-100 mt-auto">
                                <button 
                                    onClick={handleClickGroupDetail} 
                                    type="button" 
                                    className="w-full flex items-center justify-center gap-2 text-white bg-[#6B75CC] hover:bg-opacity-90 font-semibold rounded-[20px] text-sm px-5 py-2.5 transition-all duration-300"
                                >
                                    <span>View Group Details</span>
                                    <FaArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default StudentManagePage;

