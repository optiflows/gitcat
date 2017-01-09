# Gitcat <img src="https://github.com/optiflows/gitcat/blob/master/webapp/images/gitcat.png" width="35px" height="30px">

Github-based release tool for multi-repository projects.

## Setup

### 1. Github

* Register a new application in your Github [settings](https://github.com/settings/developers).
* Make sure your _Authorization callback URL_ is valid
```
http://<gitcat_instance_domain>:<port>/api/auth
```
* Keep your _Client ID_ and _Client Secret_ keys.

### 2. Gitcat

#### Docker

Run a Gitcat container with the following environment variables:
* `GITHUB_APP_KEY`: application key (aka _Client ID_).
* `GITHUB_APP_SECRET`: application secret key (aka _Client Secret_).

#### Local

```bash
go get -d -v ./...
go build
GITHUB_APP_KEY=xxx GITHUB_APP_SECRET=xxx ./gitcat -port 8888
```

If using the executable on another system, build a statically linked binary.

```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo
```
