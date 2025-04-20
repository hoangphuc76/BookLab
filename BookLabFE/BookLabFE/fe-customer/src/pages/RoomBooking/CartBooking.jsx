import { useState, useRef, useEffect, useCallback } from "react";
import { format, endOfWeek, startOfWeek } from "date-fns"
import { CalendarIcon, RightChevronArrowIcon, XIcon } from "../../icons"
import apiClient from "../../services/ApiClient";
import { swConfirmBooking, swtoast } from "../../utils/swal";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// New Error Popup Component
const ErrorPopup = ({ isOpen, onClose, title, errors }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Error Header */}
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-4 border-b border-rose-200">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-rose-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-rose-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 pr-10">
              <h3 className="text-lg font-medium text-rose-700">
                {title || "Booking Error"}
              </h3>
              <p className="text-sm text-rose-600 mt-1">
                Please address the following issues to complete your booking:
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Error Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-auto">
          {typeof errors === 'string' ? (
            <div className="py-2 text-gray-700">{errors}</div>
          ) : Array.isArray(errors) ? (
            <ul className="list-disc pl-5 space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="text-gray-700">{error}</li>
              ))}
            </ul>
          ) : (
            <div className="py-2 text-gray-700">An unexpected error occurred.</div>
          )}
        </div>
        
        {/* Error Footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const CartBooking = ({ handleRemoveSubBooking, subBookingCart, overflowDivRef, setFirstDayOfWeek, setEndDayOfWeek, setIsCreateSubBooking, setCurrentEventBox, roomId, openViewDay, handleShowCart, CategoryDescription, activeStudents,
  activeGroups,
  onlyGroupStatus}) => {
    const navigate = useNavigate();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const textAreaRef = useRef(null);
    const [moreDescription, setMoreDescription] = useState("");
    const [choseReason, setChoseReason] = useState("");
    const modalRef = useRef(null);
    
    // New error popup state
    const [errorPopup, setErrorPopup] = useState({
      isOpen: false,
      title: "",
      errors: []
    });

    // Add these at the top with other state variables
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalGroups, setTotalGroups] = useState(0);

    // Group bookings by date for better display
    const bookingsByDate = Object.keys(subBookingCart).map(date => ({
      date,
      formattedDate: format(new Date(date), "EEEE, MMM d, yyyy"),
      count: Object.keys(subBookingCart[date]).length,
      items: subBookingCart[date]
    }));
    
    // Calculate total bookings
    const totalBookings = Object.values(subBookingCart).reduce(
      (count, dateSubBookings) => count + Object.keys(dateSubBookings).length, 0
    );

    // Scroll to top of modal when opened
    useEffect(() => {
      if (isBookingModalOpen && modalRef.current) {
        modalRef.current.scrollTop = 0;
      }
    }, [isBookingModalOpen]);

    // Helper function to show error popup
    const showErrorPopup = (title, errors) => {
      setErrorPopup({
        isOpen: true,
        title,
        errors: Array.isArray(errors) ? errors : [errors]
      });
    };

    // Close error popup
    const closeErrorPopup = () => {
      setErrorPopup({ isOpen: false, title: "", errors: [] });
    };

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
      setChoseReason("");
      setMoreDescription("");
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
        setIsLoading(true);
        try {
            const booking = {
                roomId: roomId,
                descriptionId: CategoryDescription.find((value) => value.name == choseReason)?.id || null,
                moreDescription: choseReason == "Other" ? moreDescription : choseReason,
                type: 0,
                date: format(new Date(), "yyyy-MM-dd") + "T00:00:00",
            }

            // Process bookings in batches if there are many
            const listSubBooking = {};
            Object.values(subBookingCart).forEach((dateSubBooking) => {
                Object.keys(dateSubBooking).forEach((subId) => {
                    const buff = {}
                    buff.classId = dateSubBooking[subId].classId ?? "";
                    buff.groupIds = dateSubBooking[subId].groupsId;
                    buff.areaId = "";
                    buff.private = dateSubBooking[subId].isPrivate ? 1 : 0;
                    buff.typeSlot = dateSubBooking[subId].typeSlot;
                    buff.startTime = dateSubBooking[subId].startTime;
                    buff.endTime = dateSubBooking[subId].endTime;
                    buff.date = dateSubBooking[subId].date;
                    buff.reason = booking.moreDescription;
                    listSubBooking[subId] = buff;
                });
            });

            const bookings = { booking, listSubBooking };
            
            const response = await apiClient.post("/Booking", bookings);
            
            if (response.status == 200) {
                swtoast.success({ text: "Booking successful", timer: 1500 });
                setTimeout(() => {
                    navigate(0);
                }, 1000);
            }
        } catch (error) {
            console.error("Booking error:", error);
            
            // Better error handling for multiple errors
            if (error.response?.data?.detail) {
                if (error.response.data.detail.includes('\n')) {
                    const errorMessages = error.response.data.detail.split('\n').filter(msg => msg.trim());
                    showErrorPopup("Booking Failed", errorMessages);
                } else {
                    showErrorPopup("Booking Failed", error.response.data.detail);
                }
            } else {
                showErrorPopup("Booking Failed", "An unexpected error occurred during booking. Please try again later.");
            }
        } finally {
            setIsLoading(false);
            handleCloseBookingModal();
        }
    }
    
    const checkDuplicatedStudents = () => {
      const checkObject = {};
      const duplicatedList = [];
      
      Object.keys(subBookingCart).forEach((dateKey) => {
        Object.keys(subBookingCart[dateKey]).forEach((subId) => {
          const subBooking = subBookingCart[dateKey][subId];
          
          if (subBooking.students && Array.isArray(subBooking.students)) {
            subBooking.students.forEach(student => {
              const studentId = student.id || student.studentId;
              if (!studentId) return;
              
              if (!checkObject[studentId]) {
                checkObject[studentId] = true;
              } else if (!duplicatedList.includes(studentId)) {
                duplicatedList.push(studentId);
              }
            });
          }
        });
      });

      return duplicatedList;
    };
    
    const handleBooking = () => {
        if (totalBookings === 0) {
            showErrorPopup("Empty Cart", "Please add at least one time slot to your booking cart before proceeding.");
            return;
        }
        setIsBookingModalOpen(true);
    }

    // Add this function to calculate the totals
    const calculateTotalPeople = useCallback(() => {
      let totalStudentBuff = 0;
      
      Object.keys(subBookingCart).forEach((dateKey) => {
        Object.keys(subBookingCart[dateKey]).forEach((subId) => {
          const subBooking = subBookingCart[dateKey][subId];
          if (subBooking.students && Array.isArray(subBooking.students)) {
            totalStudentBuff += subBooking.students.length;
          }
        });
      });
      
      return { 
        totalStudents: totalStudentBuff, 
        totalGroups: Object.keys(subBookingCart).reduce(
          (count, dateKey) => count + Object.keys(subBookingCart[dateKey]).length, 0
        ) 
      };
    }, [subBookingCart]);

    // Modify your handleBookingModel function to properly check conditions:
    const handleBookingModel = () => {
      if (choseReason === '') {
        showErrorPopup("Missing Information", "Please select a reason for your booking to continue.");
        return;
      }
      
      // Only check this if activeGroups is defined and onlyGroupStatus is true
      if (activeGroups !== undefined && onlyGroupStatus === true && totalGroups > activeGroups) {
        showErrorPopup("Group Limit Exceeded", `You can only book up to ${activeGroups} groups, but you've selected ${totalGroups} groups.`);
        return;
      }
      
      // Only check this if activeStudents is defined and onlyGroupStatus is false
      if (activeStudents !== undefined && !onlyGroupStatus && totalStudents > activeStudents) {
        showErrorPopup("Student Limit Exceeded", `You can only book for up to ${activeStudents} students, but you've selected ${totalStudents}.`);
        return;
      }
      
      const duplicatedList = checkDuplicatedStudents();
      if (duplicatedList.length > 0) {
        showErrorPopup(
          "Duplicate Students Detected", 
          [
            "The following students appear in multiple groups:",
            ...duplicatedList.map(id => `• Student ID: ${id}`),
            "Please ensure each student is only assigned to one group."
          ]
        );
        return;
      }
      
      // If all validations pass, close modal and confirm booking
      setIsBookingModalOpen(false);
      swConfirmBooking(fetchBookingApi, "", "");
    }

    // Function to render a compact summary of bookings for the modal
    const renderBookingSummary = () => {
        if (totalBookings <= 3) return null; // Only show summary for many bookings
        
        return (
            <div className="mb-4 bg-indigo-50 rounded-xl p-4">
                <h4 className="font-medium text-indigo-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    Booking Summary
                </h4>
                <ul className="space-y-1 text-sm text-gray-700">
                    {bookingsByDate.map(day => (
                        <li key={day.date} className="flex justify-between">
                            <span>{format(new Date(day.date), "MMM d")}</span>
                            <span className="font-medium">{day.count} {day.count === 1 ? 'slot' : 'slots'}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
      <>
        {/* New Error Popup Component */}
        <ErrorPopup 
          isOpen={errorPopup.isOpen}
          onClose={closeErrorPopup}
          title={errorPopup.title}
          errors={errorPopup.errors}
        />
      
        {/* Enhanced Modal with Glassmorphism Design */}
        {isBookingModalOpen ? createPortal(
          <div
            id="booking-description-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-indigo-900/30 backdrop-blur-sm transition-all duration-300"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseBookingModal();
            }}
          >
            <div
              className="relative p-4 w-full max-w-md transform transition-all duration-300 ease-out scale-100 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
                {/* Decorative top gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                {/* Modal header */}
                <div className="flex items-center justify-between p-6 border-b border-indigo-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                  <h3 className="text-xl font-semibold text-indigo-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 mr-2 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                    </svg>
                    Complete Your Booking
                    {totalBookings > 0 && (
                      <span className="ml-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5">
                        {totalBookings}
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-full p-2 transition-colors"
                    onClick={handleCloseBookingModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                
                {/* Modal body */}
                <div className="p-6 space-y-6 max-h-[50vh] overflow-auto custom-scrollbar" ref={modalRef}>
                  {/* Booking summary for many items */}
                  {renderBookingSummary()}

                  <div className="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100/50">
                    <div className="text-sm text-indigo-700 flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                      <p>Please provide a reason for your booking to help us better facilitate your requirements.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Booking Reason <span className="text-red-500">*</span></label>
                    <select 
                      onChange={handleOnChangeReason} 
                      className="bg-white border border-indigo-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition-colors"
                      defaultValue=""
                    >
                      <option value="" disabled>Choose a reason</option>
                      {CategoryDescription?.map((element, index) => (
                        <option key={index} value={element.name}>{element.name}</option>
                      ))}
                    </select>
                    
                    <div ref={textAreaRef} hidden className="mt-5 transition-all duration-300">
                      <label className="block mb-2 text-sm font-medium text-gray-700">Additional Details</label>
                      <textarea 
                        value={moreDescription} 
                        onChange={handleOnchangeDescription}
                        className="bg-white border border-indigo-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3 transition-colors"
                        rows="4" 
                        placeholder="Please describe your reason..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Modal footer */}
                <div className="flex items-center justify-end p-6 border-t border-indigo-100 gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md">
                  <button
                    type="button"
                    className="text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300"
                    onClick={handleCloseBookingModal}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 shadow-md hover:shadow-indigo-200 flex items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={handleBookingModel}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </div>
          </div>, document.body
        ) : null}

        {/* Main Cart Container */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-sm border border-indigo-100/50 shadow-lg w-full overflow-hidden">
          {/* Cart Header */}
          <div className="bg-gradient-to-r from-indigo-50/80 to-white/50 border-b border-indigo-100/50 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600 mr-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                <h2 className="text-xl font-bold text-indigo-800">
                  Your Booking Cart
                  {totalBookings > 0 && (
                    <span className="ml-2 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-0.5">
                      {totalBookings}
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={handleShowCart}
                className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer flex items-center transition-colors p-1 hover:bg-indigo-50 rounded-full"
              >
                <span className="mr-1.5">Hide</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
  
          {/* Cart Items Container */}
          <div className="p-6">
            {totalBookings === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Add time slots to your calendar to get started</p>
                
                <div className="w-full max-w-xs bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 text-left">
                  <div className="flex items-start mb-3">
                    <div className="bg-indigo-100 rounded-full p-2 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-indigo-800 text-sm">How to book a room</h4>
                      <p className="text-xs text-gray-600 mt-1">Select time slots on the calendar and they'll appear here, ready for you to confirm your booking.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Display summary count when there are many bookings */}
                {totalBookings > 8 && (
                  <div className="mb-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-indigo-700 font-medium">
                        You have {totalBookings} bookings across {bookingsByDate.length} {bookingsByDate.length === 1 ? 'day' : 'days'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Scroll to see all
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Optimized scrollable container for many items */}
                <div className={`overflow-auto pr-2 space-y-3 custom-scrollbar ${totalBookings > 8 ? 'max-h-[350px]' : 'max-h-[420px]'}`}>
                  {/* Group bookings by date for easier visualization */}
                  {bookingsByDate.map((dayData, dayIndex) => (
                    <div key={`day_${dayIndex}`} className="mb-5 last:mb-0">
                      {totalBookings > 5 && (
                        <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-indigo-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                          {format(new Date(dayData.date), "EEEE, MMMM d, yyyy")} ({dayData.count} {dayData.count === 1 ? 'slot' : 'slots'})
                        </div>
                      )}
                      
                      {Object.keys(dayData.items).map((id, index) => (
                        <div
                          key={`booking_${dayIndex}_${index}`}
                          className="bg-gradient-to-r from-indigo-50/80 to-white/80 p-4 rounded-2xl border border-indigo-100/60 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          {/* Date display with day highlight */}
                          <div className="flex items-center gap-3 mb-3.5">
                            <div className="bg-indigo-600 text-white rounded-xl w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-xs font-medium">{format(new Date(dayData.items[id].date), "MMM")}</span>
                              <span className="text-lg font-bold leading-tight">{format(new Date(dayData.items[id].date), "d")}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {format(new Date(dayData.items[id].date), "EEEE, yyyy")}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-indigo-500">
                                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                                </svg>
                                {dayData.items[id].studentQuantity} {dayData.items[id].studentQuantity === 1 ? 'member' : 'members'}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleRemoveSubBooking(dayData.date, id)}
                                className="p-2 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors"
                                title="Remove"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleFocusSubBooking(dayData.items[id])}
                                className="p-2 rounded-full bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                                title="View details"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Time slots with modern badge style */}
                          <div className="bg-white rounded-xl p-3 border border-indigo-50">
                            <div className="text-xs uppercase text-gray-500 font-medium mb-2">Time Slot</div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="font-medium">{dayData.items[id].startTime.slice(0, 5)}</span>
                              </div>
                              
                              <span className="text-gray-400">-</span>
                              
                              <div className="flex items-center bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="font-medium">{dayData.items[id].endTime.slice(0, 5)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Confirm Booking Button - Fixed at the bottom */}
          <div className="bg-white border-t border-indigo-100 p-6">
            <button
              onClick={handleBooking}
              disabled={totalBookings === 0 || isLoading}
              className={`w-full py-3.5 px-4 flex items-center justify-center gap-2 rounded-xl font-medium 
                ${totalBookings === 0 || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-indigo-300/30'} 
                transition-all duration-300`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Complete Booking
                </>
              )}
            </button>
            
            {totalBookings > 0 && (
              <p className="text-center text-xs text-gray-500 mt-3">
                You're booking {totalBookings} {totalBookings === 1 ? 'time slot' : 'time slots'}
                {bookingsByDate.length > 1 ? ` across ${bookingsByDate.length} days` : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d4d7f5;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a5b4fc;
          }
        `}</style>
      </>
    );
}

export default CartBooking;