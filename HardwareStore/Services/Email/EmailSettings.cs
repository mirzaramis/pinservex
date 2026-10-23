namespace HardwareStore.Services.Email
{
    // Bound from the "Email" configuration section. Put the real SMTP host,
    // username and password in an untracked source (appsettings.Development.json
    // or user-secrets) — never commit credentials.
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public bool UseStartTls { get; set; } = true;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        // Envelope from / display name shown on the delivered mail.
        public string FromAddress { get; set; } = "info@pinservex.com";
        public string FromName { get; set; } = "Pinservex Website";

        // Where website form submissions are delivered.
        public string ToAddress { get; set; } = "info@pinservex.com";

        public bool IsConfigured =>
            !string.IsNullOrWhiteSpace(SmtpHost) &&
            !string.IsNullOrWhiteSpace(Username) &&
            !string.IsNullOrWhiteSpace(Password);
    }
}
