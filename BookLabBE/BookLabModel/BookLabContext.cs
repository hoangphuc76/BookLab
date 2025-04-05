using BookLabModel.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookLabModel
{
    public class BookLabContext : DbContext
    {
        public BookLabContext() : base()
        {
        }

		protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var builder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            IConfigurationRoot configuration = builder.Build();
            optionsBuilder.UseSqlServer(configuration.GetConnectionString("BookLabConnection"));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
			modelBuilder.Entity<StudentInBooking>()
		        .HasKey(s => new { s.StudentInGroupId, s.GroupInBookingId });
			//     modelBuilder.Entity<Account>()
			//         .HasOne(a => a.AccountDetail)
			//         .WithOne(ad => ad.Account)
			//         .HasForeignKey<AccountDetail>(ad => ad.Id);
			//
			//     modelBuilder.Entity<Account>()
			//         .HasOne(a => a.Role)
			//         .WithMany(r => r.Accounts)
			//         .HasForeignKey(a => a.RoleId);
			//
			//     modelBuilder.Entity<Building>()
			//         .HasOne(b => b.Campus)
			//         .WithMany(c => c.Buildings)
			//         .HasForeignKey(b => b.CampusId);
			//
			//     modelBuilder.Entity<Room>()
			//         .HasOne(r => r.Building)
			//         .WithMany(b => b.Rooms)
			//         .HasForeignKey(r => r.BuildingId)
			//         .OnDelete(DeleteBehavior.NoAction);
			//
			//     modelBuilder.Entity<Room>()
			//         .HasOne(r => r.CategoryRoom)
			//         .WithMany(cr => cr.Rooms)
			//         .HasForeignKey(r => r.CategoryRoomId);
			//
			//     modelBuilder.Entity<Booking>()
			//         .HasOne(b => b.Lecturer)
			//         .WithMany(a => a.Bookings)
			//         .HasForeignKey(b => b.LecturerId)
			//         .OnDelete(DeleteBehavior.NoAction);
			//
			//     modelBuilder.Entity<Booking>()
			//         .HasOne(b => b.Room)
			//         .WithMany(r => r.Bookings)
			//         .HasForeignKey(b => b.RoomId)
			//         .OnDelete(DeleteBehavior.NoAction);
			//
			//     modelBuilder.Entity<Feedback>()
			//         .HasOne(f => f.Booking)
			//         .WithMany(b => b.Feedbacks)
			//         .HasForeignKey(f => f.BookingId);
			//
			//     modelBuilder.Entity<StudentInGroup>()
			//         .HasOne(sg => sg.Group)
			//         .WithMany(g => g.StudentInGroups)
			//         .HasForeignKey(sg => sg.GroupId)
			//         .OnDelete(DeleteBehavior.Restrict);
			//
			//     modelBuilder.Entity<StudentInGroup>()
			//         .HasOne(sig => sig.Student)
			//         .WithMany(s => s.StudentsInGroup)
			//         .HasForeignKey(sig => sig.StudentId)
			//         .OnDelete(DeleteBehavior.Restrict);
			//
			//     modelBuilder.Entity<GroupInBooking>()
			//         .HasOne(gb => gb.Group)
			//         .WithMany(g => g.GroupInBookings)
			//         .HasForeignKey(gb => gb.GroupId);
			//
			//     modelBuilder.Entity<GroupInBooking>()
			//         .HasOne(gb => gb.Booking)
			//         .WithMany(b => b.GroupInBookings)
			//         .HasForeignKey(gb => gb.BookingId);
			//
			//     modelBuilder.Entity<StudentInBooking>()
			//         .HasKey(sb => new { sb.StudentInGroupId, sb.GroupInBookingId });
			//
			//     modelBuilder.Entity<StudentInBooking>()
			//         .HasOne(sb => sb.StudentInGroup)
			//         .WithMany(sg => sg.StudentInBookings)
			//         .HasForeignKey(sb => sb.StudentInGroupId);
			//
			//     modelBuilder.Entity<StudentInBooking>()
			//         .HasOne(sb => sb.GroupInBooking)
			//         .WithMany(gb => gb.StudentInBookings)
			//         .HasForeignKey(sb => sb.GroupInBookingId);
			//
			//     modelBuilder.Entity<FavouriteRoom>()
			//         .HasKey(fr => new { fr.AccountId, fr.RoomId });
			//
			//     modelBuilder.Entity<FavouriteRoom>()
			//         .HasOne(fr => fr.Account)
			//         .WithMany(a => a.FavoriteRooms)
			//         .HasForeignKey(fr => fr.AccountId)
			//         .OnDelete(DeleteBehavior.NoAction);
			//
			//     modelBuilder.Entity<FavouriteRoom>()
			//         .HasOne(fr => fr.Room)
			//         .WithMany(r => r.FavouriteRooms)
			//         .HasForeignKey(fr => fr.RoomId)
			//         .OnDelete(DeleteBehavior.NoAction);
			//
			//     modelBuilder.Entity<ImageCampus>()
			//         .HasOne(ic => ic.Campus)
			//         .WithMany(c => c.ImageCampuses)
			//         .HasForeignKey(ic => ic.CampusId);
			//
			//     modelBuilder.Entity<ImageBuilding>()
			//         .HasOne(ib => ib.Building)
			//         .WithMany(b => b.ImageBuildings)
			//         .HasForeignKey(ib => ib.BuildingId);
			//
			//     modelBuilder.Entity<ImageRoom>()
			//         .HasOne(ir => ir.Room)
			//         .WithMany(r => r.ImageRooms)
			//         .HasForeignKey(ir => ir.RoomId);
			//
			//     modelBuilder.Entity<Account>().Property(a => a.Status).HasDefaultValue(true);
			//     modelBuilder.Entity<Room>().Property(r => r.Status).HasDefaultValue(true);
			//     modelBuilder.Entity<Role>().Property(r => r.Status).HasDefaultValue(true);
			//     modelBuilder.Entity<CategoryRoom>().Property(cr => cr.Status).HasDefaultValue(true);
		}


        public virtual DbSet<Role> Roles { get; set; }


        public virtual DbSet<Campus> Campuses { get; set; }

        public virtual DbSet<Building> Buildings { get; set; }

        public virtual DbSet<CategoryRoom> CategoryRooms { get; set; }

        public virtual DbSet<Account> Accounts { get; set; }

        public virtual DbSet<AccountDetail> AccountDetails { get; set; }

        public virtual DbSet<Room> Rooms { get; set; }

        public virtual DbSet<Booking> Bookings { get; set; }

        public virtual DbSet<Group> Groups { get; set; }

        public virtual DbSet<StudentInGroup> StudentInGroups { get; set; }

        public virtual DbSet<GroupInBooking> GroupInBookings { get; set; }

        public virtual DbSet<StudentInBooking> StudentInBookings { get; set; }

        public virtual DbSet<Feedback> Feedbacks { get; set; }
        
        public virtual DbSet<ImageRoom> ImageRooms { get; set; }

        public virtual DbSet<FavouriteRoom> FavouriteRooms { get; set; }

        public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
        
        public virtual DbSet<Class> Classes { get; set; }
        
        public virtual DbSet<Area> Areas { get; set; }
        
        public virtual DbSet<CategoryDescription> CategoryDescriptions { get; set; }
        
        public virtual DbSet<PolicyOfRoom> PolicyOfRooms { get; set; }
        
        public virtual DbSet<Item> Items { get; set; }
        
        public virtual DbSet<CategoryItem> CategoryItems { get; set; }
        
        public virtual DbSet<SubBooking> SubBookings { get; set; }
        
        public virtual DbSet<ItemOfRoom> ItemOfRooms { get; set; }

    }

}
