using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookLabModel.Migrations
{
    /// <inheritdoc />
    public partial class Ud1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Bookings_BookingId",
                table: "Feedbacks");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupInBookings_Bookings_BookingId",
                table: "GroupInBookings");

            migrationBuilder.DropIndex(
                name: "IX_GroupInBookings_BookingId",
                table: "GroupInBookings");

            migrationBuilder.DropColumn(
                name: "BookingId",
                table: "GroupInBookings");

            migrationBuilder.RenameColumn(
                name: "GroupCapacityStatus",
                table: "Rooms",
                newName: "OnlyGroupStatus");

            migrationBuilder.RenameColumn(
                name: "BookingId",
                table: "Feedbacks",
                newName: "SubBookingId");

            migrationBuilder.RenameIndex(
                name: "IX_Feedbacks_BookingId",
                table: "Feedbacks",
                newName: "IX_Feedbacks_SubBookingId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DOB",
                table: "AccountDetails",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_SubBookings_SubBookingId",
                table: "Feedbacks",
                column: "SubBookingId",
                principalTable: "SubBookings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_SubBookings_SubBookingId",
                table: "Feedbacks");

            migrationBuilder.RenameColumn(
                name: "OnlyGroupStatus",
                table: "Rooms",
                newName: "GroupCapacityStatus");

            migrationBuilder.RenameColumn(
                name: "SubBookingId",
                table: "Feedbacks",
                newName: "BookingId");

            migrationBuilder.RenameIndex(
                name: "IX_Feedbacks_SubBookingId",
                table: "Feedbacks",
                newName: "IX_Feedbacks_BookingId");

            migrationBuilder.AddColumn<Guid>(
                name: "BookingId",
                table: "GroupInBookings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DOB",
                table: "AccountDetails",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_GroupInBookings_BookingId",
                table: "GroupInBookings",
                column: "BookingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Bookings_BookingId",
                table: "Feedbacks",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GroupInBookings_Bookings_BookingId",
                table: "GroupInBookings",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id");
        }
    }
}
