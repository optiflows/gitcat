package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/valyala/fasthttp"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
)

type TokenArgs struct {
	State string `json:state`
	Code  string `json:code`
}

const (
	APPKEY    = "GITHUB_APP_KEY"
	APPSECRET = "GITHUB_APP_SECRET"
	SCOPE     = "gist,read:org,repo"
)

var (
	flagPort  = flag.String("port", "8080", "Server port")
	appKey    = os.Getenv(APPKEY)
	appSecret = os.Getenv(APPSECRET)

	config oauth2.Config
	appID  uuid.UUID
)

// OAuth signin step 1
// [Backend] Requests authentication URL to Github.
// [Frontend] Redirects the user to the authentication URL.
func githubAuthHandler(ctx *fasthttp.RequestCtx) {
	url := config.AuthCodeURL("state", oauth2.AccessTypeOffline)
	url = fmt.Sprintf("{\"url\":\"%s\"}", url)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte(url))
}

// OAuth signin step 2
// [Github] Redirects the user to a callback URL with a code as param.
// [Backend] Handles the callback (rewrite).
func githubRedirect(ctx *fasthttp.RequestCtx) {
	args := ctx.QueryArgs()
	scheme := ctx.Request.Header.Peek("X-Forwarded-Proto")
	if scheme == nil {
		scheme = ctx.URI().Scheme()
	}
	url := fmt.Sprintf("%s://%s/#/?%s", scheme, ctx.URI().Host(), args.String())
	ctx.Redirect(url, fasthttp.StatusMovedPermanently)
}

// OAuth signin step 3
// [Frontend] Uses callback data to request token.
// [Backend] Requests final token.
// [Frontend] Uses token to perform authorized requests to Github.
func githubTokenHandler(ctx *fasthttp.RequestCtx) {
	args := TokenArgs{}
	json.Unmarshal(ctx.PostBody(), &args)
	token, err := config.Exchange(context.Background(), args.Code)
	if err != nil {
		log.Print(err)
		ctx.SetStatusCode(fasthttp.StatusBadRequest)
		return
	}
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte(fmt.Sprintf("{\"token\":\"%s\"}", token.AccessToken)))
}

// Returns this Gitcat's app ID.
func gitcatAppID(ctx *fasthttp.RequestCtx) {
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte(fmt.Sprintf("{\"gitcat_id\":\"%s\"}", appID.String())))
}

func CORS(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")
		ctx.Response.Header.Set("Access-Control-Allow-Headers", "authorization")
		ctx.Response.Header.Set("Access-Control-Allow-Methods", "HEAD,GET,POST,PUT,DELETE,OPTIONS")
		ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
		next(ctx)
	}
}

func main() {
	if (appKey == "") || (appSecret == "") {
		log.Fatalf("Environment variables must be set: %s, %s", APPKEY, APPSECRET)
	}

	flag.Parse()
	// Generate this Gitcat app ID
	appID = uuid.NewSHA1(uuid.NameSpaceOID, []byte(appKey))
	config = oauth2.Config{
		ClientID:     appKey,
		ClientSecret: appSecret,
		Scopes:       []string{SCOPE},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://github.com/login/oauth/authorize",
			TokenURL: "https://github.com/login/oauth/access_token",
		},
	}

	fs := &fasthttp.FS{
		Root:               "./webapp",
		IndexNames:         []string{"index.html"},
		GenerateIndexPages: true,
		Compress:           false,
		AcceptByteRange:    false,
	}
	fsHandler := fs.NewRequestHandler()

	requestHandler := func(ctx *fasthttp.RequestCtx) {
		switch string(ctx.Path()) {
		case "/api/auth":
			switch string(ctx.Method()) {
			case "GET":
				githubRedirect(ctx)
			case "POST":
				githubAuthHandler(ctx)
			case "PATCH":
				githubTokenHandler(ctx)
			default:
				ctx.SetStatusCode(fasthttp.StatusMethodNotAllowed)
			}
		case "/api/app":
			switch string(ctx.Method()) {
			case "GET":
				gitcatAppID(ctx)
			default:
				ctx.SetStatusCode(fasthttp.StatusMethodNotAllowed)
			}
		default:
			fsHandler(ctx)
		}
	}

	log.Printf("Listening on %s", *flagPort)
	log.Fatal(fasthttp.ListenAndServe(
		fmt.Sprintf(":%s", *flagPort),
		CORS(requestHandler)),
	)
}
