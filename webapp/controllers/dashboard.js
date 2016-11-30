function DashboardCtrl($cookies, $http) {

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


    /*
     * Controller methods
     */

    self.request = function(path) {
        return $http({
            method: 'GET',
            url: API + path,
            headers: {'Authorization': 'token ' + TOKEN}
        });
    };


    /*
     * Entrypoint
     */

    var getUser = function() {
        self.request('/user').then(function(res) {
            self.user = res.data;
            console.log(self.user);
        }).catch(function(err) {
            console.error(err);
        });
    };

    var loadRepos = function(manifest) {
        manifest = jsyaml.load(manifest);
        var repos = [];

        for(var alias in manifest) {
            var names = manifest[alias]['repositories'];
            repos = _.union(repos, names);
        }

        self.repos = repos;
    };

    var getRepos = function() {
        var path = '/repos/' + MANIFEST + '/contents/gitprojects.yml';

        self.request(path).then(function(res) {
            var url = res.data['download_url'];
            $http.get(url).then(function(res) { loadRepos(res.data); });
        }).catch(function(err) {
            console.error(err);
        });
    };

    getUser();
    getRepos();
}
