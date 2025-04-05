import { useState, useRef, useEffect } from "react"
import SearchStudent from "./SearchStudent"
import { RightArrowIcon, XIcon, FlagIcon, ThreeDotIcon } from "../icons";
const GroupModal = ({ typeModal, isOpenedSearch, isAddGroupToCart, isBelongToCart, groupName, group, setGroups, handleToolOpen, handlePushToCart, handleRemoveFromCart, isUpdateBooking, handleQuantity, isApproved }) => {

    const [isExpand, setIsExpand] = useState(typeModal == 4 ? false : true);
    const [isSearch, setIsSearch] = useState(isOpenedSearch);
    const [load, setLoad] = useState(true);
    const [team, setTeam] = useState(group);
    const [name, setName] = useState(groupName);
    const divRefs = useRef([]);
    const groupToolRef = useRef();
    const groupNameRef = useRef(null);
    console.log("is open search : ", isSearch, " -- ", groupName)

    const handleExpand = () => {
        setIsExpand(prev => !prev)
    }

    const handleOpenSearch = () => {
        if (typeModal == 10) return;
        setIsExpand(true);
        setIsSearch(prev => !prev);
    }


    const handleClick = (divRef) => {
        if (typeModal == 10) return;
        handleToolOpen(divRef)
    }

    const handleOpenModifyGroup = () => {
        if (typeModal == 10) return;
        groupNameRef.current.contentEditable = true;

        const range = document.createRange();
        const selection = window.getSelection();

        const textNode = groupNameRef.current.childNodes[0];
        range.setStart(textNode, textNode.length);
        selection.removeAllRanges();
        selection.addRange(range);
        groupNameRef.current.focus();
    }
    const handleConfirmModifyGroup = (e) => {

        const newName = groupNameRef.current.innerHTML.trim();
        if ((e.key != null && e.key == "Enter") || e.key == null) {
            if (newName == null || newName == "") {
                alert("new name is invalid");
                groupNameRef.current.focus();
            }
            else {
                const buffArr = [];
                const buffName = [];

                setName(newName);
                setGroups(prev => {
                    Object.keys(prev).map((key) => {
                        if (key != name) {
                            buffName.push(key);
                        }
                        else {
                            buffName.push(newName)
                        }
                        buffArr.push(prev[key]);
                        delete prev[key]
                    });
                    for (let count = 0; count < buffArr.length; count++) {
                        prev[buffName[count]] = buffArr[count];
                    }


                    console.log("new group bro : ", prev[newName])
                    return prev;
                })
                groupNameRef.current.contentEditable = false;
            }

        }


    }
    const handleDeleteGroup = () => {
        handleToolOpen(groupToolRef);
        setGroups(prev => {
            delete prev[groupName];
            return prev;
        })
    }
    const handleDeleteStudent = (index, divRef) => {
        console.log("delete")
        handleToolOpen(divRef)
        setGroups(prev => {
            console.log("before : ", prev);
            console.log("important : ", prev[name])
            const buff = [];
            for (let i = 0; i < prev[name].length; i++) {
                if (i != index) {
                    buff.push(prev[name][i])
                }
            }

            console.log("buff : ", buff);
            prev[name] = buff;
            setTeam(prev[name]);

            console.log("after : ", prev);
            return prev;

        })

    }
    const handlePushGroupToCart = () => {
        handlePushToCart(groupName, group);
    }

    const handleRemoveGroupFromCart = () => {
        handleRemoveFromCart(groupName, group);
    }

    // updating booking
    const handleChangeSelectStudent = (index) => {
        if (isApproved) {
            return;
        }

        setTeam(prev => {
            prev[index].accountDetail.isBookingNew = !prev[index].accountDetail.isBookingNew;
            setGroups(prev => {
                handleQuantity(prev);
                return prev;
            })
            return prev;
        })
        setLoad(prev => !prev)
    }


    return (
        <div className="rounded-[10px] border-[2px] border-[#EEEFF1] mb-4" >
            <div>
                <div className="flex justify-between ml-3 mt-3 mb-3 mr-2">
                    <div className="flex items-center">
                        <div onClick={handleExpand}>
                            {isExpand ? (<div className="text-[#5259C5] cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>) : (<div className="text-[#5259C5] cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>

                            </div>)}
                        </div>
                        <div ref={groupNameRef} onKeyDown={handleConfirmModifyGroup} onBlur={handleConfirmModifyGroup} id="group-name" className="text-xl font-bold ml-2 border-transparent rounded-md focus:px-2 focus:border-[#5259C8] focus:ring-2 focus:ring-[#5259C8] focus:outline-none">{name}</div>


                    </div>
                    {isAddGroupToCart ? (<div onClick={handlePushGroupToCart} className="border-2 border-[#EEEFF1] text-[#5259C5] flex items-center rounded-md pl-1 pr-1 cursor-pointer">
                        <RightArrowIcon />
                    </div>) : (isBelongToCart ? (<div onClick={handleRemoveGroupFromCart} className="border-2 border-[#EEEFF1] text-[#5259C5] flex items-center rounded-md pl-1 pr-1 cursor-pointer">
                        <XIcon />
                    </div>) : <div className="flex">
                        <div onClick={handleOpenSearch} className="group hover:bg-[#5259C5] border-2 border-[#EEEFF1] text-[#5259C5] flex items-center rounded-md pl-1 pr-1 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 group-hover:text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <div className="relative">
                            <div onClick={(e) => {
                                handleClick(groupToolRef.current);
                                e.stopPropagation()
                            }} className="group hover:bg-[#5259C5] border-2 border-[#EEEFF1] text-[#5259C5] ml-2 rounded-md cursor-pointer ">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 group-hover:text-white">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                            </div>
                            <div id="tool-box" hidden ref={groupToolRef} className="absolute -translate-x-1/3 z-10">
                                <div className={`rounded-lg bg-white border-2 inline-block border-[#5259C8]`}>
                                    <div onClick={(e) => {
                                        handleOpenModifyGroup()
                                    }} className="border-b-2 border-[#5259C8] p-1">Modify</div>
                                    <div onClick={(e) => {
                                        handleDeleteGroup()
                                    }} className="text-red-500 font-bold hover:text-white hover:bg-red-500 rounded-b-md p-1">Delete</div>
                                </div>
                            </div>

                        </div>

                    </div>)}

                </div>
                {isExpand ? (<div id="fe1945v4">
                    {console.log("is search :?? ", isSearch)}
                    {isSearch ? (<SearchStudent setGroups={setGroups} setTeam={setTeam} groupName={name} />) : null}
                    {team.length > 0 ? team.map((student, index) => {

                        return (
                            <div key={index} className="flex justify-between border-t-[2px] border-[#EEEFF1] p-3">
                                <div className="flex justify-between items-center">
                                    {isUpdateBooking ? (<div><input className="accent-[#5259C5] cursor-pointer" type="checkbox" disabled={isApproved} onClick={() => { handleChangeSelectStudent(index) }} checked={student.accountDetail.isBookingNew} /></div>) : (<div className="text-[#5259C5]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                        </svg>
                                    </div>)}

                                    <div className="ml-3"><img className="object-cover h-[28px] w-[28px] rounded-md" src={student.accountDetail ? student.accountDetail.avatar : "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-vector-600nw-1745180411.jpg"} /></div>
                                    <div className="flex ml-3">
                                        {student.accountDetail ? (<div className="text-[#c7c7c9]">@{student.accountDetail.studentId}/</div>) : (<div title="Not Found this student code" className="text-red-500">@{student.student.studentID}/</div>)}

                                        <div>{student.accountDetail ? student.accountDetail.fullName : "unknown"}</div>
                                    </div>


                                </div>
                                <div className="relative"


                                    onClick={(e) => {
                                        handleClick(divRefs.current[index])
                                        e.stopPropagation()
                                    }}>

                                    {isUpdateBooking && student.accountDetail.inBooking ? <FlagIcon className={'text-[#5259C5]'} /> : null}


                                </div>
                            </div>
                        )

                    }) : null}
                </div>) : null}


            </div>
        </div>

    )
}
export default GroupModal;