using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookLabModel.Migrations
{
    /// <inheritdoc />
    public partial class UpdateId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Campuses_CampusId",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Buildings_Campuses_CampusId",
                table: "Buildings");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Accounts_LecturerId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_ImageRooms_Rooms_RoomId",
                table: "ImageRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentInGroups_Accounts_StudentId",
                table: "StudentInGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentInGroups_Groups_GroupId",
                table: "StudentInGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_SubBookings_Bookings_BookingId",
                table: "SubBookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "BookingId",
                table: "SubBookings",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "StudentId",
                table: "StudentInGroups",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "GroupId",
                table: "StudentInGroups",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "RoomId",
                table: "ImageRooms",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "LecturerId",
                table: "Groups",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "LecturerId",
                table: "Feedbacks",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "CampusId",
                table: "Buildings",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "CampusId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "AccountDetails",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Campuses_CampusId",
                table: "Accounts",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Buildings_Campuses_CampusId",
                table: "Buildings",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Accounts_LecturerId",
                table: "Groups",
                column: "LecturerId",
                principalTable: "Accounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ImageRooms_Rooms_RoomId",
                table: "ImageRooms",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentInGroups_Accounts_StudentId",
                table: "StudentInGroups",
                column: "StudentId",
                principalTable: "Accounts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StudentInGroups_Groups_GroupId",
                table: "StudentInGroups",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SubBookings_Bookings_BookingId",
                table: "SubBookings",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Campuses_CampusId",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_Buildings_Campuses_CampusId",
                table: "Buildings");

            migrationBuilder.DropForeignKey(
                name: "FK_Groups_Accounts_LecturerId",
                table: "Groups");

            migrationBuilder.DropForeignKey(
                name: "FK_ImageRooms_Rooms_RoomId",
                table: "ImageRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentInGroups_Accounts_StudentId",
                table: "StudentInGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentInGroups_Groups_GroupId",
                table: "StudentInGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_SubBookings_Bookings_BookingId",
                table: "SubBookings");

            migrationBuilder.AlterColumn<Guid>(
                name: "BookingId",
                table: "SubBookings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "StudentId",
                table: "StudentInGroups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "GroupId",
                table: "StudentInGroups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "RoomId",
                table: "ImageRooms",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "LecturerId",
                table: "Groups",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "LecturerId",
                table: "Feedbacks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CampusId",
                table: "Buildings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CampusId",
                table: "Accounts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StudentId",
                table: "AccountDetails",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Campuses_CampusId",
                table: "Accounts",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Buildings_Campuses_CampusId",
                table: "Buildings",
                column: "CampusId",
                principalTable: "Campuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Groups_Accounts_LecturerId",
                table: "Groups",
                column: "LecturerId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ImageRooms_Rooms_RoomId",
                table: "ImageRooms",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentInGroups_Accounts_StudentId",
                table: "StudentInGroups",
                column: "StudentId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentInGroups_Groups_GroupId",
                table: "StudentInGroups",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SubBookings_Bookings_BookingId",
                table: "SubBookings",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
