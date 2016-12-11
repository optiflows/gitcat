function DashboardCtrl($cookies, $http, $window, $location, ORG, MANIFEST, APPID) {

    /*
     * Controller attributes
     */

    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');

    var self = this;
    self.user = {};
    self.config = {whitelist: []};
    self.repos = [];
    self.diff = {};
    self.outdated = [];
    self.notVersioned = [];
    self.loading = false;
    self.index = -1;
    self.filter = null;


    /*
     * Controller methods
     */

    self.signout = function() {
        $cookies.remove('gitcat');
        $location.url('/');
    };

    self.href = function(url, fork) {
        if(fork) {
            $window.open(url, '_blank');
        } else {
            $window.location.href = url;
        }
    };

    self.hrefRepo = function(repo) {
        var url = 'https://github.com/' + ORG + '/' + repo;
        self.href(url, true);
    };

    self.request = function(method, path, data) {
        return $http({
            method: method,
            url: API + path,
            headers: {'Authorization': 'token ' + TOKEN},
            data: data
        });
    };

    self.query = function(keyword) {
        return _.filter(self.repos, function(item) {
            return item.indexOf(keyword) >= 0;
        });
    };

    self.filterRepos = function(repo) {
        if(self.search && repo.indexOf(self.search) < 0) { return false; }
        switch(self.filter) {
            case 'outdated':
                return self.diff[repo] ? self.diff[repo].ahead_by > 0 : false;
            case 'notVersioned':
                return !self.diff[repo];
            default:
                return true;
        }
    };


    /*
     * Entrypoint
     */

    var getConfig = function() {
        var path = '/users/' + self.user.login + '/gists';
        self.request('GET', path).then(function(res) {
            var name = 'gitcat-' + APPID.substring(0, 8) + '.json';
            var gist = _.find(res.data, function(g) { return name in g.files });

            if(!gist) {
                // Create a config into user's Gists
                var content = {};
                content[name] = {content: JSON.stringify(self.config)};
                self.request('POST', '/gists', {
                    description: 'Gitcat configuration file (auto-generated)',
                    public: false,
                    files: content
                });
            } else {
                // Get config from user's Gists
                $http.get(gist.files[name].raw_url).then(function(res) {
                    self.config = res.data;
                });
            }
        });
    };

    var getUser = function() {
        if(!TOKEN) { self.signout(); }
        self.request('GET', '/user').then(function(res) {
            self.user = res.data;
            getConfig();
        });
    };

    var loadRepos = function() {
        var counter = 0;
        var done = function() {
            self.loading = ++counter < self.repos.length;
            if(!self.loading) {
                self.outdated = _.map(_.filter(self.diff, function(diff) {
                    return diff.ahead_by > 0;
                }), 'repository');
                self.notVersioned = _.filter(self.repos, function(repo) {
                    return !self.diff[repo];
                });
            }
        };

        self.loading = true;
        angular.forEach(self.repos, function(repo) {
            // Get last tag for the repo
            var path = '/repos/' + ORG + '/' + repo + '/git/refs/tags';
            self.request('GET', path).then(function(res) {
                var index = res.data.length ? res.data.length - 1 : -1;
                if(index < 0) { done(); return; }

                var tag = res.data[index].ref.substring(10);
                // Compare commits between the last tag and HEAD
                path = '/repos/' + ORG + '/' + repo + '/compare/' + tag + '...HEAD';
                self.request('GET', path).then(function(res) {
                    angular.extend(res.data, {
                        last_tag: tag,
                        repository: repo
                    });
                    self.diff[repo] = res.data;
                    done();
                });
            }).catch(function(err) {
                done();
                console.error("Can't load '" + repo + "' info");
            });
        });
    };

    var getRepos = function() {
        // Github API path
        var path = '/repos/' + MANIFEST + '/contents/gitprojects.yml';

        // List files in the manifest's repo
        self.request('GET', path).then(function(res) {
            var url = res.data['download_url'];

            // Download the manifest from the repo
            $http.get(url).then(function(res) {
                // Parse the YAML file as JSON
                var manifest = jsyaml.load(res.data);

                // Get the repo names
                var repos = [];
                for(var alias in manifest) {
                    var names = manifest[alias]['repositories'];
                    repos = _.union(repos, names);
                }

                //self.repos = ['install-machine'];
                //self.repos = ['wings-auth', 'nyuki', 'wings-devenv'];
                self.repos = repos.sort();
                loadRepos();
            });
        }).catch(function(err) {
            console.error("Can't load Gitcat manifest at " + MANIFEST);
        });
    };

    getUser();
    //getRepos();
}
