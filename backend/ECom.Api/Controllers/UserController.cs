using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Threading.Tasks;
using System.Linq;

namespace ECom.Api.Controllers
{
    [ApiController]
    [Route("api/dev")]
    public class UserController : ControllerBase
    {
        // 🔍 Kullanıcı bilgilerini al
        [HttpGet("get-user")]
        public async Task<IActionResult> GetUser([FromQuery] string uid)
        {
            var user = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);

            // Claim'leri oku (örnek olarak sadece role claim'ini alıyoruz)
            var claims = user.CustomClaims?.Any() == true
                ? string.Join(", ", user.CustomClaims.Select(c => $"{c.Key}:{c.Value}"))
                : "No custom claims";

            return Ok(new
            {
                user.Uid,
                user.Email,
                user.DisplayName,
                user.EmailVerified,
                claims
            });
        }
    }
}
