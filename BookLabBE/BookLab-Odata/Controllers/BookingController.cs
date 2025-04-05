using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using BookLabModel.Model;
using BookLabRepositories;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using BookLabDTO;
using BookLabServices;
using System.Text;
using System.Security.Claims;
using System.IO;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Drawing;

namespace BookLab_Odata.Controllers
{
    [Route("odata")]
    [ApiController]
    public class BookingController(IBookingRepository _bookingRepository,
    IGroupInBookingRepository _groupInBookingRepository,
    IStudentInGroupRepository _studentInGroupRepository,
    IStudentInBookingRepository _studentInBookingRepository,
    IBookingService _bookingService,
    IEmailService _emailService,
    IMeetingBookLabService _meetingBookLabService,
    IAccountDetailRepository _accountDetailRepository,
    IAccountRepository _accountRepository,
    ISubBookingRepository _subBookingRepository,
    IRoomRepository _roomRepository,
    IProfanityFilterService _profanityFilterService,
    ILogger<BookingController> _logger) : ODataController
    {

        // GET: odata/<BuildingController>
        [HttpGet("[controller]/GetBookings")]
        [EnableQuery]
        [Authorize]
        public async Task<IEnumerable<BookingDto>> GetBookings(int pageNumber, int pageSize)
        {
            _logger.LogInformation("Fetching all bookings");
            var list = await _bookingRepository.GetAllBookings(pageNumber, pageSize);
            return list;
        }



        // PUT odata/<BuildingController>/5
        [HttpPut("[controller]({id})")]
        [Authorize]
        public async Task<ActionResult> PutBooking(Guid id, [FromBody] Booking booking)
        {
            _logger.LogInformation($"Updating booking with ID: {id}");
            var temp = await _bookingRepository.GetBookingsById(id);
            if (temp == null)
            {
                _logger.LogWarning($"Booking with ID: {id} not found");
                return NoContent();
            }
            booking.Id = id;
            await _bookingRepository.UpdateBooking(booking);
            _logger.LogInformation($"Booking with ID: {id} updated successfully");
            return Content("Update success!");
        }

        [HttpPut("[controller]/ChangeStatus/{id}")]
        [Authorize]
        public async Task<ActionResult> ChangeStatus(Guid id, int status, string reason, string email, string description, string roomNumber, string buildingName)
        {
            Guid buff;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return BadRequest("User ID not found in token");
                }
                buff = userId;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to decode token: {ex.Message}");
                return BadRequest($"Failed to decode token: {ex.Message}");
            }

            var manager = await _accountRepository.GetAccountsById(buff);
            if (manager == null)
            {
                _logger.LogWarning("User ID not found in DB");
                return BadRequest("User ID not found in DB");
            }

            // bởi vì toàn bộ quyền được phê duyệt phòng là từ quản lý nên sẽ nhận một số lượng lớn booking hơn số lượng cần thiết
            // hoặc trong trường hợp có update về số lượng học sinh nên cần phải check lại trước khi update
            // và chủ yếu check về số lượng học sinh or số lượng nhóm và khung giờ đó có bị bất ngờ phòng đào tạo lấy đi hay không
            SubBooking subBooking;
            Booking booking;
            Room room;
            DateTime date;
            TimeOnly startTime;
            TimeOnly endTime;
            IEnumerable<GroupInBooking> groupInBookings;
            try
            {
                _logger.LogInformation("Check before update booking");
                subBooking = await _subBookingRepository.GetSubBookingById(id);
                date = subBooking.Date;
                startTime = subBooking.StartTime;
                endTime = subBooking.EndTime;
                booking = await _bookingRepository.GetBookingsById(subBooking.BookingId ?? Guid.Empty);
                room = await _roomRepository.GetRoomsById(booking.RoomId.Value);

                var roomAvaliable = await _bookingRepository.CheckRoomAvaliable(room.Id, startTime, endTime, date);
                if (!roomAvaliable)
                {
                    return Conflict("The room had an emergency at that time so it could not be approved.");
                }

                var roomNoPrivate = await _bookingRepository.CheckRoomNoPrivate(room.Id, startTime, endTime, date);
                if (!roomNoPrivate)
                {
                    return Conflict("This room has a private reservation so it cannot be approved.");
                }

                groupInBookings = await _groupInBookingRepository.GetGroupInBookingsBySubBookingId(id);
                var groupIds = groupInBookings.Select(groupInBookings => groupInBookings.GroupId).ToArray();
                var bookingIdByRoom = await _bookingRepository.GetAllBookingsByRoom(room.Id);

                var checkAvaliable = await _subBookingRepository.checkAvaliableBookging(bookingIdByRoom, groupIds, room, startTime, endTime, date);
                if (!checkAvaliable)
                {
                    return Conflict($"Exceeding the number of {(room.OnlyGroupStatus ? "groups" : "students")} allowed");
                }

                _logger.LogInformation($"Updating booking with ID: {id}");
                await _subBookingRepository.UpdateSubBooking(id, status, reason, buff);

            }
            catch (Exception ex)
            {
                _logger.LogError($"Error check update: {ex.Message}");
                return BadRequest(ex.Message);
            }

            // Thực hiện đồng bộ hóa với gg calendar nếu đặt lịch thành công
            if (status == 10)
            {
                try
                {
                    var lecturer = await _accountDetailRepository.GetAccountDetailsById(booking.LectureId.Value);
                    Attendee creator = new Attendee
                    {
                        email = lecturer.Account.Gmail,
                        displayName = lecturer.FullName,
                        optional = false,
                        responseStatus = "accepted"
                    };
                    var summary = "Booking Faise";
                    var location = room.Building.Campus.Address + ", in " + buildingName + ", in " + roomNumber;
                    var reminders = new Reminders
                    {
                        useDefault = false,
                        overrides = new List<Override>
                    {
                        new Override
                        {
                            method = "email",
                            minutes = 1440
                        },
                        new Override
                        {
                            method = "popup",
                            minutes = 60
                        }
                    }
                    };
                    List<Attendee> listAttendees = new List<Attendee>();
                    listAttendees.Add(creator);
                    TimeSpan openTime = startTime.ToTimeSpan();
                    TimeSpan closeTime = endTime.ToTimeSpan();
                    DateTime combinedOpenDateTime = date + openTime;
                    DateTime combinedCloseDateTime = date + closeTime;
                    EventTime start = new EventTime
                    {
                        dateTime = combinedOpenDateTime,
                        timeZone = "Asia/Ho_Chi_Minh"
                    };
                    EventTime end = new EventTime
                    {
                        dateTime = combinedCloseDateTime,
                        timeZone = "Asia/Ho_Chi_Minh"
                    };
                    foreach (GroupInBooking groupInBooking in groupInBookings)
                    {
                        IEnumerable<StudentInGroup> listStudent = await _studentInGroupRepository.GetStudentInGroupsByGroupId(groupInBooking.GroupId);
                        foreach (StudentInGroup studentInGroup in listStudent)
                        {
                            Attendee student = new Attendee
                            {
                                email = studentInGroup.Student.Gmail,
                                displayName = studentInGroup.Student.AccountDetail.FullName,
                                optional = false,
                                responseStatus = "accepted"
                            };
                            listAttendees.Add(student);
                        }
                    }
                    var eventRequest = new EventRequest
                    {
                        start = start,
                        end = end,
                        summary = summary,
                        description = description,
                        attendees = listAttendees,
                        location = location,
                        reminders = reminders,
                    };
                    await _meetingBookLabService.CreateEventAsync(eventRequest);
                    _logger.LogInformation("Async gg calander successful");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Accout {manager.Gmail} Error update to google calendar: {ex.Message}");
                    /*                return BadRequest(ex.Message);*/
                }
            }


            try
            {


                await _emailService.SendEmailAsync(email, "Booking confirmation", description, roomNumber, buildingName, date.ToString(), startTime, endTime, status, reason);

                // Log thông tin người dùng
                _logger.LogInformation($"Google user ({email}) is updating booking status");
                _logger.LogInformation($"Booking with ID: {id} updated successfully by user {email}");
                return Content("Update success!");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to process token: {ex.Message}");
                return BadRequest("Invalid token format");
            }


        }

        [HttpPost("[controller]/Attendance")]
        [Authorize]
        public async Task<ActionResult> MarkAttendance([FromBody] AttendanceRequest request)
        {
            _logger.LogInformation("Marking attendance");

            if (request == null || request.AttendanceRecords == null || request.AttendanceRecords.Count == 0)
            {
                _logger.LogWarning("Invalid attendance request");
                return BadRequest("Danh sách điểm danh không hợp lệ.");
            }

            _logger.LogInformation($"Updating attendance for studentInGroupId");
            await _studentInBookingRepository.UpdateStudentAttendace(request);

            _logger.LogInformation("Attendance marked successfully");
            return Ok(new { message = "Điểm danh thành công!", count = request.AttendanceRecords.Count });
        }

        // PUT odata/<BuildingController>/5/status
        // [HttpPut("[controller]({id})/Status")]
        // [Authorize]
        // public async Task<ActionResult> PutBookingChangeStatus(Guid id)
        // {
        // 	_logger.LogInformation($"Changing status of booking with ID: {id}");
        // 	var temp = await _bookingRepository.GetBookingsById(id);
        // 	if (temp == null)
        // 	{
        // 		_logger.LogWarning($"Booking with ID: {id} not found");
        // 		return NoContent();
        // 	}
        // 	temp.Status = !temp.Status;
        // 	await _bookingRepository.UpdateBooking(temp);
        // 	_logger.LogInformation($"Status of booking with ID: {id} changed successfully");
        // 	return Content("Update success!");
        // }

        // DELETE odata/<BuildingController>/5
        //[HttpDelete("[controller]({id})")]
        //[Authorize]
        //public async Task<ActionResult> DeleteBooking(Guid id)
        //{
        //	_logger.LogInformation($"Deleting booking with ID: {id}");
        //	var temp = await _bookingRepository.GetBookingsById(id);
        //	if (temp == null)
        //	{
        //		_logger.LogWarning($"Booking with ID: {id} not found");
        //		return NoContent();
        //	}
        //	await _bookingRepository.DeleteBooking(id);
        //	_logger.LogInformation($"Booking with ID: {id} deleted successfully");
        //	return Content("Delete success!");
        //}

        // GET odata/<BuildingController>/5/CustomData
        //[HttpGet("[controller]({id})/CustomData/({date})")]
        //[Authorize]
        //public async Task<ActionResult<Object>> GetCustomDataForSlot(Guid id, string date)
        //{
        //	_logger.LogInformation($"Fetching custom data for slot with ID: {id} and date: {date}");
        //	var bookings = await _bookingRepository.GetAllBookingsByRoomId(id);
        //	if (bookings == null)
        //	{
        //		_logger.LogWarning($"Bookings for room ID: {id} not found");
        //		return NotFound();
        //	}

        //	var customData = await _groupInBookingRepository.CustomDataForSlot(bookings, date);

        //	if (customData == null)
        //	{
        //		_logger.LogWarning($"Custom data for slot with ID: {id} and date: {date} not found");
        //		return NotFound();
        //	}

        //	return customData;
        //}

        //POST odata/<BookingController>
        /*[HttpPost("[controller]")]
       [Authorize]
       public async Task<ActionResult> PostBooking([FromBody] JsonDocument bookingsJson)
       {
           _logger.LogInformation("Creating a new booking");
           if (bookingsJson == null)
           {
               _logger.LogWarning("Request body is null");
               return BadRequest("Body của request bị null.");
           }
           string jsonString = bookingsJson.RootElement.GetRawText();
           JObject bookings = JObject.Parse(jsonString);

           string buff = "";


           try
           {

               var userId = User.FindFirst(ClaimTypes.Email)?.Value;
               buff = userId;
               if (string.IsNullOrEmpty(userId))
               {
                   _logger.LogWarning("User ID not found in token");
                   return BadRequest("User ID not found in token");
               }
           }
           catch (Exception ex)
           {
               _logger.LogError($"Failed to decode token: {ex.Message}");
               return BadRequest($"Failed to decode token: {ex.Message}");
           }

           var lecturer = await _accountRepository.GetAccountByEmail(buff);

           Guid lecturerId = lecturer.Id;

           JObject bookingModel = bookings["booking"]?.Value<JObject>();

           if (bookingModel == null)
           {
               return BadRequest(new ProblemDetails
               {
                   Title = "BadRequest",
                   Detail = "Booking data is missing or invalid",
                   Status = 400
               });
           }


           var description = bookingModel["description"].Value<string>() ?? "";
           var result = await _profanityFilterService.CheckProfanityAsync(description);
           if (result.Censored.Contains("*"))
           {
               return BadRequest(new ProblemDetails
               {
                   Title = "Forbidden",
                   Detail = "Description contains sensitive language.",
                   Status = 403
               });
           }


           JObject listBooking = bookings["listBooking"]?.Value<JObject>();

           if (listBooking == null)
           {
               return BadRequest(new ProblemDetails
               {
                   Title = "BadRequest",
                   Detail = "ListBooking data is missing or invalid",
                   Status = 400
               });
           }

           // Check lỗi trước khi add

           // Check xem thử người đặt lịch có thời gian rảnh, không trùng lịch
           Dictionary<string, Guid[]> timesOfBookings = new Dictionary<string, Guid[]>();

           Dictionary<(DateTime date, Guid slotId), AccountDetail[]> busyStudentsInfo = new Dictionary<(DateTime date, Guid slotId), AccountDetail[]>();
           foreach (var dateEntry in listBooking)
           {
               string dateString = dateEntry.Key;
               DateTime date = DateTime.Parse(dateString);
               if (date < DateTime.Now)
               {
                   return BadRequest(new ProblemDetails
                   {
                       Title = "BadRequest",
                       Detail = "Must select date greater than date: " + DateTime.Now.Date,
                       Status = 400
                   });
               }

               JObject slots = (JObject)dateEntry.Value;
               List<Guid> slotIds = new List<Guid>();

               foreach (var slotEntry in slots)
               {
                   Guid slotId = Guid.Parse(slotEntry.Key);

                   JArray groups = (JArray)slotEntry.Value;
                   Guid[] groupIds = groups.Select(x => Guid.Parse(x.ToString())).ToArray();

                   // Check xem thử trong một khung giờ của một ngày có học sinh bị trùng ở hai nhóm khác nhau không
                   if (!await _studentInGroupRepository.CheckNoDouble(groupIds))
                   {
                       return BadRequest(new ProblemDetails
                       {
                           Title = "BadRequest",
                           Detail = "Students cannot exist in multiple groups in one slot.",
                           Status = 400
                       });
                   }

                   // List học sinh bận
                   var listStudent = await _studentInGroupRepository.StudentFree(groupIds, date, slotId);
                   if (listStudent.Any())
                   {
                       var busyStudents = listStudent.Select(student => student.Student.AccountDetail).ToArray();
                       (DateTime date, Guid slotId) key = (date, slotId);
                       if (busyStudentsInfo.ContainsKey(key))
                       {
                           var existingStudents = busyStudentsInfo[key];
                           var newStudents = existingStudents.Concat(busyStudents).ToArray();
                           busyStudentsInfo[key] = newStudents;
                       }
                       else
                       {
                           busyStudentsInfo.Add(key, busyStudents);
                       }
                   }

                   slotIds.Add(slotId);
               }
               timesOfBookings[dateString] = slotIds.ToArray();
           }

           bool lecturerFree = await _bookingRepository.LecturerFree(lecturerId, timesOfBookings);

           if (!lecturerFree)
           {
               return BadRequest(new ProblemDetails
               {
                   Title = "BadRequest",
                   Detail = "You have double booked! Please check again!",
                   Status = 400
               });
           }

           var allSlot = await _slotRepository.GetAllSlots();
           StringBuilder messages = new StringBuilder();
           foreach (var kvp in busyStudentsInfo)
           {
               var key = kvp.Key;
               var students = kvp.Value;

               foreach (var student in students)
               {
                   string message = $"Student {student.FullName} has a lesson on {key.date.ToString("yyyy-MM-dd")} for {allSlot.FirstOrDefault(slot => slot.Id == key.slotId).Name}.\n";
                   messages.Append(message);
               }
           }
           string allMessages = messages.ToString();
           if (!string.IsNullOrEmpty(allMessages))
           {
               return BadRequest(new ProblemDetails
               {
                   Title = "BadRequest",
                   Detail = allMessages,
                   Status = 400
               });
           }

           // Hết lỗi add bình thường
           Booking booking = new Booking
           {
               Id = Guid.NewGuid(),
               Description = bookingModel["description"].Value<string>() ?? "",
               Reason = bookingModel["reason"].Value<string>() ?? "",
               DateTimeBooking = bookingModel["date"].Value<DateTime>(),
               Status = false,
               LecturerId = lecturerId,
               RoomId = Guid.Parse(bookingModel["roomId"].Value<string>())
           };
           booking.Id = Guid.NewGuid();
           await _bookingRepository.AddBooking(booking);

           foreach (var dateEntry in listBooking)
           {
               string dateString = dateEntry.Key;
               DateTime date = DateTime.Parse(dateString);

               JObject slots = (JObject)dateEntry.Value;
               foreach (var slotEntry in slots)
               {
                   Guid slotId = Guid.Parse(slotEntry.Key);
                   JArray groups = (JArray)slotEntry.Value;
                   foreach (var groupEntry in groups)
                   {
                       Guid groupId = Guid.Parse(groupEntry.ToString());
                       var id = Guid.NewGuid();
                       GroupInBooking groupInBooking = new GroupInBooking
                       {
                           Id = id,
                           GroupId = groupId,
                           SlotId = slotId,
                           BookingId = booking.Id,
                           Status = false,
                           DateTimeInBooking = date
                       };
                       await _groupInBookingRepository.AddGroupInBooking(groupInBooking);

                       var listStudentInGroup = await _studentInGroupRepository.GetStudentInGroupsByGroupId(groupId);

                       foreach (var student in listStudentInGroup)
                       {
                           StudentInBooking studentInBooking = new StudentInBooking
                           {
                               StudentInGroupId = student.Id,
                               GroupInBookingId = id,
                               CheckInTime = TimeOnly.FromDateTime(DateTime.Now),
                               CheckOutTime = TimeOnly.FromDateTime(DateTime.Now),
                               Status = false
                           };
                           await _studentInBookingRepository.AddStudentInBooking(studentInBooking);
                       }
                   }
               }
           }

           _logger.LogInformation("Booking created successfully");
           return Content("Insert success!");
       }*/

        [Microsoft.AspNetCore.Mvc.HttpPost("[controller]")]
        [Authorize]
        public async Task<ActionResult> PostBooking([FromBody] JsonDocument bookingsJson)
        {
            _logger.LogInformation("Creating a new booking");
            if (bookingsJson == null)
            {
                _logger.LogWarning("Request body is null");
                return BadRequest("Body của request bị null.");
            }
            string jsonString = bookingsJson.RootElement.GetRawText();
            JObject bookings = JObject.Parse(jsonString);

            Guid buff;


            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return BadRequest("User ID not found in token");
                }
                buff = userId;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to decode token: {ex.Message}");
                return BadRequest($"Failed to decode token: {ex.Message}");
            }

            var lecturer = await _accountRepository.GetAccountsById(buff);
            if (lecturer == null)
            {
                _logger.LogWarning("User ID not found in DB");
                return BadRequest("User ID not found in DB");
            }

            Guid lecturerId = lecturer.Id;

            JObject bookingModel = bookings["booking"]?.Value<JObject>();

            if (bookingModel == null)
            {
                _logger.LogWarning("Booking data is missing or invalid");
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = "Booking data is missing or invalid",
                    Status = 400
                });
            }

            var roomId = bookingModel["roomId"].Value<string>();
            if (string.IsNullOrEmpty(roomId))
            {
                _logger.LogWarning("RoomId in booking data is missing or invalid.");
                return BadRequest(new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "RoomId in booking data is missing or invalid.",
                    Status = 403
                });
            }
            var room = await _roomRepository.GetRoomsById(Guid.Parse(roomId));

            var descriptionId = bookingModel["descriptionId"].Value<string>();
            if (string.IsNullOrEmpty(descriptionId))
            {
                _logger.LogWarning("DescriptionId in booking data is missing or invalid.");
                return BadRequest(new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "DescriptionId in booking data is missing or invalid.",
                    Status = 403
                });
            }

            var moreDescription = bookingModel["moreDescription"].Value<string>() ?? "";
            var result = await _profanityFilterService.CheckProfanityAsync(moreDescription);
            if (result.Censored.Contains("*"))
            {
                _logger.LogWarning("Description contains sensitive language.");
                return BadRequest(new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "Description contains sensitive language.",
                    Status = 403
                });
            }

            var typeModel = bookingModel["type"];

            bool type;
            if (typeModel != null && typeModel.Type != JTokenType.Null)
            {
                type = typeModel.Value<bool>();
            }
            else
            {
                _logger.LogWarning("Type in booking data is missing or invalid.");
                return BadRequest(new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "Type in booking data is missing or invalid.",
                    Status = 403
                });
            }

            var dateModel = bookingModel["date"];

            DateTime? dateBooking = null;

            if (dateModel != null && dateModel.Type != JTokenType.Null)
            {
                dateBooking = dateModel.Value<DateTime>();
            }

            if (dateBooking == null)
            {
                _logger.LogWarning("DateBooking in booking data is missing or invalid.");
                return BadRequest(new ProblemDetails
                {
                    Title = "Forbidden",
                    Detail = "DateBooking in booking data is missing or invalid.",
                    Status = 403
                });
            }


            JObject listBooking = bookings["listSubBooking"]?.Value<JObject>();

            if (listBooking == null)
            {
                _logger.LogWarning("ListSubBooking data is missing or invalid.");
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = "ListSubBooking data is missing or invalid",
                    Status = 400
                });
            }

            // Check lỗi trước khi add

            // Check xem thử người đặt lịch có thời gian rảnh, không trùng lịch
            Dictionary<string, Guid[]> timesOfBookings = new Dictionary<string, Guid[]>();

            Dictionary<(DateTime date, string timeRange), AccountDetail[]> busyStudentsInfo = new Dictionary<(DateTime date, string timeRange), AccountDetail[]>();
            foreach (var subBookingObject in listBooking)
            {
                string subBookingId = subBookingObject.Key;
                JObject subBooking = (JObject)subBookingObject.Value;
                var classId = subBooking["classId"].Value<string>();
                JArray groups = subBooking["groupIds"].Value<JArray>();
                var areaId = subBooking["areaId"].Value<string>();
                var privateStatus = subBooking["private"].Value<bool>();
                var typeSlot = subBooking["typeSlot"].Value<string>();
                var startTime = TimeOnly.Parse(subBooking["startTime"].Value<string>());
                var endTime = TimeOnly.Parse(subBooking["endTime"].Value<string>());
                DateTime dateSubBooking = subBooking["date"].Value<DateTime>();
                DateTime today = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day, 0, 0, 0);
                if (dateSubBooking < today)
                {
                    _logger.LogWarning("Must select date greater than date: " + DateTime.Now.Date.ToString("yyyy-MM-dd"));
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = "Must select date greater than date: " + DateTime.Now.Date.ToString("yyyy-MM-dd"),
                        Status = 400
                    });
                }

                if (dateSubBooking.Date.Add(startTime.ToTimeSpan()) < DateTime.Now.AddMinutes(-30))
                {
                    _logger.LogWarning("You have to book earlier than 30 minutes");
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = "You have to book earlier than 30 minutes",
                        Status = 400
                    });
                }

                // check phòng
                try
                {
                    _logger.LogInformation("Check room before booking");
                    var roomAvaliable = await _bookingRepository.CheckRoomAvaliable(room.Id, startTime, endTime, dateSubBooking);
                    if (!roomAvaliable)
                    {
                        return Conflict("The room had an emergency at that time so it could not be approved.");
                    }

                    var roomNoPrivate = await _bookingRepository.CheckRoomNoPrivate(room.Id, startTime, endTime, dateSubBooking);
                    if (!roomNoPrivate)
                    {
                        return Conflict("This room has a private reservation so it cannot be approved.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error check room: {ex.Message}");
                    return BadRequest(ex.Message);
                }

                // Check giáo viên rảnh
                bool lecturerFree = true;
                try
                {
                    _logger.LogInformation("Start check leturer date " + dateSubBooking.ToString("yyyy-MM-dd"));
                    var bookingsOfLecturer = await _bookingRepository.GetBookingSuccessful(lecturerId);
                    if (bookingsOfLecturer.Any())
                    {
                        lecturerFree = await _subBookingRepository.LecturerFree(bookingsOfLecturer, startTime, endTime, dateSubBooking);
                    }

                }
                catch (Exception ex)
                {
                    _logger.LogError("Error of check lecturer free: " + ex.Message);
                    lecturerFree = false;
                }

                if (!lecturerFree)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = "You have double booked! Please check again!",
                        Status = 400
                    });
                }

                // Check xem thử trong một khung giờ của một ngày có học sinh bị trùng ở hai nhóm khác nhau không
                Guid[] groupIds = groups.Select(x => Guid.Parse(x.ToString())).ToArray();
                bool noDuplicateStudent = true;
                try
                {
                    _logger.LogInformation("Start check duplicate student in one sub booking");
                    noDuplicateStudent = await _studentInGroupRepository.CheckNoDouble(groupIds);
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error of check duplicate student in one sub booking: " + ex.Message);
                    noDuplicateStudent = false;
                }

                if (!noDuplicateStudent)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = "Students cannot exist in multiple groups in the range time.",
                        Status = 400
                    });
                }

                // Check xem thử số lượng học sinh or số lượng nhóm có vượt quá giới hạn hay không
                bool checkAvaliable = false;
                try
                {
                    _logger.LogInformation("Start check avaliable student or group in one sub booking");
                    var bookingIdByRoom = await _bookingRepository.GetAllBookingsByRoom(room.Id);

                    checkAvaliable = await _subBookingRepository.checkAvaliableBookging(bookingIdByRoom, groupIds, room, startTime, endTime, dateSubBooking);
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error of check avaliable student or group in one sub booking: " + ex.Message);
                    checkAvaliable = false;
                }

                if (!checkAvaliable)
                {
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = $"Exceeding the number of {(room.OnlyGroupStatus ? "groups" : "students")} allowed",
                        Status = 400
                    });
                }

                // List học sinh bận
                try
                {
                    _logger.LogInformation("Start check student free");
                    var listStudent = await _studentInGroupRepository.StudentFree(groupIds, dateSubBooking, startTime, endTime);
                    if (listStudent.Any())
                    {
                        var busyStudents = listStudent.Select(student => student.Student.AccountDetail).ToArray();
                        (DateTime date, string timeRange) key = (dateSubBooking, startTime.ToString() + "-" + endTime.ToString());
                        if (busyStudentsInfo.ContainsKey(key))
                        {
                            var existingStudents = busyStudentsInfo[key];
                            var newStudents = existingStudents.Concat(busyStudents).ToArray();
                            busyStudentsInfo[key] = newStudents;
                        }
                        else
                        {
                            busyStudentsInfo.Add(key, busyStudents);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError("Error of check student free: " + ex.Message);
                    return BadRequest(new ProblemDetails
                    {
                        Title = "BadRequest",
                        Detail = "Something wrong in check student free",
                        Status = 400
                    });
                }
            }

            StringBuilder messages = new StringBuilder();
            foreach (var kvp in busyStudentsInfo)
            {
                var key = kvp.Key;
                var students = kvp.Value;

                foreach (var student in students)
                {
                    string message = $"Student {student.FullName} has a lesson on {key.date.ToString("yyyy-MM-dd")} in time {key.timeRange}.\n";
                    messages.Append(message);
                }
            }
            string allMessages = messages.ToString();
            if (!string.IsNullOrEmpty(allMessages))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = allMessages,
                    Status = 400
                });
            }

            // Hết lỗi add bình thường
            Booking booking = new Booking
            {
                DescriptionId = Guid.Parse(descriptionId),
                MoreDescription = moreDescription,
                CreatedAt = DateTime.Now,
                CreatedBy = lecturerId,
                Type = 0,
                State = 5,
                LectureId = lecturerId,
                RoomId = Guid.Parse(roomId)
            };
            await _bookingRepository.AddBooking(booking);

            foreach (var subBookingObject in listBooking)
            {
                string subBookingId = subBookingObject.Key;
                JObject subBooking = (JObject)subBookingObject.Value;
                var classId = subBooking["classId"].Value<string>();
                JArray groups = subBooking["groupIds"].Value<JArray>();
                var areaId = subBooking["areaId"].Value<string>();
                var privateStatus = subBooking["private"].Value<bool>();
                var typeSlot = subBooking["typeSlot"].Value<string>();
                var startTime = TimeOnly.Parse(subBooking["startTime"].Value<string>());
                var endTime = TimeOnly.Parse(subBooking["endTime"].Value<string>());
                var reason = subBooking["reason"].Value<string>() ?? "None";
                DateTime dateSubBooking = subBooking["date"].Value<DateTime>();
                SubBooking subBookingModel = new SubBooking
                {
                    Id = Guid.Parse(subBookingId),
                    BookingId = booking.Id,
                    Approve = 0,
                    Reason = reason,
                    Private = privateStatus,
                    TypeSlot = int.Parse(typeSlot),
                    StartTime = startTime,
                    EndTime = endTime,
                    Date = dateSubBooking,
                    CreatedAt = DateTime.Now,
                    CreatedBy = lecturerId,
                };
                await _subBookingRepository.AddSubBooking(subBookingModel);

                Guid[] groupIds = groups.Select(x => Guid.Parse(x.ToString())).ToArray();
                foreach (Guid groupId in groupIds)
                {
                    GroupInBooking groupInBooking = new GroupInBooking
                    {
                        SubBookingId = subBookingModel.Id,
                        GroupId = groupId,
                        CreatedAt = DateTime.Now,
                        CreatedBy = lecturerId,
                    };
                    await _groupInBookingRepository.AddGroupInBooking(groupInBooking);

                    var listStudentInGroup = await _studentInGroupRepository.GetStudentInGroupsByGroupId(groupId);
                    foreach (var student in listStudentInGroup)
                    {
                        StudentInBooking studentInBooking = new StudentInBooking
                        {
                            StudentInGroupId = student.Id,
                            GroupInBookingId = groupInBooking.Id,
                            CheckInTime = TimeOnly.FromDateTime(DateTime.Now),
                            CheckOutTime = TimeOnly.FromDateTime(DateTime.Now),
                            Status = false,
							IsDeleted = false,
							CreatedAt = DateTime.Now,
                            CreatedBy = lecturerId,
                        };
                        await _studentInBookingRepository.AddStudentInBooking(studentInBooking);
                    }
                }

                try
                {
                    await _emailService.SendEmailAsync(room.Manager.Gmail, "Booking request", moreDescription, room.RoomNumber, room.Building.Name, dateSubBooking.ToString(), startTime, endTime, 0);

                    // Log thông tin người dùng
                    _logger.LogInformation($"Google user ({room.Manager.Gmail}) is to send email request");
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Failed to process token: {ex.Message}");
                    return BadRequest("Invalid token format");
                }

            }

            _logger.LogInformation("Booking created successfully");
            return Content("Insert success!");
        }

        //Test with google calendar
        //       [HttpPost("[controller]/GoogleCalendar")]
        //       
        // public async Task<ActionResult> PostBookingGoogleCalendar(Guid id, bool status, string reason)
        // {
        // 	var booking = await _bookingRepository.GetBookingsById(id);
        // 	var groupBookings = await _groupInBookingRepository.GetAllGroupInBookingsByBookingId(id);
        // 	var lecturer = await _accountDetailRepository.GetAccountDetailsById(booking.LecturerId);
        // 	Attendee creator = new Attendee
        // 	{
        // 		email = lecturer.Account.Gmail,
        // 		displayName = lecturer.FullName,
        // 		optional = false,
        // 		responseStatus = "accepted"
        // 	};
        // 	var summary = "Booking";
        // 	var description = booking.Description;
        // 	var location = booking.Room.Building.Campus.Address + ", in " + booking.Room.Building.Name + ", in " + booking.Room.Name;
        // 	var reminders = new Reminders
        // 	{
        // 		useDefault = false,
        // 		overrides = new List<Override>
        // 			{
        // 				new Override
        // 				{
        // 					method = "email",
        // 					minutes = 1440
        // 				},
        // 				new Override
        // 				{
        // 					method = "popup",
        // 					minutes = 60
        // 				}
        // 			}
        // 	};
        //
        // 	var groupedBookings = groupBookings
        // 		.GroupBy(gb => new { gb.DateTimeInBooking, gb.SlotId })
        // 		.Select(group => new
        // 		{
        // 			DateTimeInBooking = group.Key.DateTimeInBooking,
        // 			SlotId = group.Key.SlotId,
        // 			GroupBookings = group.ToList()
        // 		})
        // 		.ToList();
        //
        // 	foreach (var group in groupedBookings)
        // 	{
        // 		List<Attendee> listAttendees = new List<Attendee>();
        // 		listAttendees.Add(creator);
        // 		Slot slotBooking = await _slotRepository.GetSlotsById(group.SlotId);
        // 		TimeSpan openTime = slotBooking.OpenTime.ToTimeSpan();
        // 		TimeSpan closeTime = slotBooking.CloseTime.ToTimeSpan();
        // 		DateTime combinedOpenDateTime = group.DateTimeInBooking.Date + openTime;
        // 		DateTime combinedCloseDateTime = group.DateTimeInBooking.Date + closeTime;
        // 		EventTime start = new EventTime
        // 		{
        // 			dateTime = combinedOpenDateTime,
        // 			timeZone = "Asia/Ho_Chi_Minh"
        // 		};
        // 		EventTime end = new EventTime
        // 		{
        // 			dateTime = combinedCloseDateTime,
        // 			timeZone = "Asia/Ho_Chi_Minh"
        // 		};
        // 		foreach (GroupInBooking groupInBooking in group.GroupBookings)
        // 		{
        // 			IEnumerable<StudentInGroup> listStudent = (IEnumerable<StudentInGroup>)await _studentInGroupRepository.GetStudentInGroupsById(groupInBooking.GroupId);
        // 			foreach (StudentInGroup studentInGroup in listStudent)
        // 			{
        // 				Attendee student = new Attendee
        // 				{
        // 					email = studentInGroup.Student.Gmail,
        // 					displayName = studentInGroup.Student.AccountDetail.FullName,
        // 					optional = false,
        // 					responseStatus = "accepted"
        // 				};
        // 				listAttendees.Add(student);
        // 			}
        // 		}
        // 		var eventRequest = new EventRequest
        // 		{
        // 			start = start,
        // 			end = end,
        // 			summary = summary,
        // 			description = description,
        // 			attendees = listAttendees,
        // 			location = location,
        // 			reminders = reminders,
        // 		};
        // 		await _meetingBookLabService.CreateEventAsync(eventRequest);
        // 	}
        //
        // 	/*var eventRequest = new EventRequest
        // 	{
        // 		start = new EventTime
        // 		{
        // 			dateTime = DateTime.Now,
        // 			timeZone = "Asia/Ho_Chi_Minh"
        // 		},
        // 		end = new EventTime
        // 		{
        // 			dateTime = DateTime.Now,
        // 			timeZone = "Asia/Ho_Chi_Minh"
        // 		},
        // 		summary = "Test",
        // 		description = "Đồng bộ hóa",
        // 		attendees = new List<Attendee>
        // 		{
        // 			new Attendee
        // 			{
        // 				email = "triptmde180851@fpt.edu.vn",
        // 				displayName = "Phạm Trần Minh Trí",
        // 				optional = false,
        // 				responseStatus = "accepted"
        // 			}
        // 		},
        // 		location = "",
        // 		reminders = new Reminders
        // 		{
        // 			useDefault = false,
        // 			overrides = new List<Override>
        // 			{
        // 				new Override
        // 				{
        // 					method = "email",
        // 					minutes = 1440
        // 				},
        // 				new Override
        // 				{
        // 					method = "popup",
        // 					minutes = 60
        // 				}
        // 			}
        // 		}
        // 	};*/
        // 	return Content("Insert success!");
        // }

        //[HttpGet("[controller]/Schedule")]
        //[Authorize]
        //public async Task<IActionResult> GetBookingOfGroup(
        //	[FromQuery] DateTime firstDateOfWeek,
        //	[FromQuery] DateTime endDateOfWeek)
        //{


        //	try
        //	{



        //		// Retrieve the user ID from the token's claims
        //		var emailUser =  User.FindFirst(ClaimTypes.Email)?.Value;

        //		var accountUser = _accountRepository.GetAccountByEmail(emailUser);

        //		if (accountUser == null)
        //		{
        //			return BadRequest("User ID not found in token");
        //		}
        //		Guid userId = accountUser.Result.Id;

        //		var result = await _bookingRepository.GetBookingInWeek(firstDateOfWeek, endDateOfWeek, userId);
        //		return Ok(result);


        //	}
        //	catch (Exception ex)
        //	{
        //		return BadRequest($"Failed to decode token: {ex.Message}");
        //	}
        //}
        [HttpGet("[controller]/GetStudentList/{groupInBookingId}")]
        public async Task<ActionResult<IEnumerable<AttendanceRequestGetDto>>> GetStudentList(Guid groupInBookingId)
        {
        	var groupInBookings = await _groupInBookingRepository.GetAllGroupInBookingsByBookingId(groupInBookingId);
        	if (groupInBookings == null) return NotFound();


        	return Ok(groupInBookings);
        }

        [HttpGet("[controller]/SubBookingInWeekOfRoom")]
        public async Task<ActionResult<IEnumerable<SubBookingDto>>> GetUpcomingBookingsInWeek([FromQuery] DateTime StartTime, [FromQuery] DateTime EndTime, [FromQuery] Guid RoomId)
        {


            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            Console.WriteLine("user id ------------------ " + userId);

            if (userId == null) return BadRequest($"Authenticate Fail");
            var subBookingsDto = await _bookingRepository.GetUpcomingBookingsInWeek(StartTime, EndTime, RoomId, userId);
            return Ok(subBookingsDto);

        }

        [HttpGet("[controller]/SubBookingInWeekOfLecturer")]
        public async Task<ActionResult<IEnumerable<SubBookingDto>>> GetUpcomingBookingsInWeekOfRoom([FromQuery] DateTime StartTime, [FromQuery] DateTime EndTime)
        {

            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (userId == null) return BadRequest($"Authenticate Fail");
            var subBookingsDto = await _bookingRepository.GetUpcomingBookingsInWeekOfLecturer(StartTime, EndTime, userId);
            return Ok(subBookingsDto);

        }


        [HttpPost("[controller]/ImportExcel")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ExcelScheduleRecord>>> ImportBookingsFromExcel([FromForm] IFormFile excelFile)
        {
            _logger.LogInformation("Starting Excel import process for class bookings");

            if (excelFile == null || excelFile.Length == 0)
            {
                _logger.LogWarning("No file uploaded or file is empty");
                return BadRequest("Please upload a valid Excel file.");
            }

            // Check file extension
            var fileExtension = Path.GetExtension(excelFile.FileName);
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
            {
                _logger.LogWarning($"Invalid file format: {fileExtension}");
                return BadRequest("Please upload an Excel file (.xlsx or .xls)");
            }

            try
            {
                // Get the current user ID from the token

                // Save the file temporarily
                var tempFilePath = Path.GetTempFileName();
                try
                {
                    var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                    using (var stream = new FileStream(tempFilePath, FileMode.Create))
                    {
                        await excelFile.CopyToAsync(stream);
                    }

                    // Process the Excel file through the service
                    var result = await _bookingService.BookingClassByImportExcel(tempFilePath, userId);
                    _logger.LogInformation($"Excel import completed successfully. Processed {result.Count()} records.");

                    return Ok(result);
                }
                finally
                {
                    // Clean up the temp file
                    if (System.IO.File.Exists(tempFilePath))
                    {
                        System.IO.File.Delete(tempFilePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during Excel import: {ex.Message}");
                return StatusCode(500, $"An error occurred during import: {ex.Message}");
            }
        }

        [HttpPost("[controller]/ExportExcel")]
        [Authorize]
        public async Task<FileContentResult> GetScheduleExcel(IEnumerable<ExcelScheduleRecord> records)
        {
            try
            {
                _logger.LogInformation($"Starting Excel export process for {records?.Count() ?? 0} records");

                if (records == null || !records.Any())
                {
                    _logger.LogWarning("No records provided for Excel export");
                    throw new ArgumentException("No records provided for export");
                }

                _logger.LogInformation("Creating Excel file from schedule records");
                using var stream = _bookingService.CreateExcelFromScheduleRecords(records);

                var successCount = records.Count(r => r.IsSuccess);
                var failureCount = records.Count(r => !r.IsSuccess);

                _logger.LogInformation($"Excel export completed. Total records: {records.Count()}, " +
                                     $"Successful: {successCount}, Failed: {failureCount}");

                return new FileContentResult(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                {
                    FileDownloadName = "schedule_import_results.xlsx"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during Excel export: {ex.Message}");
                throw; // Re-throw to be handled by global exception handler
            }
        }

        [HttpPost("[controller]/ImportFromClient")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ExcelScheduleRecord>>> ImportBookingsFromClient([FromBody] List<ExcelScheduleRecord> scheduleRecords)
        {
            try
            {
                _logger.LogInformation($"Starting client-side schedule import process for {scheduleRecords?.Count ?? 0} records");

                if (scheduleRecords == null || !scheduleRecords.Any())
                {
                    _logger.LogWarning("No records provided for import");
                    return BadRequest("No records provided for import");
                }

                // Get the current user ID from the token
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return BadRequest("User ID not found or invalid");
                }

                // Process the schedule records through the service
                var results = await _bookingService.BookingClass(scheduleRecords, userId);

                var successCount = results.Count(r => r.IsSuccess);
                var failureCount = results.Count(r => !r.IsSuccess);

                _logger.LogInformation($"Client-side import completed. Total: {results.Count()}, " +
                                      $"Successful: {successCount}, Failed: {failureCount}");

                // Return both successful and failed results for client feedback
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during client-side import: {ex.Message}");
                return StatusCode(500, $"An error occurred during import: {ex.Message}");
            }
        }
        [HttpGet("[controller]/CategoryDescription")]
        public async Task<ActionResult<IEnumerable<CategoryDescription>>> GetAllDescription()
        {
            var listCategoryDescription = await _bookingRepository.GetAllCategoryDescription();
            return Ok(listCategoryDescription);

        }


        [HttpPost("[controller]/updateQuantitySubBooking")]
        [Authorize]
        public async Task<ActionResult> UpdateQuantitySubBooking([FromQuery] Guid subBookingId, [FromBody] Dictionary<Guid, List<Guid>> updatingGroup)
        {
            Guid buff;
            var subBookingCheck = _subBookingRepository.GetSubBookingById(subBookingId);
            if(subBookingCheck.Result.Approve == 10)
            {
				_logger.LogWarning("subbooking was approved");
				return BadRequest("Booking was approved");
			}


			try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return BadRequest("User ID not found in token");
                }
                buff = userId;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to decode token: {ex.Message}");
                return BadRequest($"Failed to decode token: {ex.Message}");
            }

            var lecturer = await _accountRepository.GetAccountsById(buff);
            if (lecturer == null)
            {
                _logger.LogWarning("User ID not found in DB");
                return BadRequest("User ID not found in DB");
            }

            await _studentInBookingRepository.DeleteAllStudentInBooking(subBookingId);
            await _groupInBookingRepository.DeleteAllGroupInBooking(subBookingId);

            SubBooking subBooking;
            Room room;

            try
            {
                _logger.LogInformation("Get infomation about subbooking and room");
                subBooking = await _subBookingRepository.GetSubBookingById(subBookingId);
                room = await _roomRepository.GetRoomsById(subBooking.Booking.RoomId.Value);
                _logger.LogTrace("Get oke");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error of get information: {ex.Message}");
                return Conflict($"Error of get information: {ex.Message}");
            }

            // Check xem thử số lượng học sinh or số lượng nhóm có vượt quá giới hạn hay không
            bool checkAvaliable = false;
            bool noDuplicateStudent = true;
            Dictionary<(DateTime date, string timeRange), AccountDetail[]> busyStudentsInfo = new Dictionary<(DateTime date, string timeRange), AccountDetail[]>();
            try
            {
                _logger.LogInformation("Start check avaliable student or group");
                var bookingIdByRoom = await _bookingRepository.GetAllBookingsByRoom(room.Id);
                Guid[] groupIds = updatingGroup.Keys.ToArray();
                Guid[] studentIds = updatingGroup.SelectMany(pair => pair.Value).ToArray();

                noDuplicateStudent = studentIds.Length == studentIds.Distinct().Count();

                checkAvaliable = await _subBookingRepository.checkPerfectAvaliableBookging(bookingIdByRoom, groupIds, studentIds, room, subBooking.StartTime, subBooking.EndTime, subBooking.Date);

                var listStudent = await _studentInGroupRepository.ExactlyStudentFree(studentIds, subBooking.Date, subBooking.StartTime, subBooking.EndTime);
                if (listStudent.Any())
                {
                    var busyStudents = listStudent.Select(student => student.Student.AccountDetail).ToArray();
                    (DateTime date, string timeRange) key = (subBooking.Date, subBooking.StartTime.ToString() + "-" + subBooking.EndTime.ToString());
                    if (busyStudentsInfo.ContainsKey(key))
                    {
                        var existingStudents = busyStudentsInfo[key];
                        var newStudents = existingStudents.Concat(busyStudents).ToArray();
                        busyStudentsInfo[key] = newStudents;
                    }
                    else
                    {
                        busyStudentsInfo.Add(key, busyStudents);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Error of check avaliable student or group: " + ex.Message);
                checkAvaliable = false;
                noDuplicateStudent = false;
            }

            if (!noDuplicateStudent)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = "Students cannot exist in multiple groups in the range time.",
                    Status = 400
                });
            }

            if (!checkAvaliable)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = $"Exceeding the number of {(room.OnlyGroupStatus ? "groups" : "students")} allowed",
                    Status = 400
                });
            }

            StringBuilder messages = new StringBuilder();
            foreach (var kvp in busyStudentsInfo)
            {
                var key = kvp.Key;
                var students = kvp.Value;

                foreach (var student in students)
                {
                    string message = $"Student {student.FullName} has a lesson on {key.date.ToString("yyyy-MM-dd")} in time {key.timeRange}.\n";
                    messages.Append(message);
                }
            }
            string allMessages = messages.ToString();
            if (!string.IsNullOrEmpty(allMessages))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = allMessages,
                    Status = 400
                });
            }

            foreach (var entry in updatingGroup)
            {
                Guid groupId = entry.Key;

                GroupInBooking groupInBooking = new GroupInBooking
                {
                    SubBookingId = subBookingId,
                    GroupId = groupId,
                    IsDeleted = false,
                    CreatedAt = DateTime.Now,
                    CreatedBy = lecturer.Id,
                };
                await _groupInBookingRepository.AddGroupInBooking(groupInBooking);
                List<Guid> studentInGroupIds = entry.Value;
                foreach (var studentInGroupId in studentInGroupIds)
                {
                    StudentInBooking studentInBooking = new StudentInBooking
                    {
                        StudentInGroupId = studentInGroupId,
                        GroupInBookingId = groupInBooking.Id,
                        CheckInTime = TimeOnly.FromDateTime(DateTime.Now),
                        CheckOutTime = TimeOnly.FromDateTime(DateTime.Now),
                        Status = false,
                        IsDeleted = false,
                        CreatedAt = DateTime.Now,
                        CreatedBy = lecturer.Id,
                    };
                    await _studentInBookingRepository.AddStudentInBooking(studentInBooking);
                }

            }
            return Content("Insert success!");

        }
        [HttpPost("[controller]/AddStudentToGroupInBooking")]
        [Authorize]
        public async Task<ActionResult> AddStudentToGroupInBooking([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("groupInBookingId", out JsonElement groupIdElem) ||
        !data.TryGetProperty("studentInGroupId", out JsonElement studentIdElem) ||
        !data.TryGetProperty("subBookingId", out JsonElement subBookingElem) ||
        !data.TryGetProperty("roomId", out JsonElement roomIdElem))
            {
                return BadRequest("Invalid input data.");
            }

            Guid groupInBookingId = Guid.Parse(groupIdElem.GetString());
            Guid studentInGroupId = Guid.Parse(studentIdElem.GetString());
            Guid subBookingId = Guid.Parse(subBookingElem.GetString());
            Guid roomId = Guid.Parse(roomIdElem.GetString());
            Guid buff;
            Task<StudentInGroup> studentInGroupBuff;
            Task<GroupInBooking> groupInBookingBuff;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
                {
                    _logger.LogWarning("User ID not found in token");
                    return BadRequest("User ID not found in token");
                }
                buff = userId;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to decode token: {ex.Message}");
                return BadRequest($"Failed to decode token: {ex.Message}");
            }

            var lecturer = await _accountRepository.GetAccountsById(buff);
            if (lecturer == null)
            {
                _logger.LogWarning("User ID not found in DB");
                return BadRequest("User ID not found in DB");
            }

            try
            {
                _logger.LogInformation("Get infomation about group in Booking and student in group");
                groupInBookingBuff = _groupInBookingRepository.GetGroupInBookingsById(groupInBookingId);
                if (groupInBookingBuff == null)
                {
                    _logger.LogWarning("group in booking not exist");
                    return BadRequest("group in booking not exist");
                }
                studentInGroupBuff = _studentInGroupRepository.GetStudentInGroupsById(studentInGroupId);
                if (studentInGroupBuff == null)
                {
                    _logger.LogWarning("student in group not exist");
                    return BadRequest("student in group not exist");
                }
                _logger.LogTrace("Get oke");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error of get information: {ex.Message}");
                return Conflict($"Error of get information: {ex.Message}");
            }

            SubBooking subBooking;
            Room room;

            try
            {
                _logger.LogInformation("Get infomation about subbooking and room");
                subBooking = await _subBookingRepository.GetSubBookingById(subBookingId);
                room = await _roomRepository.GetRoomsById(roomId);
                _logger.LogTrace("Get oke");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error of get information: {ex.Message}");
                return Conflict($"Error of get information: {ex.Message}");
            }

            // Check xem thử số lượng học sinh or số lượng nhóm có vượt quá giới hạn hay không
            bool checkAvaliable = false;
            bool noDuplicateStudent = true;
            Dictionary<(DateTime date, string timeRange), AccountDetail[]> busyStudentsInfo = new Dictionary<(DateTime date, string timeRange), AccountDetail[]>();
            try
            {
                _logger.LogInformation("Start check avaliable student or group");
                var bookingIdByRoom = await _bookingRepository.GetAllBookingsByRoom(room.Id);
                Guid[] groupIds = [groupInBookingBuff.Result.GroupId];
                Guid[] studentIds = [studentInGroupId];

                noDuplicateStudent = studentIds.Length == studentIds.Distinct().Count();

                checkAvaliable = await _subBookingRepository.checkPerfectAvaliableBookging(bookingIdByRoom, groupIds, studentIds, room, subBooking.StartTime, subBooking.EndTime, subBooking.Date);

                var listStudent = await _studentInGroupRepository.ExactlyStudentFree(studentIds, subBooking.Date, subBooking.StartTime, subBooking.EndTime);
                if (listStudent.Any())
                {
                    var busyStudents = listStudent.Select(student => student.Student.AccountDetail).ToArray();
                    (DateTime date, string timeRange) key = (subBooking.Date, subBooking.StartTime.ToString() + "-" + subBooking.EndTime.ToString());
                    if (busyStudentsInfo.ContainsKey(key))
                    {
                        var existingStudents = busyStudentsInfo[key];
                        var newStudents = existingStudents.Concat(busyStudents).ToArray();
                        busyStudentsInfo[key] = newStudents;
                    }
                    else
                    {
                        busyStudentsInfo.Add(key, busyStudents);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Error of check avaliable student or group: " + ex.Message);
                checkAvaliable = false;
                noDuplicateStudent = false;
            }

            if (!noDuplicateStudent)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = "Students cannot exist in multiple groups in the range time.",
                    Status = 400
                });
            }


            StringBuilder messages = new StringBuilder();
            foreach (var kvp in busyStudentsInfo)
            {
                var key = kvp.Key;
                var students = kvp.Value;

                foreach (var student in students)
                {
                    string message = $"Student {student.FullName} has a lesson on {key.date.ToString("yyyy-MM-dd")} in time {key.timeRange}.\n";
                    messages.Append(message);
                }
            }
            string allMessages = messages.ToString();
            if (!string.IsNullOrEmpty(allMessages))
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "BadRequest",
                    Detail = allMessages,
                    Status = 400
                });
            }


            StudentInBooking studentInBooking = new StudentInBooking
            {
                StudentInGroupId = studentInGroupId,
                GroupInBookingId = groupInBookingId,
                CheckInTime = TimeOnly.FromDateTime(DateTime.Now),
                CheckOutTime = TimeOnly.FromDateTime(DateTime.Now),
                Status = false,
                IsDeleted = false,
                CreatedAt = DateTime.Now,
                CreatedBy = lecturer.Id,
            };
            await _studentInBookingRepository.AddStudentInBooking(studentInBooking);

            return Content("Insert success!");


        }
        [HttpPost("[controller]/ExportStudentsExcel")]
        [Authorize]
        public ActionResult ExportStudentsExcel([FromBody] List<StudentDto> students)
        {
            try
            {
                _logger.LogInformation($"Starting Excel export for {students?.Count ?? 0} students");

                if (students == null || !students.Any())
                {
                    _logger.LogWarning("No students provided for Excel export");
                    return BadRequest("No students provided for export");
                }

                // Gọi service để tạo file Excel
                using var excelStream = _bookingService.ExportStudentsToExcel(students);

                _logger.LogInformation($"Excel export completed successfully for {students.Count} students");

                // Trả về file Excel để download
                return File(
                    excelStream.ToArray(),
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"students_export_{DateTime.Now:yyyyMMddHHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during student Excel export: {ex.Message}");
                return StatusCode(500, $"An error occurred during export: {ex.Message}");
            }
        }
    }
}
