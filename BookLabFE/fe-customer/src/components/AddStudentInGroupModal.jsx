import { useEffect, useState, useRef } from "react";
import apiClient from "../services/ApiClient";
import { useParams } from "react-router-dom";
import { XIcon } from "../icons";
import { swtoast } from "../utils/swal";
import Title from "antd/es/skeleton/Title";
const AddStudentInGroupModal = ({ handleCloseModal, getGroupDetail, group }) => {
    console.log("group L: ", group)
    const inputRef = useRef(null);
    const { groupId } = useParams();
    const [students, setStudents] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [buffStudents, setBuffStudents] = useState([]);


    const handleChangeInput = async (e) => {
        setInputValue(e.target.value);
        if (e.target.value.length > 1) {
            await apiClient.get("/Account/searchStudent", {
                params: { input: e.target.value }
            }).then((response) => {
                console.log("search L: ", response);
                setStudents(response.data);
            }).catch((error) => {
                console.log("error search");
            })

        }
        else {
            setStudents(null)
        }
    }

    const handleBlur = (e) => {
        if (e.relatedTarget && e.relatedTarget.id == "fuck") {
            return;
        }

        console.log("bully shit");
        setStudents(null)
    }
    const handleAddStudent = (index) => {
        console.log("student index : ", students[index])
        console.log("student in group : ", group.studentInGroups)
        setBuffStudents(prev => {
            const checkDuplicatedStudent = group.studentInGroups.filter(element => element.studentId == students[index].studentId).length > 0 ? true : false;
            if (checkDuplicatedStudent) {
                swtoast.warning({ text: "This Student was existed in Group" });
                return prev;

            }
            return [...prev, students[index]]
        })

    }
    const handleRemoveStudent = (index) => {
        setBuffStudents(prev => {
            prev.splice(index, 1)
            return [...prev];
        });
    }

    const handleAddStudentToGroup = async () => {
        const body = buffStudents.map(student => student.id);
        await apiClient.post(`/StudentInGroup/AddStudentsInGroup?groupId=${encodeURIComponent(groupId)}`, body)
            .then(async (response) => {
                console.log("Response:", response);
                await getGroupDetail();
                handleCloseModal();
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }


    useEffect(() => {
        inputRef.current.focus();
    }, [])
    return (
        <div onClick={(e) => {
            e.stopPropagation();
        }} class={`relative p-4 w-full max-w-2xl  `}>
            <div className="relative w-full p-4 bg-white h-[500px] rounded-lg ">
                <div className="text-2xl font-mono font-bold mb-4" > Adding Student</div>
                <div className="rounded-[10px] border-[2px] border-[#EEEFF1] mb-4" >
                    <div id="ngu">
                        <div class="relative border-t-[2px] border-[#EEEFF1]">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                </svg>
                            </div>

                            <input ref={inputRef} value={inputValue} onChange={handleChangeInput} onBlur={handleBlur} type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 rounded-lg bg-gray-50 border  focus:outline-none focus:ring-2 focus:ring-[#5259C8]"
                                placeholder="Search student" required />
                            <div id="hi" className="absolute top-full left-0 w-full z-20 ">
                                {students != null && students.length > 0 ? (
                                    <div className="rounded-[10px] border-[2px] border-[#5259C8] mt-2 backdrop-blur-md shadow-md z-30">

                                        {students.map((student, index) => {
                                            return (
                                                <div id="fuck" tabIndex={-1} key={index} onClick={(e) => {
                                                    handleAddStudent(index);
                                                    setStudents(null);
                                                    setInputValue("");
                                                    e.stopPropagation();
                                                    inputRef.current.focus();
                                                }} className="flex justify-between p-3 hover:bg-[#5259C8] rounded-[8px] cursor-pointer">
                                                    <div className="flex justify-between items-center">

                                                        <div className="text-[#5259C5]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                                        </svg>
                                                        </div>
                                                        <div className="ml-3"><img className="object-cover h-[28px] w-[28px] rounded-md" src={student.avatar} /></div>
                                                        <div className="flex ml-3">
                                                            <div className="text-[#c7c7c9]">@{student.studentId}/</div>

                                                            <div>{student.fullName}</div>
                                                        </div>


                                                    </div>

                                                </div>
                                            )
                                        })}

                                    </div>
                                ) : null}
                            </div>
                        </div>
                        {buffStudents.length > 0 ? buffStudents.map((student, index) => {
                            return (
                                <div key={index} className="flex justify-between border-t-[2px] border-[#EEEFF1] p-3">
                                    <div className="flex justify-between items-center">
                                        <div className="text-[#5259C5]"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                        </svg>
                                        </div>
                                        <div className="ml-3"><img className="object-cover h-[28px] w-[28px] rounded-md" src={student.avatar} /></div>
                                        <div className="flex ml-3">
                                            <div className="text-[#c7c7c9]">@{student.studentId}/</div>

                                            <div>{student.fullName}</div>
                                        </div>


                                    </div>
                                    <div className="relative"

                                        onClick={(e) => {
                                            handleRemoveStudent(index)
                                            e.stopPropagation()
                                        }}>
                                        <XIcon className={'hover:text-red-400'} />
                                        {/* <div id="tool-box" ref={(el) => (divRefs.current[index] = el)} onClick={(e) => {
                                            e.stopPropagation();
                                        }} hidden className="absolute -translate-x-1/2 z-10">
                                            <div className={`rounded-lg bg-white border-2 inline-block border-[#5259C8]`}>
                                                <div className="border-b-2 border-[#5259C8] p-1">Modify</div>
                                                <div onClick={(e) => {
                                                    // handleDeleteStudent(index, divRefs.current[index]);
                                                }} className="text-red-500 font-bold hover:text-white hover:bg-red-500 rounded-b-md p-1">Delete</div>
                                            </div>
                                        </div> */}

                                    </div>
                                </div>
                            )

                        }) : null}
                    </div>
                </div>
                <div className="absolute right-4 bottom-4">
                    <button
                        onClick={handleAddStudentToGroup}
                        className="font-mono rounded-md transition-all duration-300 bg-[#FFBD77] hover:bg-[#ffaa56] px-5 pt-2 pb-3 text-white"
                    >
                        Push
                    </button>
                </div>
            </div>

        </div>
    )
}

export default AddStudentInGroupModal