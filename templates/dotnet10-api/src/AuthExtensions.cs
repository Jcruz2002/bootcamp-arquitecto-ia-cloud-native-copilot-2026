using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

public static class AuthExtensions
{
    public static IServiceCollection AddJwtAuth(this IServiceCollection services, IConfiguration config)
    {
        var authMode = (config["Auth:Mode"] ?? "local").Trim().ToLowerInvariant();
        var isOidc = authMode == "oidc";

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                if (isOidc)
                {
                    var authority = config["Oidc:Authority"];
                    var audience = config["Oidc:Audience"];
                    var requireHttps = bool.TryParse(config["Oidc:RequireHttpsMetadata"], out var value) ? value : false;
                    var validateAudience = bool.TryParse(config["Oidc:ValidateAudience"], out var audienceValue) ? audienceValue : false;

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
                    return;
                }

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

        services.AddAuthorization(options =>
        {
            options.AddPolicy("IsAdmin", policy => policy.RequireRole("admin"));
            options.AddPolicy("IsUser", policy => policy.RequireRole("user", "admin"));
        });

        return services;
    }
}
