import { useState, useEffect, useCallback } from "react";
import GroupModal from "../../components/GroupModal";
import apiClient from "../../services/ApiClient";
import { swtoast } from "../../utils/swal";
import { createPortal } from "react-dom";



const GroupModalUpdatingBooking = ({
    typeModal,
    inputGroups,
    handleCloseModal,
    subBookingId,
    currentSubBooking
}) => {
    console.log("current subbooking : ", currentSubBooking)


    const [devTool, setDevTool] = useState(null);
    const [groups, setGroups] = useState(inputGroups);
    const [quantity, setQuantity] = useState([0, 0]);
    const handleToolOpen = (divRef) => {
        setDevTool((prev) => {
            if (prev == null) {
                divRef.hidden = false;
                return divRef;
            }
            if (prev != divRef) {
                prev.hidden = true;
                divRef.hidden = false;
                return divRef;
            }
            prev.hidden = true;
            return null;
        });
    };

    const handleQuantity = (inputGroups) => {
        let studentQuantity = 0;
        let groupQuantity = 0;
        inputGroups.map((group) => {
            let check = false;
            group.map((student) => {
                if (student.accountDetail.isBookingNew) {
                    studentQuantity++;
                    check = true
                }
            })
            if (check) {
                groupQuantity++;
            }
        })
        setQuantity([studentQuantity, groupQuantity])
    }

    const handleCancelSaveQuantity = () => {
        console.log("cancel check")

        groups.map((group) => {
            group.map((student) => {
                student.accountDetail.isBookingNew = student.accountDetail.inBooking
            })
        })
    }

    const handleUpdateQuantity = () => {
        if (currentSubBooking.approve == 10) {
            swtoast.error({ text: "Booking was approved", timer: 1500 });
            return;
        }
        const updatingGroup = {};
        groups.map((group) => {
            group.map((student) => {
                if (student.accountDetail.isBookingNew) {
                    if (!updatingGroup[student.accountDetail.groupId]) {
                        updatingGroup[student.accountDetail.groupId] = []
                    }
                    updatingGroup[student.accountDetail.groupId].push(student.accountDetail.studentInGroup);

                }

            })
        })
        apiClient.post('/Booking/updateQuantitySubBooking', updatingGroup, {
            params: {
                subBookingId: subBookingId
            }
        }).then((response) => {
            if (response.status == 200) {
                let studentNum = 0;
                let groupNum = 0;
                groups.map((group) => {
                    let check = false;
                    group.map((student) => {
                        if (student.accountDetail.isBookingNew) {
                            studentNum++;
                            check = true;
                        }
                        student.accountDetail.inBooking = student.accountDetail.isBookingNew
                    })
                    if (check) groupNum++;
                })
                currentSubBooking.studentQuantity = studentNum;
                currentSubBooking.groupQuantity = groupNum;

                swtoast.success({ text: 'Update student successfully' })
                handleCloseModal();
            }
        }).catch((error) => {
            swtoast.error({ text: error.message, timer: 1500 })
        })
    }
    const handleClose = () => {
        handleCancelSaveQuantity();
        handleCloseModal();
    }


    useEffect(() => {
        handleQuantity(inputGroups)

    }, [])

    return createPortal(
        <div
            onClick={handleClose}
            id="default-modal"
            tabindex="-1"
            aria-hidden="true"
            className={`overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed inset-0 z-40 justify-center flex items-center w-full md:inset-0 h-[calc(100%)] max-h-full`}
        >

            <div
                class={`relative p-4 w-full max-w-2xl `}
            >
                <div
                    onClick={(e) => {
                        setDevTool((prev) => {
                            if (prev != null) {
                                prev.hidden = true;
                            }
                            return null;
                        });
                        e.stopPropagation();
                    }}
                    class="relative w-full p-4 bg-white rounded-lg "
                >
                    {/* Chia làm 2 phần */}
                    <div className="flex w-full flex-col">

                        <div className={` w-full  p-4 `}>
                            <div className="flex mb-4 justify-between">
                                <div className="text-xl font-bold">
                                    My Groups
                                </div>
                                <div className="font-bold font-mono">
                                    {quantity[0] + ' students / ' + quantity[1] + ' groups'}
                                </div>

                            </div>

                            <div>
                                <div className="overflow-y-auto h-52 md:h-72 lg:h-[560px]">
                                    {console.log("test : ", groups)}
                                    {
                                        groups ? groups.map((group) => (
                                            <GroupModal
                                                typeModal={typeModal}
                                                key={group[0].accountDetail.groupName}
                                                isOpenedSearch={false}
                                                groupName={group[0].accountDetail.groupName}
                                                group={group}
                                                setGroups={setGroups}
                                                handleToolOpen={handleToolOpen}
                                                isUpdateBooking={true}
                                                handleQuantity={handleQuantity}
                                                isApproved={currentSubBooking.approve == 10 ? true : false}

                                            />
                                        )) : null
                                    }
                                </div>
                            </div>
                            <div className="flex flex-row-reverse">
                                {currentSubBooking.approve == 0 ? <button onClick={handleUpdateQuantity} className="rounded-md bg-[#5259C8] px-5 pt-2 pb-3 text-white"  >
                                    save
                                </button> : <button onClick={handleCloseModal} className="rounded-md bg-[#5259C8] px-5 pt-2 pb-3 text-white"  >
                                    leave
                                </button>}



                            </div>

                        </div>


                    </div>
                </div>
            </div>
        </div>, document.body
    );
};

export default GroupModalUpdatingBooking;

//every component child should have key.
//useState(isAddNewGroup) takes the value of isAddNewGroup at the time of the initial render and does not update if isAddNewGroup changes later.
//never use async in useEffect
//Vấn đề của bạn là vì React coi hai component <GroupModal /> trong toán tử ternary isOpen ? <GroupModal /> : <GroupModal /> là hai component riêng biệt, nhưng chúng được render với cùng một tập props. Khi isOpen thay đổi, React sẽ không "unmount" rồi "remount" mà chỉ giữ nguyên một trong hai và không kích hoạt useEffect chạy lại.
//Khi bạn thêm một <Modal key={1} /> mới với props khác nhưng cùng key=1, React sẽ tái sử dụng component cũ thay vì tạo mới. Điều này xảy ra do React reconciliation.
