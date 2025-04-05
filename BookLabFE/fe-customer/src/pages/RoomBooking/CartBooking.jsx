import { useState, useRef } from "react";
import { format, endOfWeek, startOfWeek } from "date-fns"
import { CalendarIcon, RightChevronArrowIcon, XIcon } from "../../icons"
import apiClient from "../../services/ApiClient";
import { swConfirmBooking, swtoast } from "../../utils/swal";
import { useNavigate } from "react-router";
import { text } from "@fortawesome/fontawesome-svg-core";
import { time } from "framer-motion";
import { createPortal } from "react-dom";

const CartBooking = ({ handleRemoveSubBooking, subBookingCart, overflowDivRef, setFirstDayOfWeek, setEndDayOfWeek, setIsCreateSubBooking, setCurrentEventBox, roomId, openViewDay, handleShowCart, CategoryDescription}) => {
    const navigate = useNavigate();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const textAreaRef = useRef(null);
    const [moreDescription, setMoreDescription] = useState("");
    const [choseReason, setChoseReason] = useState("")

    const handleFocusSubBooking = (subBooking) => {
        if (openViewDay) return;
        setCurrentEventBox(subBooking);
        setIsCreateSubBooking(true);
        setFirstDayOfWeek(prev => {
            if (prev > new Date(subBooking.date) || endOfWeek(new Date(prev), { weekStartsOn: 1 }) < new Date(subBooking.date)) {
                setEndDayOfWeek(endOfWeek(new Date(subBooking.date), { weekStartsOn: 1 }));
                return startOfWeek(new Date(subBooking.date), { weekStartsOn: 1 });
            }
            return prev;
        })
        overflowDivRef.current.scrollTo({
            top: subBooking.top - 25,
            behavior: "smooth",
        });
    }

    const handleCloseBookingModal = () => {
      setIsBookingModalOpen(false);
      setBookingDescription("");
    };

    const handleOnChangeReason = (event) => {
      setChoseReason(event.target.value);
      if (event.target.value == "Other") {
        textAreaRef.current.hidden = false;
      } else {
        textAreaRef.current.hidden = true;
      }
    };

    const handleOnchangeDescription = (event) => {
      setMoreDescription(event.target.value);
    };

    const fetchBookingApi = async () => {
        const booking = {
            roomId: roomId,
            descriptionId: CategoryDescription.find((value) => value.name == choseReason).id,
            moreDescription: choseReason == "Other" ? moreDescription : "",
            type: 0,
            date: format(new Date(), "yyyy-MM-dd") + "T00:00:00",
        }

        const listSubBooking = {};
        Object.values(subBookingCart).map((dateSubBooking, i) => {
            Object.keys(dateSubBooking).map((subId, j) => {
                const buff = {}
                buff.classId = dateSubBooking[subId].classId ?? "";
                buff.groupIds = dateSubBooking[subId].groupsId;
                buff.areaId = "";
                buff.private = dateSubBooking[subId].isPrivate ? 1 : 0;
                buff.typeSlot = dateSubBooking[subId].typeSlot;
                buff.startTime = dateSubBooking[subId].startTime;
                buff.endTime = dateSubBooking[subId].endTime;
                buff.date = dateSubBooking[subId].date;
                buff.reason = dateSubBooking[subId].reason;
                listSubBooking[subId] = buff;
            })
        })
        const bookings = {
            booking,
            listSubBooking,
        }
        await apiClient.post("/Booking", bookings)
            .then((response) => {
                if(response.status == 200){
                    swtoast.success({ text: "Booking successful", timer: 1500 });
                    navigate(0);
                }else if (response.status == 400){
                    console.log("reponse: ", response)
                    swtoast.error({ text: `Booking failed: ${response.detail}`, timer: 1500})
                }
            })
            .catch((error) => {
                console.log("reponse: ", error.response.data.detail.split('\n'))
                if(error.response.data.detail.includes('\n')){
                    error.response.data.detail.split('\n').slice(0,-1).forEach((value) => {
                        console.log("fuckkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk: ", value)
                        swtoast.error({ text: `${value}`, timer: 5000 })
                    })
                }else {
                    swtoast.error({ text: `Booking failed: ${error.response.data.detail}`, timer: 1500 })
                }
                
                // swtoast.error({ text: `Booking failed: ${error.response.data.detail}`, timer: 5000 })
            })

        handleCloseBookingModal();

    }
    
    const handleBooking = () => {

        if (Object.keys(subBookingCart) == 0) {
            swtoast.error({ text: "your cart is empty", timer: 1500 })
            return;
        }
        setIsBookingModalOpen(true)
    }

    const handleBookingModel = () => {
      if (choseReason == '') {
        swtoast.warning({ text: "you haven't filled in reason yet", time: 2000 })
        return;
      }
      setIsBookingModalOpen(false)
      swConfirmBooking(fetchBookingApi, "", "")
    }

    return (
      <>
        {isBookingModalOpen ? createPortal(
          <div
            id="booking-description-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed top-0 right-0 left-0 z-[1000] justify-center flex items-center 
              w-full h-full"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseBookingModal();
            }}
          >
            <div
              className="relative p-4 w-full max-w-md max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Booking Details
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={handleCloseBookingModal}
                  >
                    <XIcon className="w-5 h-5" />
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                  <div>
                    <form class="max-w-sm mx-auto">
                        <select onChange={handleOnChangeReason} id="small" class="block w-full p-2 mb-2 text-sm font-mono text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            <option selected = {!choseReason}>Choose certain reason</option>
                            {CategoryDescription?.map((element) => {
                                return (
                                    <option selected={choseReason == element.name ? true : false} value={element.name}>{element.name}</option>
                                )
                            })}
                        </select>
                    </form>
                    <form hidden={choseReason != "Other"} ref={textAreaRef} class="max-w-sm mx-auto">
                        <textarea value={moreDescription} onChange={(event) => { handleOnchangeDescription(event) }} id="message" rows="4" class="block font-mono p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a reason..."></textarea>
                    </form>
                  </div>
                </div>
                <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                  <button
                    type="button"
                    className="text-white bg-[#5259C8] hover:bg-[#4347A5] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    onClick={handleBookingModel}
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                    onClick={handleCloseBookingModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>, document.body
        ) : null}

        <div className="rounded-3xl bg-white/50 backdrop-blur-sm  w-full p-4">
          <div className="flex justify-between items-end mb-8">
            <div className="text-2xl font-bold font-mono">New booking</div>
            <div
              onClick={handleShowCart}
              className="font-mono underline cursor-pointer"
            >
              Hide
            </div>
          </div>
  
          <div className="h-[480px] relative overflow-auto rounded-3xl ">
            {Object.keys(subBookingCart).map((date, i) => {
              const dateSubBooking = subBookingCart[date];
              return Object.keys(dateSubBooking).map((id, index) => {
                return (
                  <div
                    id={`fa_${i + "_" + index}`}
                    className="backdrop-blur-xl p-6 rounded-3xl h-36 mb-4 bg-gray-100 shadow-lg"
                  >
                    <div className="flex justify-between mb-6">
                      <div className="flex space-x-2">
                        <div className="text-white p-1 bg-[#575555] font-mono rounded-lg">
                          {dateSubBooking[id].startTime.slice(0, 5)}
                        </div>
                        <div className="text-white p-1 bg-[#575555] font-mono rounded-lg">
                          {dateSubBooking[id].endTime.slice(0, 5)}
                        </div>
                      </div>
                      <div className="relative flex">
                        <div
                          onClick={() => {
                            handleRemoveSubBooking(date, id);
                          }}
                          className="p-1 absolute right-[45px] cursor-pointer rounded-full bg-white hover:p-2 hover:text-white hover:bg-[#f96c48] transform  transition-all duration-200 ease-in-out "
                        >
                          {" "}
                          <XIcon />{" "}
                        </div>
                        <div
                          onClick={() => {
                            handleFocusSubBooking(dateSubBooking[id]);
                          }}
                          className="p-1 absolute right-[5px] cursor-pointer rounded-full bg-white hover:p-2 hover:text-white hover:bg-[#33D29C] transform  transition-all duration-200 ease-in-out "
                        >
                          <RightChevronArrowIcon />
                        </div>
                      </div>
                    </div>
  
                    <div className="font-bold font-mono">
                      {format(dateSubBooking[id].date, "yyyy-MM-dd")}
                    </div>
                    <div className="text-base font-mono">
                      {dateSubBooking[id].studentQuantity} members
                    </div>
                  </div>
                );
              });
            })}
          </div>
          <div className=" font-bold font-mono bottom-4 flex w-full justify-center">
            <button
              onClick={handleBooking}
              className="rounded-lg bg-gray-200 w-2/3 p-2 hover:bg-[#33D29C] hover:text-white transition-all duration-500"
            >
              Booking
            </button>
          </div>
        </div>
      </>
    );
}
export default CartBooking