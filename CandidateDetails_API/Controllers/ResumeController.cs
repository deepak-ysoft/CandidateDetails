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
using Microsoft.AspNetCore.Authorization;

namespace CandidateDetails_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,HR")]
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

                // Html,css,Bootstrap
                "Html", "css", "Html 5", "Bootstrap 5", "Bootstrap 4", "SCSS",

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

            // Extract skills only from the "Skills" section
            //string skillsSection = ExtractSkillsSection(text);
            List<string> skills = await ExtractSkillsAsync( skillTags,text);

           // List<string> experience = await ExtractExperienceAsync(text);

            return new ResumeParsedData
            {
                Name = name,
                Email = email,
                Phone = phone,
                Skills = skills
            };
        }
        private async Task<List<string>> ExtractSkillsAsync(List<string> skillTags, string text)
        {
            return await Task.Run(() =>
            {
                var skillsKeywords = new List<string> { "Experience", "Work History", "Professional Experience", "Skills", @"\nSkills", "Technical Skills", "Key Skills" };
                List<string> skills1 = new List<string>();

                // Extract skills section text
                string extractedSkillsText = "";

                foreach (var keyword in skillsKeywords)
                {
                    int index = text.IndexOf(keyword, StringComparison.OrdinalIgnoreCase);
                    if (index >= 0)
                    {
                        // Extract up to 500 characters after the keyword
                        string extractedPart = text.Substring(index, Math.Min(500, text.Length - index)).ToLower();
                        skills1.Add(extractedPart);
                    }
                }

                // Combine extracted skill sections into a single string
                extractedSkillsText = string.Join(" ", skills1);

                // Create a new list for matched skills
                List<string> matchedSkills = new List<string>();

                foreach (var skill in skillTags)
                {
                    string lowerSkill = skill.ToLower();
                    if (extractedSkillsText.Contains(lowerSkill, StringComparison.OrdinalIgnoreCase))
                    {
                        Console.WriteLine($"Matched Skill: {skill}");
                        matchedSkills.Add(skill);
                    }
                }

                return matchedSkills;
            });
        }

        //private string ExtractSkillsSection(string text)
        //{
        //    var skillsSectionStart = new[] { "Skills", @"\nSkills", "Technical Skills", "Key Skills" };
        //    var nextSectionStart = new[] { "Experience", @"\nExperience", "Work Experience", "Professional Experience", "Education", @"\nEducation", "Projects" };

        //    string lowerText = text.ToLower();
        //    int startIdx = -1;

        //    foreach (var marker in skillsSectionStart)
        //    {
        //        startIdx = lowerText.IndexOf(marker.ToLower());
        //        if (startIdx != -1) break;
        //    }

        //    if (startIdx == -1)
        //    {
        //        Console.WriteLine("Skills section not found.");
        //        return string.Empty;
        //    }

        //    int endIdx = text.Length;

        //    foreach (var marker in nextSectionStart)
        //    {
        //        int idx = lowerText.IndexOf(marker.ToLower(), startIdx + 1);
        //        if (idx != -1 && idx < endIdx)
        //        {
        //            endIdx = idx;
        //        }
        //    }

        //    string extractedSkillsSection = text.Substring(startIdx, endIdx - startIdx).Trim();
        //    Console.WriteLine($"Extracted Skills Section: {extractedSkillsSection}");

        //    return extractedSkillsSection;
        //}


        //private async Task<List<string>> ExtractSkillsAsync(string text, List<string> skillTags)
        //{
        //    var skills = new List<string>();

        //    if (string.IsNullOrWhiteSpace(text))
        //    {
        //        Console.WriteLine("Extracted skills section is empty.");
        //        return skills;
        //    }

        //    string lowerText = text.ToLower();

        //    foreach (var skill in skillTags)
        //    {
        //        string lowerSkill = skill.ToLower();
        //        if (lowerText.Contains(lowerSkill, StringComparison.OrdinalIgnoreCase))
        //        {
        //            Console.WriteLine($"Matched Skill: {skill}");
        //            skills.Add(skill);
        //        }
        //    }

        //    return await Task.FromResult(skills);
        //}

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
