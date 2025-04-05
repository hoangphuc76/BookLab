using System.Text.Json.Serialization;

namespace BookLabDTO
{
    public class TokenResponse : GoogleTokenResponse
    {
        public string JwtRefreshToken { get; set; }
        public string JwtToken { get; set; }
    
        [JsonIgnore] // Ignore this when serializing/deserializing
        public string GoogleRefreshToken 
        { 
            get => base.GoogleRefreshToken;
            set => base.GoogleRefreshToken = value;
        }
    }

}
