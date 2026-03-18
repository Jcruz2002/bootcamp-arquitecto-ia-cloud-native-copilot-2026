using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

public static class AuthExtensions
{
    private const string MultiOidcScheme = "oidc-multi";
    private const string KeycloakScheme = "oidc-keycloak";
    private const string GoogleScheme = "oidc-google";
    private const string EntraScheme = "oidc-entra";

    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration config)
    {
        var authMode = (config["Auth:Mode"] ?? "local").Trim().ToLowerInvariant();
        var isOidc = authMode == "oidc";

        if (isOidc)
        {
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = MultiOidcScheme;
                    options.DefaultChallengeScheme = MultiOidcScheme;
                })
                .AddPolicyScheme(MultiOidcScheme, MultiOidcScheme, options =>
                {
                    options.ForwardDefaultSelector = context => SelectSchemeFromIssuer(context, config);
                })
                .AddJwtBearer(KeycloakScheme, options =>
                {
                    ConfigureOidcScheme(
                        options,
                        config,
                        "Oidc:Providers:Keycloak",
                        config["Oidc:Authority"]
                    );
                })
                .AddJwtBearer(GoogleScheme, options =>
                {
                    ConfigureOidcScheme(
                        options,
                        config,
                        "Oidc:Providers:Google",
                        "https://accounts.google.com"
                    );
                })
                .AddJwtBearer(EntraScheme, options =>
                {
                    var tenantId = config["Oidc:Providers:Entra:TenantId"] ?? "common";
                    ConfigureOidcScheme(
                        options,
                        config,
                        "Oidc:Providers:Entra",
                        $"https://login.microsoftonline.com/{tenantId}/v2.0"
                    );
                });
        }
        else
        {
            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var secret = config["Jwt:Secret"];
                    var secretKey = Encoding.UTF8.GetBytes(secret ?? "");
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        NameClaimType = "name",
                        RoleClaimType = "role"
                    };
                });
        }

        services.AddAuthorization(options =>
        {
            options.AddPolicy("IsAdmin", policy =>
                policy.RequireAssertion(context => HasAnyRole(context.User, "admin")));

            options.AddPolicy("IsUser", policy =>
                policy.RequireAssertion(context => HasAnyRole(context.User, "user", "student", "admin")));
        });

        return services;
    }

    private static void ConfigureOidcScheme(
        JwtBearerOptions options,
        IConfiguration config,
        string sectionPrefix,
        string? fallbackAuthority = null)
    {
        var authority = config[$"{sectionPrefix}:Authority"] ?? fallbackAuthority;
        var audience = config[$"{sectionPrefix}:Audience"];
        var requireHttps = bool.TryParse(config[$"{sectionPrefix}:RequireHttpsMetadata"], out var requireHttpsValue)
            ? requireHttpsValue
            : false;
        var validateAudience = bool.TryParse(config[$"{sectionPrefix}:ValidateAudience"], out var validateAudienceValue)
            ? validateAudienceValue
            : false;

        if (string.IsNullOrWhiteSpace(authority))
        {
            throw new InvalidOperationException($"OIDC authority no configurada para {sectionPrefix}");
        }

        options.Authority = authority;
        options.Audience = string.IsNullOrWhiteSpace(audience) ? null : audience;
        options.RequireHttpsMetadata = requireHttps;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = validateAudience,
            NameClaimType = "preferred_username",
            RoleClaimType = "roles"
        };
    }

    private static string SelectSchemeFromIssuer(HttpContext context, IConfiguration config)
    {
        var authorization = context.Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return ResolveFallbackScheme(config);
        }

        var token = authorization.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrWhiteSpace(token))
        {
            return ResolveFallbackScheme(config);
        }

        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(token))
        {
            return ResolveFallbackScheme(config);
        }

        var jwtToken = handler.ReadJwtToken(token);
        var issuer = (jwtToken.Issuer ?? string.Empty).ToLowerInvariant();

        if (issuer.Contains("accounts.google.com"))
        {
            return GoogleScheme;
        }

        if (issuer.Contains("login.microsoftonline.com") || issuer.Contains("sts.windows.net"))
        {
            return EntraScheme;
        }

        if (issuer.Contains("/realms/"))
        {
            return KeycloakScheme;
        }

        return ResolveFallbackScheme(config);
    }

    private static string ResolveFallbackScheme(IConfiguration config)
    {
        var fallbackProvider = (config["Oidc:DefaultProvider"] ?? "keycloak").Trim().ToLowerInvariant();
        return fallbackProvider switch
        {
            "google" => GoogleScheme,
            "entra" => EntraScheme,
            _ => KeycloakScheme
        };
    }

    private static bool HasAnyRole(ClaimsPrincipal user, params string[] requiredRoles)
    {
        if (user?.Identity?.IsAuthenticated != true)
        {
            return false;
        }

        var expected = requiredRoles
            .Select(role => role.Trim().ToLowerInvariant())
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .ToHashSet();

        if (!expected.Any())
        {
            return false;
        }

        foreach (var role in expected)
        {
            if (user.IsInRole(role))
            {
                return true;
            }
        }

        var candidateValues = new List<string>();

        foreach (var claim in user.Claims)
        {
            if (claim.Type is "roles" or "role" or ClaimTypes.Role)
            {
                candidateValues.Add(claim.Value);
            }

            if (claim.Type == "realm_access")
            {
                try
                {
                    using var doc = JsonDocument.Parse(claim.Value);
                    if (doc.RootElement.TryGetProperty("roles", out var realmRoles) && realmRoles.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var item in realmRoles.EnumerateArray())
                        {
                            candidateValues.Add(item.GetString() ?? string.Empty);
                        }
                    }
                }
                catch
                {
                    // No interrumpe autenticacion si el claim no viene con el formato esperado.
                }
            }
        }

        foreach (var value in candidateValues)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            var trimmed = value.Trim();

            if (expected.Contains(trimmed.ToLowerInvariant()))
            {
                return true;
            }

            if (trimmed.StartsWith("["))
            {
                try
                {
                    var parsedRoles = JsonSerializer.Deserialize<string[]>(trimmed) ?? Array.Empty<string>();
                    if (parsedRoles.Any(role => expected.Contains((role ?? string.Empty).Trim().ToLowerInvariant())))
                    {
                        return true;
                    }
                }
                catch
                {
                    // Ignora arrays mal formados para no romper el flujo.
                }
            }

            if (trimmed.Contains(','))
            {
                var parsedRoles = trimmed.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                if (parsedRoles.Any(role => expected.Contains(role.ToLowerInvariant())))
                {
                    return true;
                }
            }
        }

        return false;
    }
}
