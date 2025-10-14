using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ECom.Api.Controllers
{
    [ApiController]
    [Route("api/dev")]
    public class DevController : ControllerBase
    {
        [HttpPost("set-role")]
        public async Task<IActionResult> SetUserRole([FromQuery] string uid, [FromQuery] string role)
        {
            await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(
                uid,
                new Dictionary<string, object> { { "role", role } }
            );
            return Ok(new { message = $"Role '{role}' assigned to user {uid}" });
        }
    }
}
