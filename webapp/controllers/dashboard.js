function dashboardCtrl($cookies, $http) {

    /*
     * Controller attributes
     */

    const ORG = 'optiflows';
    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');
    const MANIFEST = 'optiflows/devenv';

    var self = this;
    this.repos = [];


    /*
     * Controller methods
     */

    this.request = function(path) {
        return $http({
            method: 'GET',
            url: API + path,
            headers: {'Authorization': 'token ' + TOKEN}
        });
    };


    /*
     * Entrypoint
     */

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

    getRepos();
}
