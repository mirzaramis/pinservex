using System.Text;
using System.Text.Encodings.Web;
using HardwareStore.DTOs.Request;
using HardwareStore.Services.Email;
using HardwareStore.Services.Turnstile;
using Microsoft.AspNetCore.Mvc;

namespace HardwareStore.Controllers
{
    [ApiController]
    [Route("api")]
    public class MessagesController : ControllerBase
    {
        private readonly IEmailSender _email;
        private readonly ITurnstileVerifier _turnstile;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(IEmailSender email, ITurnstileVerifier turnstile, ILogger<MessagesController> logger)
        {
            _email = email;
            _turnstile = turnstile;
            _logger = logger;
        }

        [HttpPost("subscribe")]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest req)
        {
            var rows = new (string, string?)[] { ("Email", req.Email) };
            return await Send(req, "New newsletter subscriber", "New Subscription", rows, req.Email, req.Email);
        }

        [HttpPost("quote")]
        public async Task<IActionResult> Quote([FromBody] QuoteRequest req)
        {
            var rows = new (string, string?)[]
            {
                ("Name", req.Name), ("Company", req.Company), ("Email", req.Email), ("Phone", req.Phone),
                ("Part number", req.PartNumber), ("Quantity", req.Quantity), ("Message", req.Message),
            };
            return await Send(req, $"New quote request from {req.Name}", "New Quote Request", rows, req.Email, req.Name);
        }

        [HttpPost("contact")]
        public async Task<IActionResult> Contact([FromBody] ContactRequest req)
        {
            var rows = new (string, string?)[]
            {
                ("Name", req.Name), ("Company", req.Company), ("Email", req.Email), ("Phone", req.Phone),
                ("Subject", req.Subject), ("Message", req.Message),
            };
            var subject = string.IsNullOrWhiteSpace(req.Subject)
                ? $"New contact message from {req.Name}"
                : $"Contact: {req.Subject} — {req.Name}";
            return await Send(req, subject, "New Contact Message", rows, req.Email, req.Name);
        }

        [HttpPost("product-inquiry")]
        public async Task<IActionResult> ProductInquiry([FromBody] ProductInquiryRequest req)
        {
            var rows = new (string, string?)[]
            {
                ("Name", req.Name), ("Company", req.Company), ("Email", req.Email), ("Phone", req.Phone),
                ("Product", req.ProductName), ("SKU", req.Sku), ("Part number", req.PartNumber),
                ("Quantity", req.Quantity), ("Message", req.Message),
            };
            return await Send(req, $"Product requirement: {req.ProductName} — {req.Name}", "New Product Requirement", rows, req.Email, req.Name);
        }

        private async Task<IActionResult> Send(SpamGuardedRequest req, string subject, string heading, (string Label, string? Value)[] rows, string replyTo, string replyToName)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            // Honeypot: real users never fill this. Silently accept (don't tip off bots), but drop it.
            if (!string.IsNullOrWhiteSpace(req.Website))
            {
                _logger.LogInformation("Dropped honeypot submission ({Subject})", subject);
                return Ok(new { message = "Sent" });
            }

            // Cloudflare Turnstile (skipped automatically when no secret is configured).
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            if (!await _turnstile.VerifyAsync(req.TurnstileToken, remoteIp))
                return BadRequest(new { message = "Captcha verification failed. Please try again." });

            try
            {
                await _email.SendAsync(subject, BuildHtml(heading, rows), replyTo, replyToName);
                return Ok(new { message = "Sent" });
            }
            catch (InvalidOperationException ex)
            {
                // Email not configured yet.
                _logger.LogError(ex, "Email not configured");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Email service is not configured." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send website email: {Subject}", subject);
                return StatusCode(StatusCodes.Status502BadGateway, new { message = "Could not send the message. Please try again later." });
            }
        }

        private static string BuildHtml(string heading, (string Label, string? Value)[] rows)
        {
            var enc = HtmlEncoder.Default;
            var sb = new StringBuilder();
            sb.Append("<div style=\"font-family:Arial,Helvetica,sans-serif;color:#111;\">");
            sb.Append($"<h2 style=\"color:#991135;margin:0 0 16px;\">{enc.Encode(heading)}</h2>");
            sb.Append("<table style=\"border-collapse:collapse;width:100%;max-width:620px;\">");
            foreach (var (label, value) in rows)
            {
                if (string.IsNullOrWhiteSpace(value)) continue;
                var safe = enc.Encode(value).Replace("\n", "<br>");
                sb.Append("<tr>");
                sb.Append($"<td style=\"padding:8px 12px;border:1px solid #eee;background:#fafafa;font-weight:bold;white-space:nowrap;vertical-align:top;\">{enc.Encode(label)}</td>");
                sb.Append($"<td style=\"padding:8px 12px;border:1px solid #eee;\">{safe}</td>");
                sb.Append("</tr>");
            }
            sb.Append("</table>");
            sb.Append("<p style=\"margin-top:16px;color:#888;font-size:12px;\">Sent from the Pinservex website.</p>");
            sb.Append("</div>");
            return sb.ToString();
        }
    }
}
