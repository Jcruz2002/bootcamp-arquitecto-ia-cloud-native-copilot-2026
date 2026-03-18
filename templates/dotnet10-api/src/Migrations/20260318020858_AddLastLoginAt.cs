using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLastLoginAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_Users_CreatedAt\" ON \"Users\" (\"CreatedAt\")");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_Users_Status_CreatedAt\" ON \"Users\" (\"Status\", \"CreatedAt\")");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Users_CreatedAt\"");
            migrationBuilder.Sql("DROP INDEX IF EXISTS \"IX_Users_Status_CreatedAt\"");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");
        }
    }
}
