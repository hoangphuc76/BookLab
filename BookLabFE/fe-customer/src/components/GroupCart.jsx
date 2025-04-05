import { useCallback, useEffect, useState } from "react";
import GroupModal from "./GroupModal";
import { PeopleIcon } from "../icons";
import { swtoast } from "../utils/swal";

const GroupCart = ({
  handleRemoveFromCart,
  pushedGroups,
  handleCompleteGroupToCart,
  activeStudents,
}) => {
  console.log("rerender group cart ", activeStudents);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const calculateTotalPeople = useCallback(() => {
    let total = 0;
    Object.keys(pushedGroups).map((keyGroup) => {
      total += pushedGroups[keyGroup].length;
    });
    return total;
  }, [pushedGroups]);

  const checkDuplicatedStudents = () => {
    const checkOject = {};
    const duplicatedList = [];
    console.log("check duplicate student in : ", pushedGroups);
    Object.keys(pushedGroups).map((keyGroup) => {
      for (let element of pushedGroups[keyGroup]) {
        if (!checkOject[element.accountDetail.studentId]) {
          checkOject[element.accountDetail.studentId] = true;
        } else if (!duplicatedList.includes(element.accountDetail.studentId)) {
          duplicatedList.push(element.accountDetail.studentId);
        }
      }
    });

    return duplicatedList;
  };

  const handleClickButtonAdd = () => {
    if (totalStudents <= 0) {
      swtoast.warning({ text: "You need to add group" });
      return;
    }
    if (totalStudents > activeStudents) {
      swtoast.warning({ text: "The number of student is out of limit" });
      return;
    }
    const duplicatedList = checkDuplicatedStudents();
    if (duplicatedList.length > 0) {
      swtoast.warning({
        text: "Duplicated students in booking : " + duplicatedList.join(" - "),
      });
      return;
    }
    handleCompleteGroupToCart(pushedGroups);
  };

  useEffect(() => {
    setTotalStudents(calculateTotalPeople());
    setIsLoading(false);
  });

  return (
    !isLoading && (
      <div className=" mb-4">
        <div>
          <div class="relative w-full max-w-2xl max-h-full ">
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              class="relative p-4 bg-white rounded-lg shadow "
            >
              <div>
                <div className="flex justify-between mb-4">
                  <div className="text-xl font-bold">Group Cart</div>
                  <div className="flex items-center text-[#5259C8] font-medium">
                    <PeopleIcon />
                    <div
                      className={`${totalStudents > activeStudents ? "text-red-300" : ""
                        }`}
                    >
                      {" "}
                      {totalStudents} / {activeStudents}{" "}
                    </div>
                    <div className="ml-1">People</div>
                  </div>
                </div>
                <div>
                  <div className="overflow-y-auto h-52 md:h-72 lg:h-[550px]">
                    {pushedGroups
                      ? Object.keys(pushedGroups).map((groupKey) => {
                        console.log("group name : ", groupKey);
                        return (
                          <GroupModal
                            key={groupKey}
                            isBelongToCart={true}
                            groupName={groupKey}
                            group={pushedGroups[groupKey]}
                            handleRemoveFromCart={handleRemoveFromCart}
                          />
                        );
                      })
                      : null}
                  </div>
                </div>
                <div className="flex flex-row-reverse">
                  <button
                    onClick={handleClickButtonAdd}
                    className="rounded-md bg-[#5259C8] px-5 pt-2 pb-3 text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-row-reverse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default GroupCart;
// alert should be add with sign +
