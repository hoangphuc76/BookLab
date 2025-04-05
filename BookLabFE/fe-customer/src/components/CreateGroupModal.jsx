import { useState, useEffect, useCallback, useRef } from "react";
import GroupModal from "./GroupModal";
import apiClient from "../services/ApiClient";
import GroupCart from "./GroupCart";
import { ArrowDownIcon, XIcon } from "../icons";
import { createPortal } from "react-dom";
import { swtoast } from "../utils/swal";

// Modal with 4 different states/types:
// 1 - Import group
// 2 - Add new group
// 3 - View and update
// 4 - Add group to booking
const typeModals = [
  "None type",
  "Import group",
  "Add new group",
  "View and update",
  "Add group to booking",
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
  selectedDate,
  allGroup
}) => {

  const [devTool, setDevTool] = useState(null);
  const [load, setLoad] = useState(false);
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(isAddNewGroup);
  const [newGroup, setNewGroup] = useState(null);
  const [newGroups, setNewGroups] = useState({});
  const [groups, setGroups] = useState(inputGroups);
  const [pushedGroups, setPushedGroups] = useState({});
  const [isCreateNewGroupInCart, setIsCreateNewGroupInCart] = useState(false);
  const inputNameRef = useRef(null);

  console.log("import group ---- ", inputGroups);
  console.log("import group data : ", groups)


  const handleCreateNewNameGroup = (e) => {
    if ((e.key != null && e.key == "Enter") || e.key == null) {
      if (newGroup == null || newGroup.trim() == "") {
        swtoast.error({ text: "Please enter group name", timer: 1500 })
        return;
      }
      if (allGroup && Object.keys(allGroup).length > 0) {
        const checkNameDuplicate = Object.values(allGroup).some(value => value[0].groupName.trim() == newGroup.trim())
        if (checkNameDuplicate) {
          swtoast.error({ text: "Group name was duplicated" })
          return;
        }
      }


      setNewGroups(prev => {
        const buff = { [newGroup]: [], ...prev };
        return buff;
      });
      
      setIsCreateNewGroup(false);

      return;
    }
  }

  // Group management functions
  const handleOpenNewGroup = () => {
    console.log("= handleOpenNewGroup ? ", typeModals[typeModal]);
    if (isCreateNewGroup) {
      swtoast.error({ text: "Please complete current group" })
      inputNameRef.current.focus()
      return;
    }
    setNewGroup("")
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

  const handleSaveGroups = async () => {
    if (!isAddNewGroup && !isCreateNewGroupInCart && typeModal != 1) return;
    
    const body = {};
    let invalidStudents = "";

    // Determine which groups to save based on modal type
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

  // Handle tools and group cart operations
  const handleToolOpen = (divRef) => {
    setDevTool(prev => {
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

  const handleRemoveFromCart = (groupName, group) => {
    setPushedGroups(prev => {
      const newPushedGroups = { ...prev };
      delete newPushedGroups[groupName];
      return newPushedGroups;
    });
    setGroups((prev) => {
      prev[groupName] = group;
      return prev;
    });
    setLoad((prev) => !prev);
  };

  // const handleFocus = () => {
  //   if (contentRef.current.innerText === "enter name") {
  //     contentRef.current.innerText = "";
  //   }
  // };

  // const handleBlur = () => {
  //   if (contentRef.current.innerText.trim() === "") {
  //     contentRef.current.innerHTML = `<span class="text-gray-300">enter name</span>`;
  //   }
  // };

  // Effects
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
    console.log(
      "! useEffect focus on text when create new group ?",
      typeModals[typeModal]
    );
    inputNameRef.current.focus()
  }, [isCreateNewGroup]);

  return createPortal(
    <div onClick={handleCloseModal} className="fixed inset-0 z-50 flex justify-center items-center bg-gray-200 bg-opacity-75 w-full md:inset-0 h-[calc(100%)] max-h-full ">
      <div
        class={`relative p-4 w-full ${isAddGroupToCart ? "max-w-4xl" : "max-w-2xl"
          } max-h-full`}
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
          class="relative w-full p-4 bg-white rounded-lg shadow dark:bg-gray-700"
        >
          {/* Chia làm 2 phần */}
          <div className="flex w-full">
            {/* Phần bên trái */}
            <div className={` ${isAddGroupToCart ? "w-1/2" : "w-full"} p-4 `}>
              <div className="flex justify-between mb-4">
                <div className="text-xl font-bold">
                  {isAddNewGroup || isCreateNewGroupInCart
                    ? "Create Group"
                    : "Your Group"}
                </div>
                {(isAddGroupToCart || isAddNewGroup) &&
                  !isCreateNewGroupInCart ? (
                  <div
                    onClick={handleOpenNewGroup}
                    className="group flex items-center text-[#5259C8] font-medium cursor-pointer hover:bg-[#5259C8] px-1 rounded-lg"
                  >
                    <ArrowDownIcon className={'group-hover:text-white'} />
                    <div className="ml-1 group-hover:text-white">New Group</div>
                  </div>
                ) : !openedGroup ? (
                  <div
                    onClick={handleExitCreateNewGroup}
                    className="group flex items-center text-[#5259C8] font-medium cursor-pointer  hover:bg-[#5259C8] px-1 rounded-lg"
                  >
                    <XIcon className={'group-hover:text-white'} />
                    <div className="ml-1 group-hover:text-white">Cancel</div>
                  </div>
                ) : null}
              </div>

              <div>
                <div className="overflow-y-auto h-52 md:h-72 lg:h-[560px]">
                  {/* Nếu tạo group mới */}
                  <div
                    hidden={!isCreateNewGroup}
                    className="rounded-[10px] border-[2px] border-[#EEEFF1] mb-4"
                  >
                    <div className="flex justify-between ml-3 mt-3 mb-3 mr-2">
                      <div className="flex items-center">
                        <div className="text-[#5259C5] cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                            stroke="currentColor"
                            class="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </div>
                        <div className="ml-1"><input ref={inputNameRef} value={newGroup} onKeyDown={handleCreateNewNameGroup} onChange={(event) => {
                          setNewGroup(event.target.value);
                        }} className="py-1 pl-1 font-mono text-lg border-2 border-[#5259C5] rounded-lg font-bold" placeholder="Enter group name" /></div>
                      </div>

                      <div className="flex">
                        <div onClick={handleCreateNewNameGroup} className="group border-2 border-[#EEEFF1] text-[#5259C5] flex items-center rounded-md pl-1 pr-1 cursor-pointer hover:bg-[#5259C5]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            class="size-4 group-hover:text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </div>
                        <div className="border-2 border-[#EEEFF1] text-[#5259C5] ml-2 flex items-center rounded-md cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            class="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danh sách nhóm */}
                  {groups && !isAddNewGroup && !isCreateNewGroupInCart
                    ? Object.keys(groups).map((groupKey) => (
                      <GroupModal
                        typeModal={typeModal}
                        key={groupKey}
                        isAddGroupToCart={isAddGroupToCart}
                        isOpenedSearch={false}
                        groupName={groupKey}
                        group={groups[groupKey]}
                        setGroups={setGroups}
                        handleToolOpen={handleToolOpen}
                        handlePushToCart={handlePushToCart}
                      />
                    ))
                    : newGroups
                      ? Object.keys(newGroups).map((groupKey, index) => (
                        <GroupModal
                          typeModal={typeModal}
                          key={groupKey + index}
                          isOpenedSearch={groupKey === newGroup}
                          groupName={groupKey}
                          group={newGroups[groupKey]}
                          setGroups={setNewGroups}
                          handleToolOpen={handleToolOpen}
                        />
                      ))
                      : null}
                </div>
              </div>

              {/* Nút lưu */}
              <div className="flex flex-row-reverse">
                {openedGroup && (
                  <button
                    onClick={handleUpdateGroup}
                    className="rounded-md bg-[#5259C8] px-5 pt-2 pb-3 text-white"
                  >
                    Update
                  </button>
                )}
                {(isAddNewGroup || isCreateNewGroupInCart || typeModal == 1) && (
                  <button
                    onClick={handleSaveGroups}
                    className="rounded-md bg-[#5259C8] px-5 pt-2 pb-3 text-white"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Phần bên phải */}
            {isAddGroupToCart ? (
              <div className="w-1/2 p-4">
                <GroupCart
                  handleRemoveFromCart={handleRemoveFromCart}
                  pushedGroups={pushedGroups}
                  handleCompleteGroupToCart={handleConfirmGroupToCart}
                  selectedDate={selectedDate}
                  activeStudents={activeStudents}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>, document.body
  );
};

export default CreateGroupModal;