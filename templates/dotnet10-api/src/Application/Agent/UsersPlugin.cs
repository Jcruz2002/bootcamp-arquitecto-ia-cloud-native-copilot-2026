using System.ComponentModel;
using System.Text.Json;
using Microsoft.SemanticKernel;

namespace Bootcamp.Api.Application.Agent;

public sealed class UsersPlugin
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false
    };

    private readonly IUserService _userService;
    private readonly ILogger<UsersPlugin> _logger;

    public UsersPlugin(IUserService userService, ILogger<UsersPlugin> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [KernelFunction("get_active_users")]
    [Description("Returns active users from the real bootcamp system as JSON")]
    public async Task<string> GetActiveUsers()
    {
        var users = await _userService.GetAllAsync(0, 1000, CancellationToken.None);
        var activeUsers = users.Where(u => string.Equals(u.Status, "active", StringComparison.OrdinalIgnoreCase)).ToList();
        var json = JsonSerializer.Serialize(activeUsers, JsonOptions);

        _logger.LogInformation("[AgentTool] tool={Tool} input={Input} output={Output}",
            "get_active_users",
            "{}",
            Truncate(json));

        return json;
    }

    [KernelFunction("summarize_users")]
    [Description("Summarizes totals of users from a JSON list")]
    public string SummarizeUsers([Description("JSON list of users")] string usersJson)
    {
        var users = JsonSerializer.Deserialize<List<UserResponse>>(usersJson, JsonOptions) ?? [];

        var total = users.Count;
        var active = users.Count(u => string.Equals(u.Status, "active", StringComparison.OrdinalIgnoreCase));
        var inactive = total - active;

        var summary = $"Total: {total}. Active: {active}. Inactive: {inactive}.";

        _logger.LogInformation("[AgentTool] tool={Tool} input={Input} output={Output}",
            "summarize_users",
            Truncate(usersJson),
            summary);

        return summary;
    }

    [KernelFunction("format_report")]
    [Description("Formats a final report for HTTP response")]
    public string FormatReport([Description("Summary text")] string summary)
    {
        var report = $"User Activity Report\nGeneratedAt(UTC): {DateTime.UtcNow:O}\n{summary}";

        _logger.LogInformation("[AgentTool] tool={Tool} input={Input} output={Output}",
            "format_report",
            summary,
            Truncate(report));

        return report;
    }

    private static string Truncate(string value)
    {
        if (value.Length <= 400)
        {
            return value;
        }

        return value[..400] + "...";
    }
}
