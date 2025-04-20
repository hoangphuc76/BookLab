using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookLabModel.Migrations
{
    /// <inheritdoc />
    public partial class ud6 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Rooms_ManagerId",
                table: "Rooms");

     

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_ManagerId",
                table: "Rooms",
                column: "ManagerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Rooms_ManagerId",
                table: "Rooms");

      

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_ManagerId",
                table: "Rooms",
                column: "ManagerId",
                unique: true,
                filter: "[ManagerId] IS NOT NULL");
        }
    }
}
