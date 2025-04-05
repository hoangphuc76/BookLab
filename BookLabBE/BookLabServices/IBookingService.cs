using BookLabDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabServices
{
    public interface IBookingService
    {
        MemoryStream ExportStudentsToExcel(List<StudentDto> students);

        Task<IEnumerable<ExcelScheduleRecord>> BookingClassByImportExcel(string filePath, Guid userId);

        Task<IEnumerable<ExcelScheduleRecord>> BookingClass(List<ExcelScheduleRecord> ClientScheduleRecord, Guid userId);

        MemoryStream CreateExcelFromScheduleRecords(IEnumerable<ExcelScheduleRecord> records);


    }
}
