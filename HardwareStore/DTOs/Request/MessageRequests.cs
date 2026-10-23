using System.ComponentModel.DataAnnotations;

namespace HardwareStore.DTOs.Request
{
    // Anti-spam fields shared by every public form.
    public abstract class SpamGuardedRequest
    {
        // Honeypot — hidden in the UI; real users leave it empty, bots fill it.
        public string? Website { get; set; }

        // Cloudflare Turnstile token from the widget.
        public string? TurnstileToken { get; set; }
    }

    // Newsletter signup (home page)
    public class SubscribeRequest : SpamGuardedRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    // "Need a Custom Quote" form (home page)
    public class QuoteRequest : SpamGuardedRequest
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Company { get; set; }
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PartNumber { get; set; }
        public string? Quantity { get; set; }
        public string? Message { get; set; }
    }

    // Contact form (contact page)
    public class ContactRequest : SpamGuardedRequest
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Company { get; set; }
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Subject { get; set; }
        [Required] public string Message { get; set; } = string.Empty;
    }

    // Bulk / product requirement form (product page)
    public class ProductInquiryRequest : SpamGuardedRequest
    {
        [Required] public string Name { get; set; } = string.Empty;
        public string? Company { get; set; }
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? ProductName { get; set; }
        public string? Sku { get; set; }
        public string? PartNumber { get; set; }
        public string? Quantity { get; set; }
        public string? Message { get; set; }
    }
}
