using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bootcamp.Api.Controllers;

[ApiController]
[Route("api/v1/access")]
[Produces("application/json")]
public sealed class AccessController : ControllerBase
{
    [Authorize]
    [HttpGet("authenticated")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Authenticated()
    {
        var userName = User.Identity?.Name ?? User.FindFirst("preferred_username")?.Value ?? "unknown";
        return Ok(new
        {
            message = "Acceso autenticado (esperado: 200)",
            user = userName
        });
    }

    [Authorize(Policy = "IsAdmin")]
    [HttpGet("admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public IActionResult AdminOnly()
    {
        return Ok(new
        {
            message = "Acceso admin permitido (esperado: 200 con rol admin)"
        });
    }
}
