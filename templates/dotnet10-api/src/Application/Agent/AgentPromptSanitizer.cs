using System.Text;

namespace Bootcamp.Api.Application.Agent;

public static class AgentPromptSanitizer
{
    public static string Sanitize(string? prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
        {
            throw new InvalidOperationException("Prompt es obligatorio.");
        }

        if (prompt.Length > 1000)
        {
            throw new InvalidOperationException("Prompt excede 1000 caracteres.");
        }

        // Remove control chars except common whitespace.
        var sb = new StringBuilder(prompt.Length);
        foreach (var ch in prompt)
        {
            if (char.IsControl(ch) && ch is not ('\n' or '\r' or '\t'))
            {
                continue;
            }

            sb.Append(ch);
        }

        var clean = sb.ToString().Trim();
        if (string.IsNullOrWhiteSpace(clean))
        {
            throw new InvalidOperationException("Prompt inválido.");
        }

        return clean;
    }
}
