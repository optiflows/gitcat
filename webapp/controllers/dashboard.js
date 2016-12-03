function DashboardCtrl($cookies, $http, $window) {

    /*
     * Controller attributes
     */

    const ORG = 'optiflows';
    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');
    const MANIFEST = 'optiflows/devenv';

    var self = this;
    self.user = {};
    self.repos = [];
    self.diff = {};
    self.outdated = [];
    self.notVersioned = [];
    self.loading = false;


    /*
     * Controller methods
     */

    self.href = function(url) {
        $window.location.href = url;
    };

    self.request = function(path) {
        return $http({
            method: 'GET',
            url: API + path,
            headers: {'Authorization': 'token ' + TOKEN}
        });
    };

    self.query = function(keyword) {
        return _.filter(self.repos, function(item) {
            return item.indexOf(keyword) >= 0;
        });
    };


    /*
     * Entrypoint
     */

    var getUser = function() {
        self.request('/user').then(function(res) {
            self.user = res.data;
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
            self.request(path).then(function(res) {
                var index = res.data.length ? res.data.length - 1 : -1;
                if(index < 0) { done(); return; }

                var tag = res.data[index].ref.substring(10);
                // Compare commits between the last tag and HEAD
                path = '/repos/' + ORG + '/' + repo + '/compare/' + tag + '...HEAD';
                self.request(path).then(function(res) {
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
        self.request(path).then(function(res) {
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

                //self.repos = ['nyuki-appreminder'];
                //self.repos = ['wings-auth', 'nyuki', 'wings-devenv'];
                self.repos = repos;
                loadRepos();
            });
        }).catch(function(err) {
            console.error("Can't load Gitcat manifest at " + MANIFEST);
        });
    };

    getUser();
    getRepos();
}
