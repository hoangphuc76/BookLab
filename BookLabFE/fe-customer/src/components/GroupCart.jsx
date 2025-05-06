import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GroupModal from "./GroupModal";
import { PeopleIcon } from "../icons";
import { swtoast } from "../utils/swal";
import { HiUserGroup, HiPlus, HiFolderAdd } from "react-icons/hi";

const GroupCart = ({
  handleRemoveFromCart,
  pushedGroups,
  handleCompleteGroupToCart,
  activeStudents,
  activeGroups,
  onlyGroupStatus,
  compactMode = true,
  modernStyle = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);
  
  const calculateTotalPeople = useCallback(() => {
    let totalStudentBuff = 0;
    Object.keys(pushedGroups).forEach((keyGroup) => {
      totalStudentBuff += pushedGroups[keyGroup].length;
    });
    return { 
      totalStudents: totalStudentBuff, 
      totalGroups: Object.keys(pushedGroups).length 
    };
  }, [pushedGroups]);

  const checkDuplicatedStudents = () => {
    const checkObject = {};
    const duplicatedList = [];
    
    Object.keys(pushedGroups).forEach((keyGroup) => {
      for (let element of pushedGroups[keyGroup]) {
        const studentId = element.accountDetail?.studentId;
        if (!studentId) continue;
        
        if (!checkObject[studentId]) {
          checkObject[studentId] = true;
        } else if (!duplicatedList.includes(studentId)) {
          duplicatedList.push(studentId);
        }
      }
    });

    return duplicatedList;
  };

  const handleClickButtonAdd = () => {
    if (totalStudents <= 0) {
      swtoast.warning({ text: "You need to add at least one group" });
      return;
    }
    
    if (!onlyGroupStatus && totalStudents > activeStudents) {
      swtoast.warning({ text: "The number of students exceeds the limit" });
      return;
    }
    
    if (onlyGroupStatus && totalGroups > activeGroups) {
      swtoast.warning({ text: "The number of groups exceeds the limit" });
      return;
    }
    
    const duplicatedList = checkDuplicatedStudents();
    if (duplicatedList.length > 0) {
      swtoast.warning({
        text: "Duplicate students in booking: " + duplicatedList.join(", "),
      });
      return;
    }
    
    handleCompleteGroupToCart(pushedGroups);
  };

  useEffect(() => {
    const buffStudentAndGroupTotal = calculateTotalPeople();
    setTotalStudents(buffStudentAndGroupTotal.totalStudents);
    setTotalGroups(buffStudentAndGroupTotal.totalGroups);
    setIsLoading(false);
  }, [calculateTotalPeople]); // Added dependency array to prevent unnecessary re-renders

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header section with counts */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <HiUserGroup className="text-slate-500" size={18} />
            <span className="font-medium text-slate-800">
              {Object.keys(pushedGroups).length > 0 ? "Selected Groups" : "No Groups Selected"}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            {onlyGroupStatus ? (
              <div className={`flex items-center px-2 py-0.5 rounded-full ${
                totalGroups > activeGroups 
                  ? "bg-rose-50 text-rose-600" 
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                <span className="font-medium">{totalGroups}</span>
                <span className="mx-0.5">/</span>
                <span>{activeGroups}</span>
                <span className="ml-1 text-xs">groups</span>
              </div>
            ) : (
              <div className={`flex items-center px-2 py-0.5 rounded-full ${
                totalStudents > activeStudents 
                  ? "bg-rose-50 text-rose-600" 
                  : "bg-emerald-50 text-emerald-600"
              }`}>
                <span className="font-medium">{totalStudents}</span>
                <span className="mx-0.5">/</span>
                <span>{activeStudents}</span>
                <span className="ml-1 text-xs">students</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Groups list with proper scrolling */}
      <div className="flex-grow overflow-auto slim-scrollbar">
        <AnimatePresence>
          {Object.keys(pushedGroups).length > 0 ? (
            <div className="space-y-2 pb-2">
              {Object.keys(pushedGroups).map((groupKey) => (
                <motion.div
                  key={groupKey}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <GroupModal
                    isBelongToCart={true}
                    groupName={groupKey}
                    group={pushedGroups[groupKey]}
                    handleRemoveFromCart={handleRemoveFromCart}
                    compactMode={compactMode}
                    modernStyle={modernStyle}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-12 text-center"
            >
              <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <HiFolderAdd size={20} />
              </div>
              <h4 className="text-slate-600 font-medium mb-1">No Groups Added</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Add groups from the left panel to include them in your booking
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action button area */}
      {Object.keys(pushedGroups).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleClickButtonAdd}
            className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 font-medium text-sm transition-all ${
              ((!onlyGroupStatus && totalStudents > activeStudents) || 
               (onlyGroupStatus && totalGroups > activeGroups)) 
                ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                : "bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow"
            }`}
            disabled={
              (!onlyGroupStatus && totalStudents > activeStudents) || 
              (onlyGroupStatus && totalGroups > activeGroups)
            }
          >
            <HiPlus size={16} />
            Add to Booking
          </button>
        </div>
      )}
      
      <style jsx>{`
        .slim-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .slim-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .slim-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .slim-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default GroupCart;
