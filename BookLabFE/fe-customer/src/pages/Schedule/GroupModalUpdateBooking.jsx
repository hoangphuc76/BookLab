import { useState, useEffect, useCallback } from "react";
import GroupModal from "../../components/GroupModal";
import apiClient from "../../services/ApiClient";
import { swtoast } from "../../utils/swal";
import { createPortal } from "react-dom";
import { FaUsers, FaTimes, FaSave, FaArrowLeft } from "react-icons/fa";

const GroupModalUpdatingBooking = ({
  typeModal,
  inputGroups,
  handleCloseModal,
  subBookingId,
  currentSubBooking
}) => {
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
          check = true;
        }
      });
      if (check) {
        groupQuantity++;
      }
    });
    setQuantity([studentQuantity, groupQuantity]);
  };

  const handleCancelSaveQuantity = () => {
    groups.map((group) => {
      group.map((student) => {
        student.accountDetail.isBookingNew = student.accountDetail.inBooking;
      });
    });
  };

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
            updatingGroup[student.accountDetail.groupId] = [];
          }
          updatingGroup[student.accountDetail.groupId].push(student.accountDetail.studentInGroup);
        }
      });
    });
    
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
            student.accountDetail.inBooking = student.accountDetail.isBookingNew;
          });
          if (check) groupNum++;
        });
        currentSubBooking.studentQuantity = studentNum;
        currentSubBooking.groupQuantity = groupNum;

        swtoast.success({ text: 'Update student successfully' });
        handleCloseModal();
      }
    }).catch((error) => {
      swtoast.error({ text: error.message, timer: 1500 });
    });
  };
  
  const handleClose = () => {
    handleCancelSaveQuantity();
    handleCloseModal();
  };

  useEffect(() => {
    handleQuantity(inputGroups);
  }, []);

  return createPortal(
    <div
      onClick={handleClose}
      id="default-modal"
      tabIndex="-1"
      aria-hidden="true"
      className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="relative p-4 w-full max-w-3xl">
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
          className="relative w-full bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-indigo-100 bg-indigo-50/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-indigo-800 flex items-center">
                <FaUsers className="mr-3 text-indigo-600" />
                Group Management
              </h2>
              <button 
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="font-medium text-slate-700">
                Available groups for this booking
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium text-sm">
                {quantity[0]} students / {quantity[1]} groups
              </div>
            </div>

            {/* Groups list */}
            <div className="overflow-y-auto h-[calc(80vh-220px)] pr-2 custom-scrollbar">
              {groups ? groups.map((group) => (
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
              )) : (
                <div className="text-center py-8 text-slate-500">
                  No groups available
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
            <button 
              onClick={handleClose}
              className="flex items-center px-4 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            
            {currentSubBooking.approve == 0 ? (
              <button 
                onClick={handleUpdateQuantity} 
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-md transition-all"
              >
                <FaSave className="mr-2" />
                Save Changes
              </button>
            ) : (
              <button 
                onClick={handleCloseModal} 
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-md transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default GroupModalUpdatingBooking;
