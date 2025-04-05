namespace BookLabDTO
{
    public class ExcelScheduleRecord
    {
        // Existing properties
        public string GroupName { get; set; }
        public string SubjectCode { get; set; }
        public DateTime Date { get; set; }
        public int Slot { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string RoomNo { get; set; }

        public int SessionNo { get; set; }
        public string Lecturer { get; set; }
        public string SlotTypeCode { get; set; }
        public string StatusSlot { get; set; }
        public string SlotType { get; set; }

        // New status properties
        public bool IsSuccess { get; set; } = true; // Default to success
        public string? ErrorMessage { get; set; } // Contains error message if failed
        public int RowNumber { get; set; } // Excel row number for reference
    }
}
