import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { AddUserIcon, CalendarIcon, XIcon } from "../../icons";
import CreateGroupModal from "../../components/CreateGroupModal";
import apiClient from "../../services/ApiClient";
import { swtoast } from "../../utils/swal";
import { useBookingNotifications } from "../../services/BookingNotificationService"
import BookingNotification from "./BookingNotification"
import NotificationBadge from "./NotificationBadge"
import NotificationsPanel from "./NotificationsPanel"

const BookTab = ({ room, datepicker, updateSlotStatus, countFeedback }) => {
  console.log("!Open BookTab");
  console.log("date picker  : ", datepicker);
  const [isModalGroup, setIsModalGroup] = useState(false);
  const [listBooking, setListBooking] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [typeModal, setTypeModal] = useState(4);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingDescription, setBookingDescription] = useState("")
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false)

  // Get real-time booking notifications
  const { notifications, dismissNotification, dismissAllNotifications } = useBookingNotifications()

  // Show toast notifications only for the most recent 3
  const recentNotifications = notifications.slice(0, 3)

  const handleRemoveSlot = (date, index) => {
    setListBooking((prev) => {
      const newListBooking = { ...prev };
      newListBooking[date] = [...prev[date]];
      newListBooking[date][index] = {
        ...newListBooking[date][index],
        status: false,
        groups: {},
        groupIds: [],
        totalStudents: 0,
      };
      return newListBooking;
    });
  };

  useEffect(() => {
    if (datepicker) {
      if (!listBooking[datepicker.date]) {
        setListBooking((prev) => {
          console.log("Checkkkkkkkkkkk ko có");
          console.log({ ...prev, [datepicker.date]: datepicker.slots });
          return { ...prev, [datepicker.date]: datepicker.slots };
        });
      } else {
        setListBooking((prev) => {
          datepicker.slots.map((slot, index) => {
            slot.status ? (prev[datepicker.date][index].status = true) : null;
          });
          console.log("Checkkkkkkkkkkk đã có");
          console.log({ ...prev });
          return { ...prev };
        });
      }
    }
  }, [datepicker]);

  const calculateTotalPeople = (groupsInSlot) => {
    let total = 0;
    Object.keys(groupsInSlot).map((keyGroup) => {
      total += groupsInSlot[keyGroup].length;
    });
    return total;
  };

  const handleConfirmGroupToCart = (date, groupsData) => {
    console.log("GroupData: ", groupsData);
    const groupIds = Object.values(groupsData).map(
      (group) => group[0].accountDetail.groupId
    );

    if (date) {
      setListBooking((prev) => {
        prev[date][selectedSlot].groups = groupsData;
        prev[date][selectedSlot].totalStudents =
          calculateTotalPeople(groupsData);
        prev[date][selectedSlot].groupIds = groupIds;
        return prev;
      });
    }
    setIsModalGroup(false);
  };

  const handleCloseModal = () => {
    setIsModalGroup(false);
  };

  const handeleBooking = () => {
    setIsBookingModalOpen(true)
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false)
    setBookingDescription("")
  }

  const handleSubmitBooking = async () => {
    var date = dayjs(new Date())
    var dateStr = date.format("YYYY-MM-DD")
    const booking = {
      description: bookingDescription,
      reason: "",
      date: dateStr,
      roomId: room.id,
    }

    const result = {}
    for (const date in listBooking) {
      const slots = listBooking[date]
      const dateObject = {}

      let hasGroupIds = false

      slots.forEach((slot) => {
        if (slot.groupIds && slot.groupIds.length > 0) {
          hasGroupIds = true
          dateObject[slot.id] = slot.groupIds
        }
      })

      if (hasGroupIds) {
        result[date] = dateObject
      }
    }

    const bookings = {
      booking,
      listBooking: result,
    }

    const fetchBookingApi = async (bookings) => {
      await apiClient
        .post("/Booking", bookings)
        .then((response) => {
          swtoast.success({ text: "Booking successful" })
          navigate(`/view-room/${room.buildingId}`)
        })
        .catch((error) => {
          console.log("Bookings: ", bookings)
          console.error("Error: ", error)
          console.error("Error message: ", error.response.data.detail)
          swtoast.error({
            text: `Booking failed: ${error.response.data.detail}`,
          })
        })
    }
    await fetchBookingApi(bookings)
    handleCloseBookingModal()
  }

  useEffect(() => {
    if (datepicker) {
      if (!listBooking[datepicker.date]) {
        setListBooking((prev) => {
          console.log("Checkkkkkkkkkkk ko có");
          console.log({ ...prev, [datepicker.date]: datepicker.slots });
          return { ...prev, [datepicker.date]: datepicker.slots };
        });
      } else {
        setListBooking((prev) => {
          datepicker.slots.map((slot, index) => {
            slot.status ? (prev[datepicker.date][index].status = true) : null;
          });
          console.log("Checkkkkkkkkkkk đã có");
          console.log({ ...prev });
          return { ...prev };
        });
      }
    }
  }, [datepicker]);

  return (
    <div id="book-tab" className="flex flex-grow relative ">
      {isModalGroup ? (
        <div
          onClick={handleCloseModal}
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className={`overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed top-0 right-0 left-0 z-50 justify-center flex items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full ${isModalGroup ? "block" : "hidden"
            }`}
        >
          <CreateGroupModal
            selectedGroupsBefore={
              selectedDate
                ? listBooking[selectedDate][selectedSlot].groups
                : null
            }
            isAddGroupToCart={true}
            handleCloseModal={handleCloseModal}
            handleConfirmGroupToCart={handleConfirmGroupToCart}
            activeStudents={
              selectedDate
                ? listBooking[selectedDate][selectedSlot].active
                : null
            }
            selectedDate={selectedDate}
          />
        </div>
      ) : null}

      {isBookingModalOpen ? (
        <div
          id="booking-description-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="overflow-y-auto overflow-x-hidden bg-[#888B93]/75 fixed top-0 right-0 left-0 z-50 justify-center flex items-center 
          w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseBookingModal()
          }}
        >
          <div className="relative p-4 w-full max-w-md max-h-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h3>
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
                  <label
                    htmlFor="booking-description"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="booking-description"
                    rows="3"
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="Enter booking description..."
                    value={bookingDescription}
                    onChange={(e) => setBookingDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-white bg-[#5259C8] hover:bg-[#4347A5] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={handleSubmitBooking}
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
        </div>
      ) : null}

      {isNotificationsPanelOpen && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setIsNotificationsPanelOpen(false)}
          onDismiss={dismissNotification}
          onDismissAll={dismissAllNotifications}
        />
      )}

      {/* Notification toast for recent notifications */}
      <BookingNotification
        notifications={recentNotifications}
        onViewAll={() => setIsNotificationsPanelOpen(true)}
        onDismiss={dismissNotification}
      />

      <div className="sticky w-full top-10 h-[400px] overflow-y-auto">
        <div className="px-[32px] py-[24px] rounded-xl border-[1px] border-[#e5e7e]">
          <div className="flex justify-between">
            <span className="text-3xl font-semibold">{room.name}</span>
            <div className="flex items-center gap-2">
              <NotificationBadge count={notifications.length} onClick={() => setIsNotificationsPanelOpen(true)} />
              <div
                className="nc-StartRating flex items-center space-x-1 text-sm "
                data-nc-id="StartRating"
              >
                <div className="pb-[2px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-[18px] w-[18px] text-orange-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <span className="font-medium">{room.rating}</span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  ({countFeedback})
                </span>
              </div>
            </div>
          </div>

          {/* Pending Bookings Section - Shows bookings with status=false */}
          {Object.keys(listBooking).some((date) =>
            listBooking[date].some(
              (slot) => slot.status === false && slot.groups && Object.keys(slot.groups).length > 0,
            ),
          ) && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Pending Booking Requests
              </h3>
              <div className="mt-2 space-y-2">
                {Object.keys(listBooking).map((date) => {
                  const pendingSlots = listBooking[date].filter(
                    (slot) => slot.status === false && slot.groups && Object.keys(slot.groups).length > 0,
                  )

                  if (pendingSlots.length > 0) {
                    return (
                      <div key={`pending-${date}`} className="text-sm">
                        <div className="font-medium text-gray-700">{date}</div>
                        {pendingSlots.map((slot, idx) => (
                          <div
                            key={`pending-slot-${idx}`}
                            className="flex items-center justify-between py-1 pl-4 border-l-2 border-amber-300"
                          >
                            <div className="text-gray-600">
                              {slot.time} - {slot.totalStudents} students
                            </div>
                            <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">
                              Awaiting approval
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          )}

          {/* listbooking đổ dữ liệu */}
          { }
          {Object.keys(listBooking).map((date) => {
            // Lọc các slot có groups khác null
            const slotsWithGroups = listBooking[date].filter(
              (slot) => slot.groups && Object.keys(slot.groups).length > 0
            );

            // Nếu có ít nhất một slot có groups khác null, hiển thị cụm ngày và slot
            if (slotsWithGroups.length > 0) {
              return (
                <React.Fragment key={date}>
                  <div className="flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-700 mt-[32px]">
                    <div className="border-neutral-200">
                      <button className="flex items-center space-x-4 py-2 px-4">
                        <div className="">
                          <CalendarIcon />
                        </div>
                        <div className="">
                          <span className="block font-semibold xl:text-lg">
                            {date}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Hiển thị các slot có groups khác null */}
                  {listBooking[date]?.map((slot, index) => {
                    if (Object.keys(slot.groups).length > 0 && slot.status) {
                      return (
                        <div
                          className="flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-700 mt-[32px]"
                          key={index}
                        >
                          <div className="border-b-[1px] border-neutral-200">
                            <div className="flex items-center justify-between py-2 px-4">
                              <div className="flex-grow">
                                <div className="block font-semibold xl:text-lg leading-none">
                                  {slot.time}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  handleRemoveSlot(date, index);
                                }}
                                className="text-red-400 hover:text-red-700 transition-colors duration-200"
                              >
                                <XIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(index);
                                setIsModalGroup(true);
                              }}
                              className="flex items-center space-x-4 py-2 px-4 "
                            >
                              <div className="">
                                <AddUserIcon />
                              </div>
                              <div className="flex ">
                                <span className="block font-semibold xl:text-lg">
                                  {slot.totalStudents}
                                </span>
                                <span className="mt-1 ml-1 block text-sm font-light leading-none text-neutral-400">
                                  student
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })}
                </React.Fragment>
              );
            }
            return null;
          })}

          {listBooking[datepicker?.date]?.filter(
            (slot) => slot.groups && Object.keys(slot.groups).length > 0
          ).length == 0 &&
            listBooking[datepicker?.date]?.filter((slot) => slot.status)
              .length > 0 && (
              <div className="flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-700 mt-[32px]">
                <div className="border-neutral-200">
                  <button className="flex items-center space-x-4 py-2 px-4">
                    <div className="">
                      <CalendarIcon />
                    </div>
                    <div className="">
                      <span className="block font-semibold xl:text-lg">
                        {datepicker.date}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

          {datepicker &&
            listBooking[datepicker.date]?.map((slot, index) => {
              if (Object.keys(slot.groups).length == 0 && slot.status) {
                return (
                  <div
                    className="flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-700 mt-[32px]"
                    key={index}
                  >
                    <div className="border-b-[1px] border-neutral-200">
                      <div className="flex items-center justify-between py-2 px-4">
                        <div className="flex-grow">
                          <div className="block font-semibold xl:text-lg leading-none">
                            {listBooking[datepicker.date][index].time}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleRemoveSlot(datepicker.date, index);
                            updateSlotStatus(index);
                          }}
                          className="text-red-400 hover:text-red-700 transition-colors duration-200"
                          aria-label="Remove slot"
                        >
                          <XIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setSelectedDate(datepicker.date);
                          setSelectedSlot(index);
                          setIsModalGroup(true);
                        }}
                        className="flex items-center space-x-4 py-2 px-4 "
                      >
                        <div className="">
                          <AddUserIcon />
                        </div>
                        <div className="flex ">
                          <span className="block font-semibold xl:text-lg">
                            {slot.totalStudents}
                          </span>
                          <span className="mt-1 ml-1 block text-sm font-light leading-none text-neutral-400">
                            student
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                );
              }
            })}

          {Object.keys(listBooking).some((date) =>
            listBooking[date].some(
              (slot) => slot.groups && Object.keys(slot.groups).length > 0
            )
          ) && (
              <div className="flex flex-row-reverse">
                <button
                  onClick={handeleBooking}
                  className="rounded-md mt-4 bg-[#5259C8] px-5 py-2 text-white hover:bg-[#4347A5] transition-colors duration-200"
                >
                  Book
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
export default BookTab;
