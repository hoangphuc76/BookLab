import { useState, useRef, useEffect } from "react"
import apiClient from "../services/ApiClient";
import { swtoast } from "../utils/swal";

const SearchStudent = ({ setGroups, setTeam, groupName }) => {
    const inputRef = useRef(null);
    const [students, setStudents] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [mockTime, setMockTime] = useState(0)


    const handleChangeInput = async () => {
        await apiClient.get("/Account/searchStudent", {
            params: { input: inputValue }
        }).then((response) => {
            console.log("search L: ", response);
            setStudents(response.data);
        }).catch((error) => {
            setStudents(null)
            console.log("error search");
        })

    }


    const handleBlur = (e) => {
        if (e.relatedTarget && e.relatedTarget.id == "fuck") {
            return;
        }

        setStudents(null)
    }
    const handleAddStudent = (index) => {
        setGroups(prev => {
            console.log("before add : ", prev);
            const buff = [];
            let check = true;
            prev[groupName].forEach(element => {
                buff.push(element);
                if (element.accountDetail.studentId == students[index].studentId) {
                    check = false;
                }

            });
            if (!check) {
                swtoast.error({ text: "duplicate student " + students[index].fullName })
                return prev;
            }

            buff.push({ accountDetail: students[index] });
            setTeam(buff);

            prev[groupName].push({ accountDetail: students[index] });



            console.log("after add : ", prev);
            return prev;
        })
    }
    useEffect(() => {
        inputRef.current.focus();
    }, [])

    useEffect(() => {
        if (!inputValue || inputValue.trim() == "" || inputValue.length < 2) {
            setStudents(null)
            return;
        }

        const outTimeId = setTimeout(() => {
            handleChangeInput()
        }, 1500)

        return () => { clearTimeout(outTimeId) }
    }, [inputValue])



    return (
        <div>
            <div>

                <div class="relative border-t-[2px] border-[#EEEFF1]">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>

                    <input ref={inputRef} value={inputValue} onChange={(e) => { setInputValue(e.target.value) }} onBlur={handleBlur} type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 rounded-lg bg-gray-50 border  focus:outline-none focus:ring-2 focus:ring-[#5259C8]"
                        placeholder="Search student" required />
                    <div id="hi" className="absolute top-full left-0 w-full z-20 ">
                        {students != null && students.length > 0 ? (
                            <div className="rounded-[10px] border-[2px] border-[#5259C8] mt-2 backdrop-blur-md shadow-md z-30">

                                {students.map((student, index) => {
                                    return (
                                        <div id="fuck" tabIndex={-1} key={index} onClick={() => {
                                            handleAddStudent(index);
                                            setStudents(null);
                                            setInputValue("");
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

            </div>
        </div>
    )
}
export default SearchStudent

//tabIndex make the div can be focusable