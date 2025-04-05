namespace BookLab_Odata.Models
{
    public class JwtSettings
    {
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public string Key { get; set; }
        public int ExpiryInMinutes { get; set; }
        public int RefreshTokenExpiryDays { get; set; }
    }

}
