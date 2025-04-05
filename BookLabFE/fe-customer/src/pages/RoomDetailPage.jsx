import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Tooltip } from "react-tooltip";
import { Star } from "lucide-react";

import BookTab from "../features/ViewRoomBooking/BookTab";
import {
  AddUserIcon,
  CalendarIcon,
  HeartIcon,
  LocationIcon,
  PeopleIcon,
  RightArrowIcon,
  ShareIcon,
  StarIcon,
  TvIcon,
  VirtualGlassIcon,
  WifiIcon,
} from "../icons";
import CalendarRoomDetail from "../features/ViewRoomBooking/CalendarRoomDetail";
import apiClient from "../services/ApiClient";
import ViewFeedback from "../features/ViewRoomBooking/ViewFeedback";
import StarRating from "../features/ViewRoomBooking/StarRating";
import { swtoast } from "../utils/swal";
import { NotificationProvider } from "../features/ViewRoomBooking/context/NotificationContext";
import BookLabCalendar from "../pages/RoomBooking/BookLabCalendar.jsx"

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [imageRoom, setImageRoom] = useState([]);
  const [favourite, setFavourite] = useState(false);
  const [countFeedback, setCountFeedback] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [slotes, setSlotes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [canFeedback, setCanFeedback] = useState(false);
  const [reviewFeedbacks, setReviewFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { accountDetail, userId } = useSelector((state) => state.profile);

  useEffect(() => {
    const fetchRoomApi = async (roomId) => {
      await apiClient
        .get("/Room(" + roomId + ")")
        .then((response) => response.data)
        .then((json) => {
          setRoom({ ...json });
        })
        .catch((error) => { });
    };

    const fetchImageRoomApi = async (roomId) => {
      await apiClient
        .get("/ImageRoom(" + roomId + ")/Room")
        .then((response) => response.data)
        .then((json) => {
          setImageRoom([...json]);
        })
        .catch((error) => {
          setImageRoom([
            "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6129967%2Fpexels-photo-6129967.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D3%26h%3D750%26w%3D1260&w=1080&q=75",
            "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F7163619%2Fpexels-photo-7163619.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
            "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6527036%2Fpexels-photo-6527036.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
            "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6969831%2Fpexels-photo-6969831.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
            "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6438752%2Fpexels-photo-6438752.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
          ]);
        });
    };

    const fetchSlotesApi = async () => {
      await apiClient
        .get("/Slot")
        .then((response) => response.data)
        .then((json) => {
          const formattedSlots = json.map((slot) => ({
            ...slot,
            // openTime: slot.openTime.slice(0, -3),
            // closeTime: slot.closeTime.slice(0, -3),
          }));
          setSlotes([...formattedSlots]);
        })
        .catch((error) => {
          setSlotes([
            { id: 1, openTime: "7:00 am", closeTime: "9:15 am" },
            { id: 2, openTime: "9:30 am", closeTime: "11:45 am" },
            { id: 3, openTime: "00:30 pm", closeTime: "2:45 pm" },
            { id: 4, openTime: "3:00 pm", closeTime: "5:15 pm" },
          ]);
        });
    };

    const fetchFeedbacks = async (roomId) => {
      await apiClient
        .get("/Feedback(" + roomId + ")/Room")
        .then((response) => response.data)
        .then((json) => {
          setReviewFeedbacks([...json]);
        })
        .catch((error) => {
          setReviewFeedbacks([
            {
              avatar:
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2024/8/4/1375780/Chuong-Nhuoc-Nam-1A.jpg",
              name: "Nhuoc nam",
              time: "Jan 21 2025",
              rating: 4.2,
              feedbackDescription:
                "All of these conditions are quite modern and safe. I'll pick you next time.",
            },
            {
              avatar:
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2024/8/4/1375780/Chuong-Nhuoc-Nam-1A.jpg",
              name: "Jane Doe",
              time: "Feb 15 2025",
              rating: 3.7,
              feedbackDescription:
                "Good experience overall, but there's room for improvement.",
            },
            {
              avatar:
                "https://media-cdn-v2.laodong.vn/storage/newsportal/2024/8/4/1375780/Chuong-Nhuoc-Nam-1A.jpg",
              name: "John Smith",
              time: "Mar 3 2025",
              rating: 5,
              feedbackDescription:
                "Excellent facilities and service. Highly recommended!",
            },
          ]);
        });
    };

    const fetchCanFeedback = async (roomId) => {
      await apiClient
        .get("/Feedback(" + roomId + ")/CanFeedback")
        .then((response) => response.data)
        .then((json) => {
          setCanFeedback(json);
        })
        .catch((error) => {
          setCanFeedback(false);
        });
    };

    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchRoomApi(roomId),
          fetchImageRoomApi(roomId),
          fetchSlotesApi(),
          fetchFeedbacks(roomId),
          fetchCanFeedback(roomId),
        ]);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchAllData();

    // (async () => await fetchRoomApi(roomId))();
    // (async () => await fetchImageRoomApi(roomId))();
    // (async () => await fetchSlotesApi())();
    // (async () => await fetchFeedbacks(roomId))();
    // (async () => await fetchCanFeedback(roomId))();
  }, []);

  useEffect(() => {
    setCountFeedback(reviewFeedbacks.length);
  }, [reviewFeedbacks]);

  const handleFavourite = () => {
    setFavourite(!favourite);
  };

  const handleComment = (e) => {
    const value = e.target.value;
    setFeedback(value);
  };

  const handleSendFeedback = async () => {
    const fetchFeedbackAPI = async (feedback) => {
      await apiClient
        .post("/Feedback", feedback)
        .then((response) => {
          const newFeedback = {
            avatar: accountDetail.avatar,
            fullname: accountDetail.fullName,
            time: feedback.time,
            rating: rating,
            feedbackDescription: feedback.feedbackDescription,
          };
          setReviewFeedbacks((prevFeedbacks) => [
            newFeedback,
            ...prevFeedbacks,
          ]);
          setFeedback("");
          setRating(0);
          setHoveredRating(0);

          swtoast.success({ text: "Feedback successful", position: "top-end" });
        })
        .catch((error) => {
          console.error("Error: ", error);
          swtoast.error({
            text: `Feedback failed: ${error.response.data.detail}`,
          })
        });
    }

    var date = dayjs(new Date());
    var dateStr = date.format("YYYY-MM-DDTHH:mm:ss");
    const feedbackModel = {
      feedbackDescription: feedback,
      rating: rating,
      time: dateStr,
      status: true,
      lecturerId: userId,
      subBookingId: "00000000-0000-0000-0000-000000000000",
      roomId: roomId,
    };
    await fetchFeedbackAPI(feedbackModel);
  };

  const handleDateSelect = useCallback((datesWithSlots) => {
    setTimeout(() => {
      setSelectedDate(datesWithSlots);
    }, 0);
  }, []);

  const handleSelectSlot = (index) => {
    setSelectedDate((prev) => ({
      ...prev,
      slots: prev.slots.map((slot, i) =>
        i === index ? { ...slot, status: true } : slot
      ),
    }));
  };

  const updateSlotStatus = useCallback((index) => {
    setSelectedDate((prevDatepicker) => ({
      ...prevDatepicker,
      slots: prevDatepicker.slots.map((slot, i) =>
        i === index ? { ...slot, status: false } : slot
      ),
    }));
  }, []);

  useEffect(() => { }, [selectedDate]);
  console.log("imageRoom", imageRoom)
  return (
    <NotificationProvider>
      <div className="container mx-auto px-32 pt-20">
        <div>
          <div id="room-image" className=" aspect-[7/3]">
            <div className="grid grid-cols-2 gap-2 h-full">
              <div className="h-full">
                <img
                  className="h-full rounded-xl object-cover"
                  src={imageRoom[0]?.imageURL}
                  alt="Room Image 1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 h-full">
                {imageRoom.slice(1, 5).map((image, index) => (
                  <div className="h-full" key={index}>
                    <img
                      className="rounded-xl h-full"
                      src={image.imageURL}
                      alt={"Room Image"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="relative z-10 mt-10 flex flex-col lg:flex-row">
              <div className="w-full space-y-8 lg:space-y-10 pr-[32px]">
                <div className="rounded-xl border-[1px] border-[#e5e7e] p-[16px] lg:p-[32px]">
                  <div className="flex items-center justify-between">
                    <span className="nc-Badge inline-flex px-2.5 py-1 rounded-full font-medium text-xs relative text-blue-800 bg-blue-100  relative">
                      {room?.categoryRoom?.name}
                    </span>
                    <div className="flow-root">
                      <div className="-mx-3 -my-1.5 flex text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="flex cursor-pointer rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                          <ShareIcon />
                          <span className="ms-2.5 hidden sm:block">Share</span>
                        </span>
                        <span
                          className="flex cursor-pointer rounded-lg px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          onClick={handleFavourite}
                        >
                          <HeartIcon
                            fill={favourite ? "#ef4444" : "none"}
                            className={favourite ? "text-red-500" : ""}
                          />
                          <span className="ms-2.5 hidden sm:block">Save</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-left ext-2xl font-semibold sm:text-3xl lg:text-4xl mt-[24px]">
                    {room?.name}
                  </h2>
                  <div className="flex items-center gap-x-4 mt-[24px]">
                    <div
                      className="nc-StartRating flex items-center space-x-1 text-sm "
                      data-nc-id="StartRating"
                    >
                      <div className="pb-[2px]">
                        <StarIcon />
                      </div>
                      <span className="font-medium">{room?.rating}</span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        ({countFeedback})
                      </span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center">
                      <LocationIcon />
                      <span className="ms-1">{room?.building?.campus.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-[24px]">
                    <div>
                      <img
                        className="rounded-full object-cover w-12 h-12"
                        src={room?.manager ? room?.manager.accountDetail.avatar : `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0xgBPJkpeg_-4nq3JXqjFghG_eAiaopFo5A&s`}
                      />
                    </div>
                    <span className="ms-2.5 text-neutral-500 dark:text-neutral-400">
                      Hosted by{" "}
                      <span className="font-semibold text-blue-600 dark:text-yellow-400">
                        {room?.manager?.accountDetail.fullName}
                      </span>
                    </span>
                  </div>
                  <div className="w-full border-b border-neutral-100 dark:border-neutral-700 mt-[24px]"></div>
                  <div className="flex items-center justify-between mt-[24px] gap-x-8 text-sm text-neutral-700 dark:text-neutral-300 xl:justify-start xl:gap-x-12">
                    <div className="flex items-center gap-x-3">
                      <PeopleIcon />
                      <span className="">
                        {room?.capacity}{" "}
                        <span className="hidden sm:inline-block">People</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border-[1px] border-[#e5e7e] p-[16px] lg:p-[32px] ">
                  <div className="text-left">
                    <h2 className="text-2xl font-semibold">Amenities </h2>
                    <span className="mt-2 block text-neutral-500 dark:text-neutral-400">
                      About the property's amenities and services
                    </span>
                  </div>
                  <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 mt-[32px]"></div>
                  <div className="mt-[32px] grid grid-cols-1 xl:grid-cols-3 gap-6 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="flex items-center gap-x-3">
                      <WifiIcon />
                      <span>Fast wifi</span>
                    </div>
                    {/* <div className="flex items-center gap-x-3">
                                          <SoundIcon />
                                          <span>Sound system</span>
                                      </div> */}
                    <div className="flex items-center gap-x-3">
                      <TvIcon />
                      <span>TVs smart</span>
                    </div>
                    <div className="flex items-center gap-x-3">
                      <VirtualGlassIcon />
                      <span>TVs smart</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border-[1px] border-[#e5e7e] p-[16px] lg:p-[32px] ">
                  <div className="text-left">
                    <h2 className="text-2xl font-semibold mb-5">Calendar </h2>
                  </div>
                {room && <BookLabCalendar room={room}/>}
                </div>

                <div className="rounded-xl border-[1px] border-[#e5e7e] p-[16px] lg:p-[32px] ">
                  <h2 className="text-2xl font-semibold text-left">
                    Reviews ({countFeedback} reviews)
                  </h2>
                  <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 mt-[32px]"></div>
                  <div className="mt-[32px]">
                    <StarRating rating={room?.rating} />
                    <div
                      className="relative mt-[20px]"
                      data-tooltip-id="feedback-tooltip"
                      data-tooltip-content="Please make a book to be able to write a feedback!"
                      data-tooltip-place="top"
                      data-tooltip-delay-show="500"
                      data-tooltip-delay-hide="300"
                      data-tooltip-variant="error"
                      data-tooltip-hidden={canFeedback}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-[#e5e7eb] dark:border-neutral-700 pr-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={!canFeedback}
                            className={`transition-colors ${!canFeedback && "cursor-not-allowed opacity-50"
                              }`}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                          >
                            <Star
                              className={`h-5 w-5 ${star <= (hoveredRating || rating)
                                ? "fill-orange-500 text-orange-500 "
                                : "fill-none text-gray-300"
                                }`}
                            />
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        className="block w-full rounded-3xl border-[1px] border-[#e5e7e] pl-[180px] pr-16 py-3 bg-white focus:border-primary-300 focus:ring 
                        focus:ring-primary-200 focus:ring-opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600 
                        dark:focus:ring-opacity-25 h-16 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Share your thoughts ..."
                        value={feedback}
                        onChange={handleComment}
                        disabled={!canFeedback}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (async () => await handleSendFeedback())();
                          }
                        }}
                      />
                      <button
                        className="absolute top-1/2 -translate-y-1/2 right-3 flex w-12 h-12 rounded-full text-white items-center justify-center bg-[#6366F1]
                        disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleSendFeedback}
                        disabled={!canFeedback}
                      >
                        <RightArrowIcon />
                      </button>
                    </div>
                    <Tooltip
                      id="feedback-tooltip"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                      opacity={1}
                      arrowColor="#dc2626"
                    />
                  </div>
                  <div id="comment-list" className="mt-[50px] space-y-6">
                    {reviewFeedbacks.map((item, index) => (
                      <ViewFeedback key={index} {...item} />
                    ))}
                  </div>
                </div>
                <div className="h-96"></div>
              </div>
              {/* {
                <BookTab
                  room={room}
                  datepicker={selectedDate}
                  updateSlotStatus={updateSlotStatus}
                  countFeedback={countFeedback}
                />
              } */}
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default RoomDetailPage;
