import { useState, useRef, useEffect } from "react";
import SearchStudent from "./SearchStudent";
import { 
  HiChevronDown, HiChevronUp, HiDotsHorizontal, HiPencil, HiTrash, 
  HiPlus, HiArrowRight, HiX, HiFlag, HiMenuAlt3, HiUserAdd, HiSearch
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const GroupModal = ({ 
  typeModal, 
  isOpenedSearch, 
  isAddGroupToCart, 
  isBelongToCart, 
  groupName, 
  group, 
  setGroups, 
  handleToolOpen, 
  handlePushToCart, 
  handleRemoveFromCart, 
  isUpdateBooking, 
  handleQuantity,
  isApproved,
  compactMode,
  modernStyle = true,
  onSearchExpand
}) => {
  const [isExpand, setIsExpand] = useState(typeModal == 4 ? false : true);
  const [isSearch, setIsSearch] = useState(isOpenedSearch);
  const [load, setLoad] = useState(true);
  const [team, setTeam] = useState(group);
  const [name, setName] = useState(groupName);
  const divRefs = useRef([]);
  const groupToolRef = useRef();
  const groupNameRef = useRef(null);

  const handleExpand = () => {
    setIsExpand(prev => !prev);
  };

  const handleOpenSearch = () => {
    if (typeModal == 10) return;
    
    // Expand group when search is opened
    setIsExpand(true);
    
    // Toggle search and notify parent about expanded search state
    setIsSearch(prev => {
      const newState = !prev;
      if (onSearchExpand) {
        onSearchExpand(newState);
      }
      return newState;
    });
  };

  const handleClick = (divRef) => {
    if (typeModal == 10) return;
    handleToolOpen(divRef);
  };

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
  };

  const handleConfirmModifyGroup = (e) => {
    const newName = groupNameRef.current.innerHTML.trim();
    if ((e.key != null && e.key === "Enter") || e.key == null) {
      if (newName == null || newName === "") {
        alert("Group name cannot be empty");
        groupNameRef.current.focus();
      } else {
        const buffArr = [];
        const buffName = [];

        setName(newName);
        setGroups(prev => {
          Object.keys(prev).forEach((key) => {
            if (key != name) {
              buffName.push(key);
            } else {
              buffName.push(newName);
            }
            buffArr.push(prev[key]);
            delete prev[key];
          });
          
          for (let count = 0; count < buffArr.length; count++) {
            prev[buffName[count]] = buffArr[count];
          }
          
          return prev;
        });
        groupNameRef.current.contentEditable = false;
      }
    }
  };

  const handleDeleteGroup = () => {
    handleToolOpen(groupToolRef);
    setGroups(prev => {
      delete prev[groupName];
      return prev;
    });
  };

  const handleDeleteStudent = (index, divRef) => {
    handleToolOpen(divRef);
    setGroups(prev => {
      const buff = [];
      for (let i = 0; i < prev[name].length; i++) {
        if (i != index) {
          buff.push(prev[name][i]);
        }
      }
      
      prev[name] = buff;
      setTeam(prev[name]);
      
      return prev;
    });
  };

  const handlePushGroupToCart = () => {
    handlePushToCart(groupName, group);
  };

  const handleRemoveGroupFromCart = () => {
    handleRemoveFromCart(groupName, group);
  };

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
      });
      return prev;
    });
    setLoad(prev => !prev);
  };
  
  // Calculate how many students are displayed initially
  const initialDisplayCount = 6;
  
  return (
    <div className="rounded-lg border border-slate-200 mb-2 overflow-hidden shadow-sm hover:shadow-md transition-all bg-white">
      {/* Group Header - Modernized */}
      <div className="bg-white">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center flex-1 min-w-0">
            <button 
              onClick={handleExpand} 
              className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {isExpand ? <HiChevronDown /> : <HiChevronUp />}
            </button>
            
            <div 
              ref={groupNameRef} 
              onKeyDown={handleConfirmModifyGroup} 
              onBlur={handleConfirmModifyGroup} 
              id="group-name" 
              className="text-sm font-medium text-slate-800 ml-2 truncate border-transparent rounded px-1.5 focus:border-sky-400 focus:ring-1 focus:ring-sky-300 focus:outline-none transition-all"
            >
              {name}
            </div>
            
            {isUpdateBooking && (
              <div className="ml-2 px-1.5 py-0.5 bg-sky-50 text-sky-600 text-xs font-medium rounded-full shrink-0">
                {team.filter(s => s.accountDetail?.isBookingNew).length} selected
              </div>
            )}
            
            <div className="ml-2 text-xs text-slate-500">
              {team.length} {team.length === 1 ? "student" : "students"}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {isAddGroupToCart ? (
              <button 
                onClick={handlePushGroupToCart} 
                className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                title="Add to booking"
              >
                <HiArrowRight className="text-slate-600" size={16} />
              </button>
            ) : (
              isBelongToCart ? (
                <button 
                  onClick={handleRemoveGroupFromCart} 
                  className="flex items-center justify-center p-1.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove from booking"
                >
                  <HiX size={16} />
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  {typeModal != 10 && (
                    <button 
                      onClick={handleOpenSearch} 
                      className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Add students"
                    >
                      <HiUserAdd className="text-slate-600" size={16} />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        handleClick(groupToolRef.current);
                        e.stopPropagation();
                      }}
                      className="flex items-center justify-center p-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Group options"
                      disabled={typeModal == 10}
                    >
                      <HiDotsHorizontal className="text-slate-600" size={16} />
                    </button>
                    
                    <div id="tool-box" hidden ref={groupToolRef} className="absolute right-0 z-10 mt-1">
                      <div className="rounded-lg bg-white shadow-lg border border-slate-200 overflow-hidden min-w-36">
                        <button 
                          onClick={handleOpenModifyGroup}
                          className="w-full flex items-center px-3 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <HiPencil className="mr-2 text-slate-500" size={16} />
                          Rename Group
                        </button>
                        
                        <button 
                          onClick={handleDeleteGroup}
                          className="w-full flex items-center px-3 py-2 text-sm text-left text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <HiTrash className="mr-2" size={16} />
                          Delete Group
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Group Body - Improved layout with AnimatePresence */}
      <AnimatePresence initial={false}>
        {isExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 border-t border-slate-200 overflow-hidden"
          >
            {/* Search component with animation */}
            <AnimatePresence>
              {isSearch && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="p-3 border-b border-slate-200 bg-white"
                >
                  <SearchStudent setGroups={setGroups} setTeam={setTeam} groupName={name} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Student list - Dynamic height instead of fixed */}
            <div className="overflow-y-auto" style={{ maxHeight: isSearch ? "16rem" : "20rem" }}>
              {team.length > 0 ? (
                <div>
                  {team.map((student, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-slate-100 hover:bg-white/80 transition-colors
                      ${student.accountDetail?.isBookingNew ? "bg-sky-50/80" : ""}`}
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        {isUpdateBooking ? (
                          <div className="flex-shrink-0">
                            <input 
                              className="h-3.5 w-3.5 text-sky-600 border-slate-300 rounded cursor-pointer focus:ring-sky-500 transition-colors"
                              type="checkbox" 
                              disabled={isApproved} 
                              onChange={() => { handleChangeSelectStudent(index); }}
                              checked={student.accountDetail?.isBookingNew || false}
                            />
                          </div>
                        ) : (
                          <div className="text-slate-400 flex-shrink-0">
                            <HiMenuAlt3 size={14} />
                          </div>
                        )}
                        
                        <div className="flex-shrink-0">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                            <img 
                              className="h-full w-full object-cover" 
                              src={student.accountDetail ? student.accountDetail.avatar : "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-vector-600nw-1745180411.jpg"}
                              alt={student.accountDetail ? student.accountDetail.fullName : "Unknown User"}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-col truncate">
                          <span className="font-medium text-slate-800 text-sm truncate">
                            {student.accountDetail ? student.accountDetail.fullName : "Unknown"}
                          </span>
                          
                          {student.accountDetail ? (
                            <span className="text-xs text-slate-500 truncate">@{student.accountDetail.studentId}</span>
                          ) : (
                            <span className="text-xs text-rose-500 truncate" title="Student code not found">
                              @{student.student?.studentID || "N/A"}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-2">
                        {isUpdateBooking && student.accountDetail?.inBooking && (
                          <div className="mr-1 flex items-center text-sky-600" title="Already in booking">
                            <HiFlag size={14} />
                          </div>
                        )}
                        
                        {typeModal != 10 && (
                          <button
                            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            onClick={(e) => {
                              handleDeleteStudent(index, divRefs.current[index]);
                              e.stopPropagation();
                            }}
                          >
                            <HiX size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 text-sm">
                  <div className="inline-flex mb-2 p-2 bg-slate-100 text-slate-400 rounded-full">
                    <HiUserAdd size={18} />
                  </div>
                  <p>No students in this group</p>
                  <button 
                    onClick={handleOpenSearch}
                    className="mt-2 text-sky-500 hover:text-sky-600 text-xs inline-flex items-center"
                    disabled={typeModal == 10}
                  >
                    <HiPlus size={12} className="mr-1" />
                    Add students
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupModal;