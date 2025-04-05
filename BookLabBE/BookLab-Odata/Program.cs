
using BookLab_Odata.Models;
using BookLabModel;
using BookLabRepositories;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.OData;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BookLabServices;
using BookLabDTO;
using DotNetEnv;
using System.Diagnostics;
using Google;
using Microsoft.EntityFrameworkCore;


namespace BookLab_Odata
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // 1️⃣ Load biến từ file .env
            Env.Load();

// 2️⃣ Đọc danh sách biến từ file .env
//             var envVariables = File.ReadAllLines(".env") // Đọc từng dòng từ file .env
//                 .Where(line => !string.IsNullOrWhiteSpace(line) && !line.StartsWith("#")) // Loại bỏ dòng trống & comment
//                 .Select(line => line.Split('=', 2)) // Tách key=value
//                 .Where(parts => parts.Length == 2) // Chỉ giữ lại những dòng hợp lệ
//                 .ToDictionary(parts => parts[0].Trim(), parts => parts[1].Trim()); // Lưu vào Dictionary
//
// // 3️⃣ Ghi đè biến môi trường vào hệ thống
//             foreach (var pair in envVariables)
//             {
//                 Environment.SetEnvironmentVariable(pair.Key, pair.Value);
//             }

            var builder = WebApplication.CreateBuilder(args);
            builder.Configuration
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables()  // Thêm dòng này để đọc biến môi trường
            .Build();
            ConfigurationManager configuration = builder.Configuration;

            var connectionString = builder.Configuration.GetConnectionString("BookLabConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'BookLabConnection' not found or empty.");
            }
            Debug.WriteLine($"Connection String: {connectionString}");

            builder.Services.AddScoped(typeof(BookLabContext));



			builder.Services.AddControllers().AddOData(
             opt => opt.Select().Filter().Count().OrderBy().SetMaxTop(null).Expand().AddRouteComponents("odata", EdmModelBuilder.GetEdmModel()));
            // Add services to the container.

            //DI Repository
            builder.Services.AddScoped<IAccountRepository, AccountRepository>();
            builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            builder.Services.AddScoped<IBuildingRepository, BuildingRepository>();
            builder.Services.AddScoped<IRoomRepository, RoomRepository>();
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            builder.Services.AddScoped<ICampusRepository, CampusRepository>();
            builder.Services.AddScoped<ICategoryRoomRepository, CategoryRoomRepository>();
            builder.Services.AddScoped<IBookingRepository, BookingRepository>();
            builder.Services.AddScoped<IClassRepository, ClassRepository>();
            // builder.Services.AddScoped<IGroupInBookingRepository, GroupInBookingRepository>();
            // builder.Services.AddScoped<IStudentInGroupRepository, StudentInGroupRepository>();
            // builder.Services.AddScoped<IStudentInBookingRepository, StudentInBookingRepository>();
            // builder.Services.AddScoped<ISlotRepository, SlotRepository>();
            builder.Services.AddScoped<IAccountDetailRepository, AccountDetailRepository>();
            builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
            // builder.Services.AddScoped<IImageRoomRepository, ImageRoomRepository>();


            //DI Service
            // builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddScoped<IAwsS3Service, AwsS3Service>();
            // builder.Services.AddScoped<ITokenService, TokenService>();
            // builder.Services.AddScoped<IMeetingBookLabService, MeetingBookLabService>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            // builder.Services.AddScoped<IProfanityFilterService, ProfanityFilterService>();
            //
            // var emailConfig = configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
            // builder.Services.AddSingleton(emailConfig);
            // builder.Services.AddSingleton<EmailService>();
            // builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IBookingRepository, BookingRepository>();
            builder.Services.AddScoped<IGroupInBookingRepository, GroupInBookingRepository>();
            builder.Services.AddScoped<IStudentInGroupRepository, StudentInGroupRepository>();
            builder.Services.AddScoped<IStudentInBookingRepository, StudentInBookingRepository>();
            //builder.Services.AddScoped<ISlotRepository, SlotRepository>();
            builder.Services.AddScoped<IAccountDetailRepository, AccountDetailRepository>();
            //builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
            builder.Services.AddScoped<IImageRoomRepository, ImageRoomRepository>();
            builder.Services.AddScoped<ISubBookingRepository, SubBookingRepository>();


            //DI Service
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddScoped<IAwsS3Service, AwsS3Service>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IMeetingBookLabService, MeetingBookLabService>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped<IProfanityFilterService, ProfanityFilterService>();

            var emailConfig = configuration.GetSection("EmailConfiguration").Get<EmailConfiguration>();
            builder.Services.AddSingleton(emailConfig);
            builder.Services.AddSingleton<EmailService>();
            builder.Services.AddScoped<IEmailService, EmailService>();

            //Custom ignore cycle between entities
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                 options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);


            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //AutoMapper
            builder.Services.AddAutoMapper(typeof(MappingProfile)); // Đăng ký lớp MappingProfile


            //Config logger
            builder.Logging.ClearProviders(); // Xóa các provider mặc định nếu cần
            builder.Logging.AddConsole(); // Thêm logging vào console
            builder.Logging.AddDebug(); // Thêm logging vào debug

            //Configt jwt
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
            builder.Services.AddSingleton(jwtSettings);

            builder.Services.AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    // Cấu hình TokenValidationParameters từ JwtSettings
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings.Issuer, // "https://0.0.0.0:5001"
                        ValidAudience = jwtSettings.Audience, // "https://0.0.0.0:5001"
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtSettings.Key)), // "JWTAuthenticationHIGHsecuredPasswordVVVp1OH7Xzyr"
                        ClockSkew = TimeSpan.Zero
                    };

                    // Tùy chỉnh để lấy token từ cookie thay vì header Authorization
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var token = context.Request.Cookies["access_token"];
                            if (!string.IsNullOrEmpty(token))
                            {
                                context.Token = token;
                            }
                            return Task.CompletedTask;
                        }
                    };
                })
                .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
                {
                    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
                    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
                });

            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    policy =>
                    {
                        policy.WithOrigins("https://booklab-adminfaise-hoangphuc76-hoangphuc76s-projects.vercel.app", 
                                "https://booklabfaise-hoangphuc76-hoangphuc76s-projects.vercel.app",
                                "http://localhost:5173",
                                "http://localhost:5734")
                              .AllowCredentials()
                              .AllowAnyMethod()
                              .AllowAnyHeader();
                    });
            });

            builder.Services.AddMemoryCache();


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors();

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            // Custome fix
            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
