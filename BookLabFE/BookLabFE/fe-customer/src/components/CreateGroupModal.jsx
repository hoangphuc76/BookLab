import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { swtoast } from "../utils/swal";
import apiClient from "../services/ApiClient";
import GroupModal from "./GroupModal";
import GroupCart from "./GroupCart";
import { 
  HiX, HiPlus, HiChevronDown, HiCheckCircle, 
  HiPencil, HiArrowLeft, HiSearch, HiOutlineUserGroup
} from "react-icons/hi";

const typeModals = [
  "None type",
  "Import Group",
  "Add New Group",
  "View and Update",
  "Add Group to Booking",
];

const CreateGroupModal = ({
  typeModal,
  selectedGroupsBefore,
  openedGroup,
  isAddNewGroup,
  isAddGroupToCart,
  inputGroups,
  getImportGroup,
  handleCloseModal,
  handleConfirmGroupToCart,
  activeStudents,
  activeGroups,
  onlyGroupStatus,
  selectedDate,
  allGroup
}) => {
  // All state variables preserved
  const [devTool, setDevTool] = useState(null);
  const [load, setLoad] = useState(false);
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(isAddNewGroup);
  const [newGroup, setNewGroup] = useState(null);
  const [newGroups, setNewGroups] = useState({});
  const [groups, setGroups] = useState(inputGroups);
  const [pushedGroups, setPushedGroups] = useState({});
  const [isCreateNewGroupInCart, setIsCreateNewGroupInCart] = useState(false);
  const inputNameRef = useRef(null);
  const [expandedSearch, setExpandedSearch] = useState(false);
  
  // All handler functions preserved - same logic, no changes
  const handleCreateNewNameGroup = (e) => {
    if ((e.key != null && e.key === "Enter") || e.key == null) {
      if (newGroup == null || newGroup.trim() === "") {
        swtoast.error({ text: "Please enter group name", timer: 1500 });
        return;
      }
      if (allGroup && Object.keys(allGroup).length > 0) {
        const checkNameDuplicate = Object.values(allGroup).some(value => value[0].groupName.trim() === newGroup.trim());
        if (checkNameDuplicate) {
          swtoast.error({ text: "Group name already exists" });
          return;
        }
      }

      setNewGroups(prev => {
        const buff = { [newGroup]: [], ...prev };
        return buff;
      });

      setIsCreateNewGroup(false);
    }
  };

  const handleOpenNewGroup = () => {
    if (isCreateNewGroup) {
      swtoast.error({ text: "Please complete current group" });
      inputNameRef.current.focus();
      return;
    }
    setNewGroup("");
    setIsCreateNewGroup((prev) => {
      if (isAddGroupToCart) {
        setIsCreateNewGroupInCart(true);
      }
      return true;
    });
  };

  const handleExitCreateNewGroup = () => {
    setIsCreateNewGroupInCart(false);
    setIsCreateNewGroup(false);
    setNewGroups({});
  };

  const handleDataGroupBeforeDisplay = (dataGroups) => {
    const modifiedGroups = {};

    Object.entries(dataGroups).forEach(([groupId, studentInGroup]) => {
      if (studentInGroup.length > 0) {
        modifiedGroups[studentInGroup[0].groupName] = [];

        studentInGroup.forEach(student => {
          const studentDetail = {
            accountDetail: {
              id: student.studentId,
              avatar: student.avatar,
              fullName: student.fullName,
              studentId: student.studentCode,
              groupId: groupId,
            }
          };
          modifiedGroups[student.groupName].push(studentDetail);
        });
      }
    });

    setGroups(prev => {
      const buffGroups = {};
      if (!prev && selectedGroupsBefore) {
        selectedGroupsBefore.forEach(groupId => {
          if (modifiedGroups[groupId]) {
            buffGroups[groupId] = modifiedGroups[groupId];
            delete modifiedGroups[groupId];
          }
        });
        setPushedGroups(buffGroups);
      }
      return { ...modifiedGroups, ...prev };
    });
  };

  const handleSaveGroups = async () => {
    if (!isAddNewGroup && !isCreateNewGroupInCart && typeModal != 1) return;

    const body = {};
    let invalidStudents = "";

    const groupsToProcess = typeModal === 1 ? groups : newGroups;

    Object.keys(groupsToProcess).forEach(groupKey => {
      groupsToProcess[groupKey].forEach(studentCheck => {
        if (!studentCheck.accountDetail) {
          invalidStudents += "#" + studentCheck.student.studentID + " ";
          return;
        }

        if (!body[groupKey]) {
          body[groupKey] = [];
        }

        body[groupKey].push(studentCheck.accountDetail.id);
      });
    });

    if (invalidStudents) {
      swtoast.error({
        title: "Invalid Students",
        text: `The following students were not found: ${invalidStudents}`,
        timer: 3000
      });
      return;
    }

    try {
      const response = await apiClient.post("/Group/AddGroups", body, {
        headers: { "Content-Type": "application/json" }
      });

      if (isAddNewGroup || typeModal == 1) {
        getImportGroup((prev) => ({ ...prev, ...response.data }));
        handleCloseModal();
        swtoast.success({ text: "Groups saved successfully" });
      } else if (isCreateNewGroupInCart) {
        setNewGroups({});
        handleDataGroupBeforeDisplay(response.data);
        setIsCreateNewGroupInCart(false);
        swtoast.success({ text: "New group created" });
      }
    } catch (error) {
      console.error("Error saving groups:", error);
      swtoast.error({ text: "Failed to save groups" });
    }
  };

  const handleUpdateGroup = async () => {
    if (!openedGroup) return;

    const groupName = Object.keys(groups)[0];
    const studentList = groups[groupName] || [];

    const body = {
      groupId: openedGroup,
      groupName: groupName,
      studentIdList: studentList.map(student => student.accountDetail.id)
    };

    try {
      await apiClient.post("/Group/UpdateGroupByLecturer", body, {
        headers: { "Content-Type": "application/json" }
      });

      swtoast.success({ text: "Group updated successfully" });
      handleCloseModal();
    } catch (error) {
      console.error("Error updating group:", error);
      swtoast.error({ text: "Failed to update group" });
    }
  };

  const handleToolOpen = (divRef) => {
  setDevTool(prev => {
    // Add null/undefined check before accessing .hidden property
    if (prev == null) {
      if (divRef) divRef.hidden = false;
      return divRef;
    }
    if (prev != divRef) {
      prev.hidden = true;
      if (divRef) divRef.hidden = false;
      return divRef;
    }
    prev.hidden = true;
    return null;
  });
};

  const handleRemoveFromCart = (groupName, group) => {
    setPushedGroups(prev => {
      const newPushedGroups = { ...prev };
      delete newPushedGroups[groupName];
      return newPushedGroups;
    });
    
    setGroups(prev => {
      const newGroups = { ...prev };
      newGroups[groupName] = group;
      return newGroups;
    });
    
    setLoad(prev => !prev);
  };

  const handlePushToCart = (groupName, group) => {
    setPushedGroups(prev => ({
      ...prev,
      [groupName]: group
    }));

    setGroups(prev => {
      const newGroups = { ...prev };
      delete newGroups[groupName];
      return newGroups;
    });

    setLoad(prev => !prev);
  };

  const handleToggleSearchExpand = (isExpanded) => {
    setExpandedSearch(isExpanded);
  };

  // All useEffect hooks preserved
  useEffect(() => {
    const fetchGroups = async () => {
      if (isAddGroupToCart) {
        try {
          const response = await apiClient.get("/Group/GetGroupsOfLecturer");
          handleDataGroupBeforeDisplay(response.data);
        } catch (error) {
          console.error("Failed to fetch lecturer groups:", error);
          swtoast.error({ text: "Failed to load groups" });
        }
      }
    };

    fetchGroups();
  }, [isAddGroupToCart]);

  useEffect(() => {
    if (isCreateNewGroup && inputNameRef.current) {
      inputNameRef.current.focus();
    }
  }, [isCreateNewGroup]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`relative w-full ${isAddGroupToCart ? "max-w-4xl" : "max-w-xl"} h-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modern glass-morphism card design with fixed height */}
        <div className="bg-white backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col" 
             style={{ height: isAddGroupToCart ? "75vh" : "70vh" }}>
          {/* Header - height controlled with fixed padding */}
          <div className="relative bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isCreateNewGroup && (
                  <button 
                    onClick={handleExitCreateNewGroup} 
                    className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <HiArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <h2 className="font-medium text-slate-800 text-[15px]">
                    {typeModals[typeModal]}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAddNewGroup || isCreateNewGroupInCart 
                      ? "Create and manage student groups" 
                      : isAddGroupToCart 
                        ? "Add groups to your booking" 
                        : "Manage your student groups"}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <HiX size={16} />
              </button>
            </div>
          </div>
          
          {/* Content wrapper - flex with remaining height */}
          <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
            {/* Left panel - Group management */}
            <div className={`${isAddGroupToCart ? "sm:w-1/2 border-r border-slate-100" : "w-full"} flex flex-col bg-white h-full`}>
              {/* Section header with fixed height */}
              <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${isCreateNewGroupInCart ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                  <h3 className="text-sm font-medium text-slate-700">
                    {isAddNewGroup || isCreateNewGroupInCart ? "New Group" : "Available Groups"}
                  </h3>
                </div>
                
                {/* Action button */}
                {(isAddGroupToCart || isAddNewGroup) && !isCreateNewGroupInCart ? (
                  <button
                    onClick={handleOpenNewGroup}
                    className="inline-flex items-center gap-1.5 py-1 pl-2 pr-3 text-xs bg-slate-800 text-white font-medium rounded-full hover:bg-slate-700 shadow-sm transition-all"
                  >
                    <span className="flex items-center justify-center h-4 w-4 bg-white rounded-full text-slate-800">
                      <HiPlus size={10} />
                    </span>
                    New Group
                  </button>
                ) : !openedGroup && isCreateNewGroup ? (
                  <button
                    onClick={handleExitCreateNewGroup}
                    className="inline-flex items-center gap-1.5 py-1 pl-2 pr-3 text-xs bg-rose-50 text-rose-600 font-medium rounded-full hover:bg-rose-100 transition-all"
                  >
                    <HiX size={10} className="ml-0.5" />
                    Cancel
                  </button>
                ) : null}
              </div>
              
              {/* Scrollable group content - flex-grow to take remaining space */}
              <div className="px-4 flex-grow overflow-auto slim-scrollbar">
                {/* New group creation form */}
                {isCreateNewGroup && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3"
                  >
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="mb-1.5 text-xs font-medium text-slate-500">Group Name</div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                          <input
                            ref={inputNameRef}
                            value={newGroup || ""}
                            onKeyDown={handleCreateNewNameGroup}
                            onChange={(e) => setNewGroup(e.target.value)}
                            className="w-full py-2 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-100 focus:border-sky-500 focus:outline-none transition-all"
                            placeholder="Enter group name..."
                          />
                          <HiOutlineUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                        </div>
                        <button
                          onClick={handleCreateNewNameGroup}
                          className="shrink-0 h-9 w-9 inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-sm transition-all"
                        >
                          <HiPlus size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Group list with improved animation - now visible because of proper flex layout */}
                <AnimatePresence mode="popLayout">
                  {groups && !isAddNewGroup && !isCreateNewGroupInCart
                    ? Object.keys(groups).length > 0 ? (
                      <div className="space-y-2 py-1">
                        {Object.keys(groups).map((groupKey) => (
                          <motion.div
                            key={groupKey}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                          >
                            <GroupModal
                              typeModal={typeModal}
                              isAddGroupToCart={isAddGroupToCart}
                              isOpenedSearch={false}
                              groupName={groupKey}
                              group={groups[groupKey]}
                              setGroups={setGroups}
                              handleToolOpen={handleToolOpen}
                              handlePushToCart={handlePushToCart}
                              compactMode={true}
                              onSearchExpand={handleToggleSearchExpand}
                              allowFullScroll={true}
                              modernStyle={true}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 mb-3 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                          <HiOutlineUserGroup size={20} />
                        </div>
                        <h4 className="text-slate-600 font-medium mb-1">No Groups Found</h4>
                        <p className="text-xs text-slate-500 max-w-[200px]">
                          Create a new group or import existing ones to get started
                        </p>
                      </div>
                    )
                    : newGroups
                      ? Object.keys(newGroups).map((groupKey, index) => (
                        <motion.div
                          key={groupKey + index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                        >
                          <GroupModal
                            typeModal={typeModal}
                            isOpenedSearch={groupKey === newGroup}
                            groupName={groupKey}
                            group={newGroups[groupKey]}
                            setGroups={setNewGroups}
                            handleToolOpen={handleToolOpen}
                            compactMode={true}
                            onSearchExpand={handleToggleSearchExpand}
                            allowFullScroll={true}
                            modernStyle={true}
                          />
                        </motion.div>
                      ))
                      : !isCreateNewGroup && (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 mb-3 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <HiOutlineUserGroup size={20} />
                          </div>
                          <h4 className="text-slate-600 font-medium mb-1">No Groups Available</h4>
                          <p className="text-xs text-slate-500 max-w-[200px]">
                            Create a new group to get started
                          </p>
                        </div>
                      )}
                </AnimatePresence>
              </div>
              
              {/* Action button footer - fixed height */}
              <div className="p-4 border-t border-slate-100 flex-shrink-0">
                <div className="flex justify-end space-x-2">
                  {openedGroup && (
                    <button
                      onClick={handleUpdateGroup}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-all"
                    >
                      <HiPencil className="text-slate-600" size={12} />
                      Update
                    </button>
                  )}
                  {(isAddNewGroup || isCreateNewGroupInCart || typeModal == 1) && (
                    <button
                      onClick={handleSaveGroups}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs bg-sky-500 text-white font-medium rounded-full hover:bg-sky-600 shadow-sm transition-all"
                    >
                      <HiCheckCircle size={12} />
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right panel - Cart with same flex layout */}
            {isAddGroupToCart && (
              <div className="sm:w-1/2 flex flex-col bg-slate-50 h-full">
                <div className="p-4 border-b border-slate-100 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <h3 className="text-sm font-medium text-slate-700">
                        Selected Groups
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {Object.keys(pushedGroups).length} group(s)
                    </div>
                  </div>
                </div>
                <div className="flex-grow overflow-auto p-4">
                  <GroupCart
                    handleRemoveFromCart={handleRemoveFromCart}
                    pushedGroups={pushedGroups}
                    handleCompleteGroupToCart={handleConfirmGroupToCart}
                    selectedDate={selectedDate}
                    activeStudents={activeStudents}
                    activeGroups={activeGroups}
                    onlyGroupStatus={onlyGroupStatus}
                    compactMode={true}
                    modernStyle={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Slim scrollbar styles */}
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
    </div>,
    document.body
  );
};

export default CreateGroupModal;