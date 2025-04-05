using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookLabModel.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookingRoomSubbooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Rooms",
                newName: "RoomStatus");

            migrationBuilder.AlterColumn<int>(
                name: "Approve",
                table: "SubBookings",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<bool>(
                name: "GroupCapacityStatus",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TypeSlot",
                table: "Rooms",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Bookings",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<int>(
                name: "State",
                table: "Bookings",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupCapacityStatus",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "TypeSlot",
                table: "Rooms");

            migrationBuilder.RenameColumn(
                name: "RoomStatus",
                table: "Rooms",
                newName: "Status");

            migrationBuilder.AlterColumn<bool>(
                name: "Approve",
                table: "SubBookings",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "Type",
                table: "Bookings",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<bool>(
                name: "State",
                table: "Bookings",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
