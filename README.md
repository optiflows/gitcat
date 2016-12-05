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

Run a Docker container with the following environment variables:
* `GITHUB_APP_KEY`: application key (aka _Client ID_).
* `GITHUB_APP_SECRET`: application secret key (aka _Client Secret_).
* `GITHUB_ORGANIZATION`: organization name.
* `GITHUB_ORGANIZATION_MANIFEST`: organization/repo where the manisfest is stored.

For instance:
```bash
GITHUB_APP_KEY=12346789
GITHUB_APP_SECRET=987654321
GITHUB_ORGANIZATION=optiflows
GITHUB_ORGANIZATION_MANIFEST=optiflows/devenv
```

### 3. Manifest

The organization manifest is a YAML file that should be stored in a Github repository. It helps Gitcat to fetch a strict list of repos in the organization.

File name is `gitprojects.yml`. [More details](https://github.com/thavel/git-projects#configuration-syntax) on the syntax
