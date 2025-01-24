using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.ServiceContent;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
// Configure services
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 104857600; // 100 MB
});
// Add services to the container.
builder.Services.AddScoped<ICandidateService, CandidateServiceContent>(); // Register the service
builder.Services.AddScoped<ICalendarService, CalendarServiceContent>(); // Register the service
builder.Services.AddScoped<IEmployee, EmployeeServiceContent>(); // Register the service
builder.Services.AddScoped<IEmployeeLeave, EmployeeLeaveServiceContent>(); // Register the service
builder.Services.AddScoped<IAccount, AccountServiceContent>(); // Register the service
builder.Services.AddScoped<IAuthService, AuthServiceContent>(); // Register the service
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please insert Jwt with Bearer into field.",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },Array.Empty<string>()
        }
    });
});

// Add JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]))
    };
});

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefConn"));
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials()
               .SetIsOriginAllowed(origin => true);
    });
});

var app = builder.Build();
app.UseCors("AllowAll");
if (!Directory.Exists(Path.Combine(builder.Environment.ContentRootPath, "uploads")))
{
    Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "uploads"));
}
if (!Directory.Exists(Path.Combine(builder.Environment.ContentRootPath, "CandidateCV")))
{
    Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "CandidateCV"));
}
app.UseStaticFiles(); // General static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});
// Configure the HTTP request pipeline.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
    Path.Combine(builder.Environment.ContentRootPath, "CandidateCV")),
    RequestPath = "/CandidateCV"
});

app.UseSwagger();
app.UseSwaggerUI();


app.UseHttpsRedirection();

// Enable CORS (Allow all origins)
app.UseCors("AllowAllOrigins");

app.UseAuthentication();  // Add Authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();
