import { useState, useEffect, useCallback, memo } from "react";
import { Alert, Calendar, Badge, Spin } from "antd";
import dayjs from "dayjs";

import apiClient from "../../services/ApiClient";

const CalendarRoomDetail = ({
  timeSlots = [],
  roomId,
  capacity,
  onDateSelect,
}) => {
  const [value, setValue] = useState(() => dayjs(new Date()));
  const [selectedValue, setSelectedValue] = useState(() => [dayjs(new Date())]);
  const [customData, setCustomDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // const fetchTimeSlots = () => {
    //   const slots = [
    //     { id: 1, openTime: "7:00 am", closeTime: "9:15 am" },
    //     { id: 2, openTime: "9:30 am", closeTime: "11:45 am" },
    //     { id: 3, openTime: "00:30 pm", closeTime: "2:45 pm" },
    //     { id: 4, openTime: "3:00 pm", closeTime: "5:15 pm" },
    //   ];
    //   return slots;
    // };

    const loadData = async () => {
      setIsLoading(true);
      try {
        // const slots = fetchTimeSlots();
        // setTimeSlots(slots);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [timeSlots]);

  const fetchAvailability = useCallback(async (date) => {
    var dateStr = date?.format("YYYY-MM-DD");
    if (date && !customData[dateStr]) {
      await apiClient
        .get("/Booking(" + roomId + ")/CustomData/(" + dateStr + ")")
        .then((response) => response.data)
        .then((json) => {
          console.log("1 finished");
          setCustomDate((prevData) => ({
            ...prevData,
            ...json,
          }));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const getTimeSlots = useCallback(
    (date) => {
      if (!timeSlots || timeSlots.length === 0) return [];
      const type = ["success", "warning", "error"];
      const chooseType = (student, capacity) => {
        return type[Math.floor((student / capacity) * 3)];
      };

      const dateString = date.format("YYYY-MM-DD");

      const defaultSlots = timeSlots.map((slot) => ({
        ...slot,
        time: `${slot.openTime} - ${slot.closeTime}`,
        content: `${slot.name}`,
        type: "success",
        status: false,
        groups: {},
        totalStudents: 0,
      }));

      const getColorByAvailability = (percentage) => {
        if (percentage === undefined || percentage === null)
          return "bg-[#6366F1]";
        if (percentage >= 70) return "bg-[#22C55E]";
        if (percentage >= 30) return "bg-[#EAB308]";
        return "bg-[#EF4444]";
      };

      if (customData[dateString]) {
        return defaultSlots.map((slot, index) => ({
          ...slot,
          availablePercentage:
            ((capacity - customData[dateString][index]) / capacity) * 100,
          type: chooseType(customData[dateString][index], capacity),
          color: getColorByAvailability(
            ((capacity - customData[dateString][index]) / capacity) * 100
          ),
          active: capacity - customData[dateString][index],
        }));
      }

      const isWeekend = date.day() === 0 || date.day() === 6;
      return defaultSlots.map((slot) => ({
        ...slot,
        type: isWeekend ? "error" : slot.type,
        availablePercentage: isWeekend ? 0 : 75,
        color: getColorByAvailability(),
      }));
    },
    [customData]
  );

  const notifyDateSelection = useCallback(
    async (date) => {
      const dateStr = date ? date.format("YYYY-MM-DD") : null;

      if (!customData[dateStr]) {
        console.log("1");
        await fetchAvailability(date);
      }

      console.log("2");
      const slots = date ? getTimeSlots(date) : null;

      console.log("3");

      if (onDateSelect) {
        console.log("4");
        onDateSelect(dateStr ? { date: dateStr, slots } : null);
      }
    },
    [onDateSelect, getTimeSlots]
  );

  useEffect(() => {
    console.log("aaaaaaaaaaaaaaaaaaaa");
    console.log(selectedValue);
    notifyDateSelection(selectedValue[0]);
  }, [selectedValue, notifyDateSelection]);

  const onSelect = useCallback(
    (newValue) => {
      console.log(customData);
      setValue(newValue);
      setSelectedValue((prevSelectedValues) => {
        const date = newValue.format("YYYY-MM-DD");
        const index = prevSelectedValues.findIndex(
          (v) => v.format("YYYY-MM-DD") === date
        );

        const newSelectedValues =
          index > -1
            ? prevSelectedValues.filter((_, i) => i !== index)
            : [...prevSelectedValues, newValue];

        setTimeout(() => {
          notifyDateSelection(index > -1 ? null : newValue);
        }, 0);

        return newSelectedValues;
      });
    },
    [notifyDateSelection]
  );

  const onPanelChange = (newValue) => {
    setValue(newValue);
  };

  const dateCellRender = useCallback(
    (current) => {
      // const isCurrentMonth = current.month() === value.month();
      // if (!isCurrentMonth) return null;

      const slots = getTimeSlots(current);
      return (
        <ul className="events">
          {slots.map((slot) => (
            <li key={slot.id}>
              <Badge
                className="slot-badge"
                status="success"
                text={
                  <div className="gradient-container">
                    <div
                      className="gradient-bar"
                      style={{
                        background: `linear-gradient(to right, #52c41a ${slot.availablePercentage}%, #f5222d ${slot.availablePercentage}%)`,
                      }}
                    />
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      );
    },
    [getTimeSlots]
  );

  const cellRender = useCallback(
    (current, info) => {
      if (info.type === "date") {
        const isSelected = selectedValue.some(
          (v) => v.format("YYYY-MM-DD") === current.format("YYYY-MM-DD")
        );
        return (
          <div className={`custom-cell ${isSelected ? "selected" : ""}`}>
            {isSelected && dateCellRender(current)}
          </div>
        );
      }
      return info.originNode;
    },
    [selectedValue, dateCellRender]
  );

  const handleDisabledDate = useCallback(
    (date) => {
      const isCurrentMonth = date.month() === value.month();
      if (!isCurrentMonth) return false;

      const dateStr = date?.format("YYYY-MM-DD");
      if (customData[dateStr]) {
        const available =
          capacity * 4 -
          customData[dateStr].reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );
        if (available > 0) return false;
      }
      return true;
    },
    [customData]
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {console.log("CustomData: ", customData)}
      <Alert
        className="text-left"
        message={`You selected date ${selectedValue
          .map((v) => v.format("YYYY-MM-DD"))
          .join(" - ")}`}
      />
      <Calendar
        value={value}
        onSelect={onSelect}
        onPanelChange={onPanelChange}
        cellRender={cellRender}
        disabledDate={(date) => handleDisabledDate(date)}
      />
      <style jsx="true" global="true">{`
        .custom-cell {
          height: 100%;
          padding: 4px;
          display: flex;
          flex-direction: column;
        }
        .date-number {
          margin-bottom: 4px;
        }
        .events {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .events li {
          margin-bottom: 4px;
        }
        .slot-badge {
          width: 100%;
          display: block !important;
        }
        .ant-badge-status {
          width: 100%;
          display: block !important;
        }
        .ant-badge-status-text {
          width: 100%;
          display: block !important;
        }
        .gradient-container {
          width: 100%;
          height: 8px;
          display: block !important;
        }
        .gradient-bar {
          width: 100%;
          height: 100%;
          display: block !important;
          border-radius: 2px;
        }
        /* Hide the default badge dot */
        .ant-badge-status-dot {
          display: none !important;
        }
        /* Remove default margin from badge text */
        .ant-badge-status-text {
          margin-left: 0 !important;
        }
        .ant-picker-calendar-date-content {
          height: 80px !important;
          margin: 0;
          padding: 0 4px;
        }
        .ant-picker-cell {
          pointer-events: auto !important;
        }
        .ant-picker-calendar .ant-picker-cell .ant-picker-cell-inner {
          height: auto;
          min-height: 80px;
          border-color: rgba(5, 5, 5, 0.06);
        }
      `}</style>
    </>
  );
};

export default memo(CalendarRoomDetail);
