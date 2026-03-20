using System.ComponentModel.DataAnnotations;
using Bootcamp.Api.Application;
using Microsoft.AspNetCore.Mvc;

namespace Bootcamp.Api.Controllers;

[ApiController]
[Route("api/v1/agent")]
[Produces("application/json")]
public sealed class AgentController : ControllerBase
{
    private readonly IAgentService _agentService;

    public AgentController(IAgentService agentService)
    {
        _agentService = agentService;
    }

    [HttpPost("report")]
    [ProducesResponseType(typeof(AgentReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(object), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AgentReportResponse>> GenerateReport([FromBody] AgentReportRequest request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var report = await _agentService.RunAsync(request.Prompt, ct);
            return Ok(new AgentReportResponse(report, DateTime.UtcNow));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public sealed class AgentReportRequest
{
    [Required]
    [MaxLength(1000)]
    public string Prompt { get; init; } = string.Empty;
}

public sealed record AgentReportResponse(string Report, DateTime GeneratedAtUtc);
