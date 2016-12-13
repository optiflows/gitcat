function SettingsCtrl($cookies, $http, $window, $location, APPID) {

    /*
     * Controller attributes
     */

    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');

    var self = this;
    self.user = {};
    self.config = {whitelist: []};
    self.repos = [];
    self.orgs = [];


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


    function parse_link_header(header) {
        if (header.length === 0) {
            throw new Error("input must not be of zero length");
        }

        // Split parts by comma
        var parts = header.split(',');
        var links = {};
        // Parse each part into a named link
        for (var i = 0; i < parts.length; i++) {
            var section = parts[i].split(';');
            if (section.length !== 2) {
                throw new Error("section could not be split on ';'");
            }
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = url;
        }
        return links;
    }


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

    var getRepos = function(page) {
        page = (page || 1);
        self.request('GET', '/user/repos?page=' + page).then(function(res) {
            self.repos = self.repos.concat(res.data);
            var next_link = parse_link_header(res.headers().link).next;
            if(next_link) {
                var next_page = next_link.split('?page=')[1];
                getRepos(next_page);
            } else {
                // var uniq = _.uniqWith(self.repos, function(obj1, obj2) {
                //     return obj1.owner.login == obj2.owner.login;
                // });
                // self.orgs = _.map(uniq, 'owner.login');
            }
        });
    };

    var getOrgs = function() {
        self.request('GET', '/user/orgs').then(function(res) {
            self.orgs = res.data;
            console.log(self.orgs);
        });
    };

    var getUser = function() {
        if(!TOKEN) { self.signout(); }
        self.request('GET', '/user').then(function(res) {
            self.user = res.data;
            //getConfig();
            //getRepos();
            getOrgs();
        });
    };

    getUser();
}
