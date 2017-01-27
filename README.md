# Gitcat <img src="https://github.com/optiflows/gitcat/blob/master/webapp/images/gitcat.png" width="35px" height="30px">

Github-based release tool for multi-repository projects.

* Gitcat is available at [gitcat.surycat.io](http://gitcat.surycat.io).
* Gitcat can also be self-hosted.

![gif](https://github.com/optiflows/gitcat/blob/master/logo/demo.gif)



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

The following deployment process is recommend for **production**.

Run a Gitcat container with the following environment variables:
* `GITHUB_APP_KEY`: application key (aka _Client ID_).
* `GITHUB_APP_SECRET`: application secret key (aka _Client Secret_).

```bash
docker run --rm \
           -e GITHUB_APP_KEY=<key> \
           -e GITHUB_APP_SECRET=<secret-key> \
           surycat/gitcat:latest
```

#### Local

The following deployment processes are recommend for **development**.

##### Docker compose

You can use the `docker-compose.yml` file, all you need is to create and fill `config.env` before:
```bash
echo $'GITHUB_APP_KEY=<key>\nGITHUB_APP_SECRET=<secret-key>' > config.env
docker-compose build
docker-compose up -d
```

Your development is available at [localhost:8888](http://localhost:8888). 

##### Build locally

If you're not so much a big a fan of Docker, you can also build and run Gitcat locally:
```bash
go get -d -v ./...
go build
GITHUB_APP_KEY=xxx GITHUB_APP_SECRET=xxx ./gitcat -port 8888
```

If you're using the executable on another system, build a statically linked binary.
```bash
CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo
```



## Under the hood

Gitcat is a stateless micro-service providing a OAuth signin feature with Github and a simple static web server to host the UI (made of Javascript, HTML and CSS, sprinkled with some AngularJS dark magic).

The user runs and requests Github's API himself through his browser. Settings are stored in the user's private Gists; so basically, the user owns his data.

### Semantic versioning

Gitcat handles classic [semver](http://semver.org) (2.0.0) with or without `v`-prefix:
* `v1.2.3` format is supported.
* `1.2.3` format is supported.
* `v1.2.3-b4` format is supported.
* `version1` format is _not_ supported.
