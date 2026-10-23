using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace HardwareStore.Services.Turnstile
{
    public interface ITurnstileVerifier
    {
        // True when a secret key is configured (captcha enforced).
        bool IsEnabled { get; }

        // Verifies a Turnstile token with Cloudflare. Returns true when captcha
        // is disabled, or when the token is valid.
        Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default);
    }

    public class TurnstileVerifier : ITurnstileVerifier
    {
        private const string VerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        private readonly HttpClient _http;
        private readonly TurnstileSettings _settings;
        private readonly ILogger<TurnstileVerifier> _logger;

        public TurnstileVerifier(HttpClient http, IOptions<TurnstileSettings> settings, ILogger<TurnstileVerifier> logger)
        {
            _http = http;
            _settings = settings.Value;
            _logger = logger;
        }

        public bool IsEnabled => !string.IsNullOrWhiteSpace(_settings.SecretKey);

        public async Task<bool> VerifyAsync(string? token, string? remoteIp, CancellationToken cancellationToken = default)
        {
            if (!IsEnabled) return true;
            if (string.IsNullOrWhiteSpace(token)) return false;

            var fields = new Dictionary<string, string>
            {
                ["secret"] = _settings.SecretKey,
                ["response"] = token,
            };
            if (!string.IsNullOrWhiteSpace(remoteIp))
                fields["remoteip"] = remoteIp;

            try
            {
                using var response = await _http.PostAsync(VerifyUrl, new FormUrlEncodedContent(fields), cancellationToken);
                var result = await response.Content.ReadFromJsonAsync<TurnstileResult>(cancellationToken);
                return result?.Success == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Turnstile verification request failed");
                return false;
            }
        }

        private sealed class TurnstileResult
        {
            [JsonPropertyName("success")] public bool Success { get; set; }
        }
    }
}
