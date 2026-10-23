namespace HardwareStore.Services.Email
{
    public interface IEmailSender
    {
        /// <summary>
        /// Sends a notification email to the configured destination (info@pinservex.com).
        /// <paramref name="replyTo"/> is the visitor's email so replies go to them.
        /// </summary>
        Task SendAsync(string subject, string htmlBody, string? replyTo = null, string? replyToName = null, CancellationToken cancellationToken = default);
    }
}
