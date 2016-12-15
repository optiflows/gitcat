package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/valyala/fasthttp"
	"golang.org/x/net/context"
	"golang.org/x/oauth2"
)

type TokenArgs struct {
	State string `json:state`
	Code  string `json:code`
}

var (
	config oauth2.Config
	key    string
)

func githubAuthHandler(ctx *fasthttp.RequestCtx) {
	url := config.AuthCodeURL("state", oauth2.AccessTypeOffline)
	url = fmt.Sprintf("{\"url\":\"%s\"}", url)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte(url))
}

func githubRedirect(ctx *fasthttp.RequestCtx) {
	args := ctx.QueryArgs()
	ctx.Redirect(fmt.Sprintf("/#/?%s", args.String()), fasthttp.StatusMovedPermanently)
}

func githubTokenHandler(ctx *fasthttp.RequestCtx) {
	args := TokenArgs{}
	json.Unmarshal(ctx.PostBody(), &args)
	// state := string(args.Peek("state"))
	token, err := config.Exchange(context.Background(), args.Code)
	if err != nil {
		log.Print(err)
		ctx.SetStatusCode(fasthttp.StatusBadRequest)
		return
	}
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte(fmt.Sprintf("{\"token\":\"%s\"}", token.AccessToken)))
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
	config = oauth2.Config{
		ClientID:     os.Getenv("GITHUB_APP_KEY"),
		ClientSecret: os.Getenv("GITHUB_APP_SECRET"),
		Scopes:       []string{"read:org,repo"},
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
				log.Print("Not yet")
			default:
				ctx.SetStatusCode(fasthttp.StatusMethodNotAllowed)
			}
		default:
			fsHandler(ctx)
		}
	}
	log.Print("Listening on :8080...")
	log.Fatal(fasthttp.ListenAndServe(":8080", CORS(requestHandler)))

	// // Start HTTP server.
	// if len(*addr) > 0 {
	// 	log.Printf("Starting HTTP server on %q", *addr)
	// 	go func() {
	// 		if err := fasthttp.ListenAndServe(*addr, requestHandler); err != nil {
	// 			log.Fatalf("error in ListenAndServe: %s", err)
	// 		}
	// 	}()
	// }

	// // Start HTTPS server.
	// if len(*addrTLS) > 0 {
	// 	log.Printf("Starting HTTPS server on %q", *addrTLS)
	// 	go func() {
	// 		if err := fasthttp.ListenAndServeTLS(*addrTLS, *certFile, *keyFile, requestHandler); err != nil {
	// 			log.Fatalf("error in ListenAndServeTLS: %s", err)
	// 		}
	// 	}()
	// }
}
