using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using System.Text;
using CandidateDetails_API.Model;
using DocumentFormat.OpenXml.Drawing;
using Path = System.IO.Path;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using iText.Kernel.Pdf.Canvas.Parser;
using System.Linq;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        /// <summary>
        /// Upload resume and extract information
        /// </summary>
        /// <param name="file"> CV variable object</param>
        /// <returns> data of cv</returns>
        [HttpPost("UploadResume")]
        public async Task<ActionResult> UploadResume(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            string extractedText = string.Empty;

            // Save the file temporarily
            var filePath = Path.Combine(Path.GetTempPath(), file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Extract text based on file type (PDF, DOCX)
            if (file.FileName.EndsWith(".pdf"))
            {
                extractedText = await ExtractTextFromPdfAsync(filePath);// Implement PDF extraction here
            }
            else if (file.FileName.EndsWith(".docx"))
            {
                extractedText = await ExtractTextFromDocxAsync(filePath);  // Implement DOCX extraction here
            }

            // Parse extracted text
            var parsedData = await ParseResumeAsync(extractedText);

            return Ok(new { success = true, data = parsedData });
        }

        private async Task<ResumeParsedData> ParseResumeAsync(string text)
        {
            var skillTags = new List<string>
            {
                // .NET Developer
                ".NET Developer", "ASP.NET Core", "C#", ".NET Framework", "Entity Framework", "LINQ",
                "SQL Server", "Web API", "Blazor", "Microservices", "Azure DevOps", "MVC Architecture",

                // Angular
                "Angular", "AngularJS", "Angular 2+", "TypeScript", "RxJS", "NgRx", "JavaScript (ES6+)",
                "HTML5", "CSS3", "SCSS/SASS", "RESTful APIs", "Material Design", "Bootstrap",

                // React
                "React", "ReactJS", "Redux", "React Router", "JavaScript (ES6+)", "JSX", "Hooks",
                "Context API", "Next.js", "Styled Components", "Tailwind CSS", "REST/GraphQL APIs",

                // QA
                "QA", "Manual Testing", "Automation Testing", "Selenium", "JUnit", "TestNG", "Cypress",
                "API Testing", "Postman", "SoapUI", "Performance Testing", "JMeter", "Bug Tracking",
                "JIRA", "Regression Testing", "CI/CD Pipeline Testing",

                // BDE
                "BDE", "Client Relationship Management", "Lead Generation", "Sales Strategy",
                "CRM Tools", "Market Research", "Proposal Writing", "Cold Calling", "Negotiation Skills",
                "Business Analysis", "Networking", "Sales Pipeline Management",

                // React JS
                "ReactJS", "Redux", "React Native", "Next.js", "TypeScript", "JavaScript (ES6+)",
                "Webpack", "Babel", "Material UI", "Ant Design", "Context API",

                // MERN Stack Developer
                "MERN Stack Developer", "MongoDB", "Express.js", "ReactJS", "Node.js", "Mongoose",
                "RESTful APIs", "GraphQL", "JWT Authentication", "Redux/Context API",
                "Docker", "Kubernetes", "Git", "GitHub",

                // SQL Server
                "Microsoft SQL Server", "SQL Database Management", "T-SQL (Transact-SQL)",
                "SQL Server Integration Services (SSIS)", "SQL Server Reporting Services (SSRS)",
                "SQL Server Analysis Services (SSAS)", "Database Administration (DBA)",
                "Database Query Optimization", "Stored Procedures Development", "Microsoft Azure SQL",

                // MySQL
                "MySQL Database Management", "Relational Database Management Systems (RDBMS)",
                "MariaDB", "Database Schema Design", "MySQL Workbench", "Database Query Optimization",
                "CRUD Operations with MySQL", "MySQL Performance Tuning", "Database Backup and Recovery",
                "Open Source Databases",

                // Node.js
                "Node.js Development", "Server-Side JavaScript", "Express.js Framework",
                "REST API Development", "Backend Development", "JavaScript Runtime Environment",
                "Asynchronous Programming", "Web Server Development", "Real-Time Applications (e.g., Socket.io)",
                "Full-Stack Development (Node.js + Frontend Frameworks)"
            };
            string name = await ExtractNameAsync(text);
            string email = await ExtractEmailAsync(text);
            string phone = await ExtractPhoneAsync(text);
            List<string> skills = await ExtractSkillsAsync(text, skillTags);
            List<string> experience = await ExtractExperienceAsync(text);

            return new ResumeParsedData
            {
                Name = name,
                Email = email,
                Phone = phone,
                Skills = skills,
                Experience = experience
            };
        }
        private async Task<List<string>> ExtractExperienceAsync(string text)
        {
            return await Task.Run(() =>
            {
                var experienceKeywords = new List<string> { "Experience", "Work History", "Professional Experience" };
                List<string> experiences = new List<string>();

                foreach (var keyword in experienceKeywords)
                {
                    int index = text.IndexOf(keyword, StringComparison.OrdinalIgnoreCase);
                    if (index >= 0)
                    {
                        // Extract the section of text following the keyword (adjust logic for better precision)
                        experiences.Add(text.Substring(index, Math.Min(500, text.Length - index)));
                    }
                }
                return experiences;
            });
        }

        private async Task<List<string>> ExtractSkillsAsync(string text, List<string> skillKeywords)
        {
            return await Task.Run(() =>
            {
                List<string> foundSkills = new List<string>();
                foreach (var skill in skillKeywords)
                {
                    if (text.Contains(skill.ToLower(), StringComparison.OrdinalIgnoreCase) || text.Contains(skill, StringComparison.OrdinalIgnoreCase))
                    {
                        foundSkills.Add(skill);
                    }
                }
                return foundSkills;
            });
        }

        private Task<string> ExtractNameAsync(string text)
        {
            return Task.FromResult(ExtractName(text)); // The method is simple and doesn't need true async
        }

        private Task<string> ExtractEmailAsync(string text)
        {
            return Task.FromResult(ExtractEmail(text)); // Same as above
        }

        private Task<string> ExtractPhoneAsync(string text)
        {
            return Task.FromResult(ExtractPhone(text)); // Same as above
        }

        private string ExtractName(string text)
        {
            // Example: Try to match the first line (assuming it's the name)
            var lines = text.Split('\n');
            return lines.Length > 0 ? lines[0] : string.Empty;
        }

        private string ExtractEmail(string text)
        {
            var emailPattern = @"([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})";
            var match = Regex.Match(text, emailPattern);
            return match.Success ? match.Value : string.Empty;
        }

        private string ExtractPhone(string text)
        {
            var phonePattern = @"(\+?\d{1,2}[\s\-]?)?(\(\d{3}\)[\s\-]?)?[\d\-]{7,}";
            var match = Regex.Match(text, phonePattern);
            return match.Success ? match.Value : string.Empty;
        }

        private async Task<string> ExtractTextFromDocxAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                StringBuilder text = new StringBuilder();
                using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(filePath, false))
                {
                    var body = wordDoc.MainDocumentPart.Document.Body;
                    foreach (var paragraph in body.Elements<Paragraph>())
                    {
                        text.AppendLine(paragraph.InnerText);
                    }
                }
                return text.ToString();
            });
        }


        private async Task<string> ExtractTextFromPdfAsync(string filePath)
        {
            StringBuilder text = new StringBuilder();

            await Task.Run(() =>
            {
                using (var reader = new PdfReader(filePath))
                using (var pdfDocument = new PdfDocument(reader))
                {
                    for (int page = 1; page <= pdfDocument.GetNumberOfPages(); page++)
                    {
                        var strategy = new SimpleTextExtractionStrategy();
                        string pageText = PdfTextExtractor.GetTextFromPage(pdfDocument.GetPage(page), strategy);
                        text.AppendLine(pageText);
                    }
                }
            });

            return text.ToString();
        }
    }
}
