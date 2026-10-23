namespace HardwareStore.Services.Turnstile
{
    // Cloudflare Turnstile server-side secret. Put the real value in
    // appsettings.Development.json / user-secrets. When SecretKey is blank,
    // verification is skipped (captcha disabled) so forms keep working.
    public class TurnstileSettings
    {
        public string SecretKey { get; set; } = string.Empty;
    }
}
