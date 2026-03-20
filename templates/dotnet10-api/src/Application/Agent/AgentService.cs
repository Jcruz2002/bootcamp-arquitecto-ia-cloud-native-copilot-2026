using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;

namespace Bootcamp.Api.Application.Agent;

public sealed class AgentService : IAgentService
{
    private readonly IConfiguration _configuration;
    private readonly UsersPlugin _usersPlugin;
    private readonly ILogger<AgentService> _logger;

    public AgentService(
        IConfiguration configuration,
        UsersPlugin usersPlugin,
        ILogger<AgentService> logger)
    {
        _configuration = configuration;
        _usersPlugin = usersPlugin;
        _logger = logger;
    }

    public async Task<string> RunAsync(string prompt, CancellationToken ct)
    {
        var safePrompt = AgentPromptSanitizer.Sanitize(prompt);

        var endpoint = _configuration["AZURE_OPENAI_ENDPOINT"];
        var apiKey = _configuration["AZURE_OPENAI_KEY"];
        var deployment = _configuration["AZURE_OPENAI_DEPLOYMENT"];

        if (string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(deployment))
        {
            _logger.LogWarning("Azure OpenAI env vars are missing. Falling back to deterministic report mode.");
            return await BuildFallbackReportAsync();
        }

        try
        {
            var builder = Kernel.CreateBuilder();
            builder.AddAzureOpenAIChatCompletion(
                deploymentName: deployment,
                endpoint: endpoint,
                apiKey: apiKey);

            var kernel = builder.Build();

            // Only the minimum toolset is registered to limit capabilities.
            kernel.Plugins.AddFromObject(_usersPlugin, "users");

            var settings = new OpenAIPromptExecutionSettings
            {
                ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
                Temperature = 0.1,
                MaxTokens = 600
            };

            var systemPrompt =
                "You are a reporting agent for the bootcamp users API. " +
                "Use tools to collect active users, summarize, and format report. " +
                "Do not invent user counts. Keep output concise.";

            var finalPrompt = $"{systemPrompt}\nUserPrompt: {safePrompt}";

            _logger.LogInformation("[Agent] Running prompt with tool-calling. prompt={Prompt}", safePrompt);

            var result = await kernel.InvokePromptAsync(finalPrompt, new KernelArguments(settings));
            return result.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Agent] Semantic Kernel execution failed. Using fallback mode.");
            return await BuildFallbackReportAsync();
        }
    }

    private async Task<string> BuildFallbackReportAsync()
    {
        var usersJson = await _usersPlugin.GetActiveUsers();
        var summary = _usersPlugin.SummarizeUsers(usersJson);
        return _usersPlugin.FormatReport(summary) + "\nMode: fallback (no Azure OpenAI configuration).";
    }
}
