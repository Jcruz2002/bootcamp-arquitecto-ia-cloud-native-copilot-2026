namespace Bootcamp.Api.Application;

public interface IAgentService
{
    Task<string> RunAsync(string prompt, CancellationToken ct);
}
