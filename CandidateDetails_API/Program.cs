using CandidateDetails_API.IServices;
using CandidateDetails_API.Model;
using CandidateDetails_API.ServiceContent;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

// Add JWT Authentication
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? builder.Configuration["Jwt:Key"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable CORS (Allow all origins)
app.UseCors("AllowAllOrigins");

app.UseAuthentication();  // Add Authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();
