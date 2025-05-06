import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { Tooltip } from "react-tooltip";
import { Star } from "lucide-react";
import { FaArrowLeft } from "react-icons/fa";
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
import apiClient from "../services/ApiClient";
import ViewFeedback from "../features/ViewRoomBooking/ViewFeedback";
import StarRating from "../features/ViewRoomBooking/StarRating";
import { NotificationProvider } from "../features/ViewRoomBooking/context/NotificationContext";
import BookLabCalendar from "../pages/RoomBooking/BookLabCalendar.jsx";

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [imageRoom, setImageRoom] = useState([]);
  const [favourite, setFavourite] = useState(false);
  const [countFeedback, setCountFeedback] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [slote, setSlote] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [canFeedback, setCanFeedback] = useState(false);
  const [reviewFeedbacks, setReviewFeedbacks] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { accountDetail, userId, userCode } = useSelector(
    (state) => state.profile
  );

  // Remove activeTab state since we're showing all sections

  useEffect(() => {
    const fetchRoomApi = async (roomId) => {
      try {
        const response = await apiClient.get("/Room(" + roomId + ")");
        const roomData = response.data;
        setRoom({ ...roomData });

        // Now that we have room data with avatar, fetch images
        fetchImageRoomApi(roomId, roomData);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    const fetchImageRoomApi = async (roomId, roomData) => {
      try {
        const response = await apiClient.get("/ImageRoom(" + roomId + ")/Room");
        const imageData = response.data;
        let imageList = [...imageData];

        // Add room avatar as first image if it exists
        if (
          roomData &&
          roomData.avatar &&
          roomData.avatar !== null &&
          roomData.avatar !== ""
        ) {
          imageList.unshift({
            imageURL: roomData.avatar,
            isAvatar: true,
            id: "avatar",
            roomId: roomId,
          });
        }

        setImageRoom(imageList);
      } catch (error) {
        console.error("Error fetching room images:", error);

        // Default images
        const defaultImages = [
          "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6129967%2Fpexels-photo-6129967.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D3%26h%3D750%26w%3D1260&w=1080&q=75",
          "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F7163619%2Fpexels-photo-7163619.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
          "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6527036%2Fpexels-photo-6527036.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
          "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6969831%2Fpexels-photo-6969831.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
          "https://chisfis-nextjs.vercel.app/_next/image?url=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F6438752%2Fpexels-photo-6438752.jpeg%3Fauto%3Dcompress%26cs%3Dtinysrgb%26dpr%3D2%26h%3D750%26w%3D1260&w=640&q=75",
        ];

        // Add room avatar if available
        if (
          roomData &&
          roomData.avatar &&
          roomData.avatar !== null &&
          roomData.avatar !== ""
        ) {
          defaultImages.unshift(roomData.avatar);
        }

        const formattedImages = defaultImages.map((url, index) => ({
          imageURL: url,
          isAvatar: index === 0 && roomData && roomData.avatar ? true : false,
          id: index.toString(),
          roomId: roomId,
        }));

        setImageRoom(formattedImages);
      }
    };

    fetchRoomApi(roomId);

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
          console.error("errorFeedback: ", error);
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
          console.error("errorCanFeedback: ", error);
        });
    };

    const fetchAllFeedbackData = async (roomId) => {
      try {
        await fetchFeedbacks(roomId);
        await fetchCanFeedback(roomId);
      } catch (error) {
        console.error("Lỗi khi fetch feedback:", error);
      }
    };
    fetchAllFeedbackData(roomId);
  }, [roomId]);

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
          room.rating =
            rating != 0
              ? (room.rating *
                  reviewFeedbacks.filter((f) => f.rating != 0).length +
                  rating) /
                (reviewFeedbacks.filter((f) => f.rating != 0).length + 1)
              : room.rating;
          const newFeedback = {
            avatar: accountDetail.avatar,
            fullname: userCode,
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

          // Replace with notification popup
          setNotification({
            isOpen: true,
            type: "success",
            title: "Feedback Submitted",
            message: "Your feedback has been submitted successfully!",
            autoCloseTime: 3000,
          });
        })
        .catch((error) => {
          console.error("Error: ", error);
          // Replace with notification popup
          setNotification({
            isOpen: true,
            type: "error",
            title: "Feedback Error",
            message: `Failed to submit feedback: ${
              error.response?.data?.detail || "Unknown error occurred"
            }`,
            autoCloseTime: 5000,
          });
        });
    };

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

  // Add notification state for replacing swtoast
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    autoCloseTime: 3000,
  });

  // Function to close notification
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  // Modern Notification Popup Component
  const NotificationPopup = ({
    isOpen,
    onClose,
    type = "warning",
    title,
    message,
    autoCloseTime = 3000,
  }) => {
    useEffect(() => {
      if (isOpen && autoCloseTime > 0) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseTime);
        return () => clearTimeout(timer);
      }
    }, [isOpen, autoCloseTime, onClose]);

    if (!isOpen) return null;

    // Define styles based on type
    const styles = {
      warning: {
        bg: "from-amber-50 to-amber-100",
        border: "border-amber-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-amber-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        ),
        textTitle: "text-amber-700",
        textBody: "text-amber-600",
      },
      error: {
        bg: "from-rose-50 to-rose-100",
        border: "border-rose-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-rose-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        ),
        textTitle: "text-rose-700",
        textBody: "text-rose-600",
      },
      success: {
        bg: "from-emerald-50 to-emerald-100",
        border: "border-emerald-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-emerald-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        textTitle: "text-emerald-700",
        textBody: "text-emerald-600",
      },
      info: {
        bg: "from-sky-50 to-sky-100",
        border: "border-sky-200",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-sky-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        ),
        textTitle: "text-sky-700",
        textBody: "text-sky-600",
      },
    };

    return (
      <div className="fixed inset-0 flex items-end justify-center sm:items-start z-[100] pointer-events-none p-4 sm:p-6">
        <div
          className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300"
          style={{ animation: "fadeInUp 0.3s, fadeOutDown 0.3s forwards" }}
        >
          <div className={`rounded-lg shadow-lg overflow-hidden flex`}>
            {/* Color icon section */}
            <div className={`w-2 bg-gradient-to-b ${styles[type].bg}`}></div>

            {/* Content section */}
            <div className={`p-4 bg-white flex-1 flex`}>
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`w-10 h-10 rounded-full bg-${styles[type].bg} flex items-center justify-center`}
                >
                  {styles[type].icon}
                </div>
              </div>

              <div className="flex-1 pt-0.5">
                <h3 className={`text-sm font-medium ${styles[type].textTitle}`}>
                  {title || type.charAt(0).toUpperCase() + type.slice(1)}
                </h3>
                <div className={`mt-1 text-sm ${styles[type].textBody}`}>
                  {message}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-4 inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-indigo-600/10 to-purple-500/10 -z-10"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>

        {/* Add notification component */}
        <NotificationPopup
          isOpen={notification.isOpen}
          onClose={closeNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          autoCloseTime={notification.autoCloseTime}
        />

        <div className="container mx-auto px-4 md:px-8 lg:px-16 pt-8 pb-24 space-y-12">
          {/* Room Image Gallery */}
          <button
              onClick={() => window.history.back()}
              className="flex items-center text-indigo-700 hover:text-indigo-900 font-medium mr-4"
            >
              <FaArrowLeft className="mr-2" />
              <span>Back</span>
            </button>
          <div className="relative group">
  {/* Main Image Gallery Container */}
  <div className="aspect-[7/3] max-h-[600px] overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
    <div className="grid grid-cols-12 gap-1.5 h-full">
      {/* Main Featured Image - 50% width */}
      <div className="col-span-6 h-full relative overflow-hidden">
        <img
          className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105"
          src={imageRoom[0]?.imageURL || 'https://via.placeholder.com/800x600?text=No+Image'}
          alt={`${room?.name || 'Room'} - Main View`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm rounded-lg px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          {imageRoom[0]?.isAvatar}
        </div>
      </div>
      
      {/* Grid of 4 smaller images - 50% width */}
      <div className="col-span-6 grid grid-cols-2 grid-rows-2 gap-1.5 h-full">
        {imageRoom.slice(1, 5).map((image, index) => (
          <div className="relative overflow-hidden rounded-sm" key={index}>
            <img
              className="h-full w-full object-cover transition-all duration-700 hover:scale-110"
              src={image.imageURL || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={`${room?.name || 'Room'} - View ${index + 2}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
        
      </div>
    </div>
  </div>
</div>

          {/* SECTION 1: Room Details */}
          <section id="details" className="space-y-8 scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                />
              </svg>
              Room Details
            </h2>

            {/* Room Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {room?.categoryName}
                </span>
                <div className="flex space-x-2">
                  <button className="flex items-center justify-center rounded-full w-10 h-10 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors">
                    <ShareIcon className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    className="flex items-center justify-center rounded-full w-10 h-10 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
                    onClick={handleFavourite}
                  >
                    <HeartIcon
                      fill={favourite ? "#ef4444" : "none"}
                      className={`h-5 w-5 ${
                        favourite ? "text-red-500" : "text-gray-700"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {room?.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-amber-500 mr-1" />
                  <span className="font-medium">{room?.rating}</span>
                  <span className="text-gray-500 ml-1">
                    ({countFeedback} reviews)
                  </span>
                </div>

                <div className="flex items-center">
                  <LocationIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">{room?.campusName}</span>
                </div>

                <div className="flex items-center">
                  <PeopleIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-gray-700">
                    {room?.capacity}{" "}
                    {room?.capacity === 1 ? "Person" : "People"}
                  </span>
                </div>
              </div>

              <div className="flex items-center border-t border-gray-100 pt-6">
                <div className="flex-shrink-0">
                  <img
                    className="rounded-full object-cover w-12 h-12 border-2 border-white shadow"
                    src={
                      room
                        ? room?.managerAvatar
                        : `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0xgBPJkpeg_-4nq3JXqjFghG_eAiaopFo5A&s`
                    }
                    alt="Manager"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">
                    Hosted by{" "}
                    <span className="font-semibold text-indigo-700">
                      {room?.managerName}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100/50 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Amenities
              </h2>
              <p className="text-gray-500 mb-6">
                About the property's amenities and services
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <WifiIcon className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-700">Fast wifi</span>
                </div>

                <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <TvIcon className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-700">TVs smart</span>
                </div>

                <div className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors">
                  <VirtualGlassIcon className="h-6 w-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-700">
                    Virtual equipment
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Calendar */}
          <section id="calendar" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              Availability Calendar
            </h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100/50 p-6">
              {room && <BookLabCalendar room={room} />}
            </div>
          </section>

          {/* SECTION 3: Reviews */}
          <section id="reviews" className="scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
              Reviews ({countFeedback})
            </h2>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-amber-500 mr-1" />
                  <span className="font-medium">{room?.rating}</span>
                </div>

                <div className="mb-8">
                  <StarRating rating={room?.rating} />
                </div>
              </div>

              {/* Add Review Input */}
              <div
                className="relative mb-10"
                data-tooltip-id="feedback-tooltip"
                data-tooltip-content="Please make a book to be able to write a feedback!"
                data-tooltip-place="top"
                data-tooltip-delay-show="500"
                data-tooltip-delay-hide="300"
                data-tooltip-variant="error"
                data-tooltip-hidden={canFeedback}
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-1 mr-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={!canFeedback}
                        className={`transition-colors ${
                          !canFeedback && "cursor-not-allowed opacity-50"
                        }`}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= (hoveredRating || rating)
                              ? "fill-amber-500 text-amber-500"
                              : "fill-none text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Select your rating
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-5 py-4 pr-14 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring focus:ring-indigo-100 disabled:bg-gray-100"
                    placeholder="Share your thoughts..."
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
                    className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:bg-gray-400 hover:bg-indigo-700 transition-colors"
                    onClick={handleSendFeedback}
                    disabled={!canFeedback}
                  >
                    <RightArrowIcon className="h-5 w-5" />
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

              {/* Review List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewFeedbacks.map((item, index) => (
                  <ViewFeedback key={index} {...item} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default RoomDetailPage;
