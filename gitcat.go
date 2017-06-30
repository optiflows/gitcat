package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/go-siris/middleware/cors"
	"github.com/go-siris/siris"
	sContext "github.com/go-siris/siris/context"
	"github.com/google/uuid"
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
func githubAuthHandler(ctx sContext.Context) {
	ctx.JSON(map[string]string{
		"url": config.AuthCodeURL("state", oauth2.AccessTypeOffline),
	})
}

// OAuth signin step 2
// [Github] Redirects the user to a callback URL with a code as param.
// [Backend] Handles the callback (rewrite).
func githubRedirect(ctx sContext.Context) {
	ctx.Redirect(fmt.Sprintf(
		"%s/#/?%s",
		ctx.GetHeader("Origin"),
		ctx.Request().URL.RawQuery,
	), siris.StatusMovedPermanently)
}

// OAuth signin step 3
// [Frontend] Uses callback data to request token.
// [Backend] Requests final token.
// [Frontend] Uses token to perform authorized requests to Github.
func githubTokenHandler(ctx sContext.Context) {
	var args TokenArgs
	ctx.ReadJSON(&args)
	token, err := config.Exchange(context.Background(), args.Code)
	if err != nil {
		log.Print(err)
		ctx.StatusCode(siris.StatusBadRequest)
		return
	}
	ctx.JSON(map[string]string{"token": token.AccessToken})
}

// Returns this Gitcat's app ID.
func gitcatAppID(ctx sContext.Context) {
	ctx.JSON(map[string]string{"gitcat_id": appID.String()})
}

func main() {
	flag.Parse()
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

	corsMiddle := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})

	app := siris.New()
	app.Use(corsMiddle)
	app.SPA(app.StaticHandler("./webapp", false, false))
	app.Get("/", func(ctx sContext.Context) {
		ctx.ServeFile("./webapp/index.html", false)
	})
	// app.StaticWeb("/static", "./webapp")
	auth := app.Party("/api/auth")
	{
		auth.Get("", githubRedirect)
		auth.Post("", githubAuthHandler)
		auth.Patch("", githubTokenHandler)
	}
	app.Get("/api/app", gitcatAppID)
	// log.Printf("Listening on %s", *flagPort)
	app.Run(siris.Addr(fmt.Sprintf(":%s", *flagPort)))
}
