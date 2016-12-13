function SettingsCtrl($cookies, $http, $window, $location, APPID) {

    /*
     * Controller attributes
     */

    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');

    var self = this;
    self.user = {};
    self.config = {whitelist: []};


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

    self.request = function(method, path, data) {
        return $http({
            method: method,
            url: API + path,
            headers: {'Authorization': 'token ' + TOKEN},
            data: data
        });
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

    getUser();
}
