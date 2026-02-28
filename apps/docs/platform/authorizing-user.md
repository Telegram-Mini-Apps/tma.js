# Authorizing User

This article provides code examples in different programming languages on how a developer could authorize a user using
Telegram [init data](init-data.md).

## Client

First of all, it is required to begin with the transmitting init data from the client side to the server. We could do it
using this code:

```typescript
import { retrieveRawInitData } from '@tma.js/sdk'

const initDataRaw = retrieveRawInitData()

fetch('https://example.com/api', {
  method: 'POST',
  headers: {
    Authorization: `tma ${initDataRaw}`
  },
});
```

We are sending a request to an imaginary server using the `https://example.com/api` URL. This request uses the HTTP POST
method (you can use whatever you want) and appends the `Authorization` header, which is the most important here. It
represents a string containing 2 parts divided by a space. The first one describes the authorization method (in this
case, our server is going to support several others), and the second one contains authorization data. In the case of
Telegram Mini Apps, the second part is raw init data.

## Server

Now, when init data is transmitted to the server side, we should create a simple HTTP server which uses this data and
authorizes the user.

### Node.js

The Node.js example uses [express](https://www.npmjs.com/package/express) to process HTTP requests.

```typescript
import { validate, parse, type InitData } from '@tma.js/init-data-node';
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
  type Response,
} from 'express';

/**
 * Sets init data in the specified Response object.
 * @param res - Response object.
 * @param initData - init data.
 */
function setInitData(res: Response, initData: InitData): void {
  res.locals.initData = initData;
}

/**
 * Extracts init data from the Response object.
 * @param res - Response object.
 * @returns Init data stored in the Response object. Can return undefined in case,
 * the client is not authorized.
 */
function getInitData(res: Response): InitData | undefined {
  return res.locals.initData;
}

/**
 * Middleware which authorizes the external client.
 * @param req - Request object.
 * @param res - Response object.
 * @param next - function to call the next middleware.
 */
const authMiddleware: RequestHandler = (req, res, next) => {
  // We expect passing init data in the Authorization header in the following format:
  // <auth-type> <auth-data>
  // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
  const [authType, authData = ''] = (req.header('authorization') || '').split(' ');

  switch (authType) {
    case 'tma':
      try {
        // Validate init data.
        validate(authData, token, {
          // We consider init data sign valid for 1 hour from their creation moment.
          expiresIn: 3600,
        });

        // Parse init data. We will surely need it in the future.
        setInitData(res, parse(authData));
        return next();
      } catch (e) {
        return next(e);
      }
    // ... other authorization methods.
    default:
      return next(new Error('Unauthorized'));
  }
};

/**
 * Middleware which shows the user init data.
 * @param _req
 * @param res - Response object.
 * @param next - function to call the next middleware.
 */
const showInitDataMiddleware: RequestHandler = (_req, res, next) => {
  const initData = getInitData(res);
  if (!initData) {
    return next(new Error('Cant display init data as long as it was not found'));
  }
  res.json(initData);
};

/**
 * Middleware which displays the user init data.
 * @param err - handled error.
 * @param _req
 * @param res - Response object.
 */
const defaultErrorMiddleware: ErrorRequestHandler = (err, _req, res) => {
  res.status(500).json({
    error: err.message,
  });
};

// Your secret bot token.
const token = '1234567890:ABC';

// Create an Express applet and start listening to port 3000.
const app = express();

app.use(authMiddleware);
app.get('/', showInitDataMiddleware);
app.use(defaultErrorMiddleware);

app.listen(3000);

// After the HTTP server was launched, try sending an HTTP GET request to the URL 
// http://localhost:3000/ with an Authorization header containing data in the required format.
```

### GoLang

The GoLang example uses [gin](https://gin-gonic.com/) to process HTTP requests.

```go
package main

import (
	"context"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	initdata "github.com/telegram-mini-apps/init-data-golang"
)

type contextKey string

const (
	_initDataKey contextKey = "init-data"
)

// Returns new context with specified init data.
func withInitData(ctx context.Context, initData initdata.InitData) context.Context {
	return context.WithValue(ctx, _initDataKey, initData)
}

// Returns the init data from the specified context.
func ctxInitData(ctx context.Context) (initdata.InitData, bool) {
	initData, ok := ctx.Value(_initDataKey).(initdata.InitData)
	return initData, ok
}

// Middleware which authorizes the external client.
func authMiddleware(token string) gin.HandlerFunc {
	return func(context *gin.Context) {
		// We expect passing init data in the Authorization header in the following format:
		// <auth-type> <auth-data>
		// <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
		authParts := strings.Split(context.GetHeader("authorization"), " ")
		if len(authParts) != 2 {
			context.AbortWithStatusJSON(401, map[string]any{
				"message": "Unauthorized",
			})
			return
		}

		authType := authParts[0]
		authData := authParts[1]

		switch authType {
		case "tma":
			// Validate init data. We consider init data sign valid for 1 hour from their
			// creation moment.
			if err := initdata.Validate(authData, token, time.Hour); err != nil {
				context.AbortWithStatusJSON(401, map[string]any{
					"message": err.Error(),
				})
				return
			}

			// Parse init data. We will surely need it in the future.
			initData, err := initdata.Parse(authData)
			if err != nil {
				context.AbortWithStatusJSON(500, map[string]any{
					"message": err.Error(),
				})
				return
			}

			context.Request = context.Request.WithContext(
				withInitData(context.Request.Context(), initData),
			)
		}
	}
}

// Middleware which shows the user init data.
func showInitDataMiddleware(context *gin.Context) {
	initData, ok := ctxInitData(context.Request.Context())
	if !ok {
		context.AbortWithStatusJSON(401, map[string]any{
			"message": "Init data not found",
		})
		return
	}

	context.JSON(200, initData)
}

func main() {
	// Your secret bot token.
	token := "1234567890:ABC"

	r := gin.New()

	r.Use(authMiddleware(token))
	r.GET("/", showInitDataMiddleware)

	if err := r.Run(":3000"); err != nil {
		panic(err)
	}
}
```

### C#

The C# example uses [ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/) to process HTTP requests. Validation is done using the built-in `System.Security.Cryptography` — no additional packages required.
```csharp
using System.Security.Cryptography;
using System.Text;
using System.Web;

// Models
public record TelegramUser(long Id, bool IsBot, string FirstName, string? LastName, string? Username, string? LanguageCode);
public record InitData(string? QueryId, TelegramUser? User, long AuthDate, string? StartParam, string Hash);

// Helper to validate and parse Telegram Mini Apps init data.
public static class TelegramInitData
{
    // Validates init data. Throws exception if invalid or expired.
    public static void Validate(string initDataRaw, string botToken, TimeSpan expiresIn)
    {
        var parsed = HttpUtility.ParseQueryString(initDataRaw);
        var hash = parsed["hash"] ?? throw new InvalidOperationException("Hash is missing");

        var dataCheckString = string.Join("\n", parsed.AllKeys
            .Where(k => k != "hash")
            .OrderBy(k => k)
            .Select(k => $"{k}={parsed[k]}"));

        var secretKey = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes("WebAppData"),
            Encoding.UTF8.GetBytes(botToken));

        var computedHash = Convert.ToHexString(
            HMACSHA256.HashData(secretKey, Encoding.UTF8.GetBytes(dataCheckString))
        ).ToLower();

        if (computedHash != hash)
            throw new UnauthorizedAccessException("Invalid hash");

        if (!long.TryParse(parsed["auth_date"], out var authDateUnix))
            throw new InvalidOperationException("auth_date is missing or invalid");

        if (DateTimeOffset.UtcNow - DateTimeOffset.FromUnixTimeSeconds(authDateUnix) > expiresIn)
            throw new UnauthorizedAccessException("Init data expired");
    }

    // Parses raw init data string into InitData object.
    public static InitData Parse(string initDataRaw)
    {
        var parsed = HttpUtility.ParseQueryString(initDataRaw);

        TelegramUser? user = null;
        if (parsed["user"] is { } userJson)
            user = System.Text.Json.JsonSerializer.Deserialize<TelegramUser>(userJson,
                new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.SnakeCaseLower
                });

        return new InitData(
            QueryId: parsed["query_id"],
            User: user,
            AuthDate: long.Parse(parsed["auth_date"] ?? "0"),
            StartParam: parsed["start_param"],
            Hash: parsed["hash"]!
        );
    }
}

// Middleware which authorizes the external client.
public class TelegramAuthMiddleware(RequestDelegate next, IConfiguration config)
{
    private readonly string _botToken = config["BotToken"]
        ?? throw new ArgumentNullException("BotToken is not configured");

    public async Task InvokeAsync(HttpContext context)
    {
        // We expect passing init data in the Authorization header in the following format:
        // <auth-type> <auth-data>
        // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
        var parts = context.Request.Headers.Authorization.ToString().Split(' ', 2);

        if (parts.Length != 2)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
            return;
        }

        var authType = parts[0];
        var authData = parts[1];

        switch (authType)
        {
            case "tma":
                try
                {
                    // Validate init data. We consider init data sign valid for 1 hour from their
                    // creation moment.
                    TelegramInitData.Validate(authData, _botToken, TimeSpan.FromHours(1));

                    // Parse init data. We will surely need it in the future.
                    context.Items["InitData"] = TelegramInitData.Parse(authData);
                    await next(context);
                }
                catch (UnauthorizedAccessException ex)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { message = ex.Message });
                }
                catch (Exception ex)
                {
                    context.Response.StatusCode = 500;
                    await context.Response.WriteAsJsonAsync(new { message = ex.Message });
                }
                break;

            default:
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
                break;
        }
    }
}

// Middleware which shows the user init data.
public class ShowInitDataMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Items["InitData"] is not InitData initData)
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { message = "Init data not found" });
            return;
        }

        await context.Response.WriteAsJsonAsync(initData);
    }
}

// Your secret bot token.
var builder = WebApplication.CreateBuilder(args);
builder.Configuration["BotToken"] = "1234567890:ABC";

var app = builder.Build();

app.UseMiddleware<TelegramAuthMiddleware>();
app.UseMiddleware<ShowInitDataMiddleware>();

app.Run("http://localhost:3000");
```
