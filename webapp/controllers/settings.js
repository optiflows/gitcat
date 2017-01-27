function SettingsCtrl($cookies, $http, $window, $location, APPID) {

    /*
     * Controller attributes
     */

    const API = 'https://api.github.com';
    const TOKEN = $cookies.get('gitcat');

    var self = this;
    self.user = {};
    self.config = {whitelist: []};
    self.gist = null;
    self.repos = [];
    self.orgs = [];
    self.filter = null;
    self.loading = false;


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

    self.hrefRepo = function(e, repo) {
        e.stopPropagation();
        self.href('https://github.com/' + repo.full_name, true);
    };

    self.request = function(method, path, data) {
        return $http({
            method: method,
            url: API + path,
            headers: {
                'Authorization': 'token ' + TOKEN,
                'If-Modified-Since' : new Date()
            },
            data: data
        });
    };

    self.query = function(keyword) {
        return _.filter(self.repos, function(item) {
            return item.full_name.indexOf(keyword) >= 0;
        });
    };

    self.filterRepos = function(repo) {
        if(self.search && repo.full_name.indexOf(self.search) < 0) { return false; }
        return self.filter ? repo.owner.login == self.filter : true;
    };

    self.toggle = function(repo) {
        self.gist.local = true;
        var index = self.config.whitelist.indexOf(repo.full_name);
        if(index >= 0) {
            self.config.whitelist.splice(index, 1);
        } else {
            self.config.whitelist.push(repo.full_name);
        }
    };

    self.save = function() {
        if(!self.gist || !self.gist.local) { return; }
        var name = 'gitcat-' + APPID.substring(0, 8) + '.json';
        var content = {};
        content[name] = {content: JSON.stringify(self.config)};
        self.request('PATCH', '/gists/' + self.gist.id, {files: content});
        self.gist.local = false;
    };


    /*
     * Events
     */

    $window.onbeforeunload = function(event) {
        self.save();
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
                }).then(function(res) {
                    self.gist = res.data;
                    self.gist.local = false;
                });
            } else {
                // Get config from user's Gists
                self.gist = gist;
                self.gist.local = false;
                $http.get(gist.files[name].raw_url).then(function(res) {
                    self.config = res.data;
                });
            }
        });
    };

    var getRepos = function(page) {
        self.loading = true;
        page = (page || 1);
        self.request('GET', '/user/repos?page=' + page).then(function(res) {
            self.repos = self.repos.concat(res.data);
            var next_link = parse_link_header(res.headers().link).next;
            if(next_link) {
                var next_page = next_link.split('?page=')[1];
                getRepos(next_page);
            } else {
                self.loading = false;
            }
        });
    };

    var getOrgs = function() {
        self.request('GET', '/user/orgs').then(function(res) {
            self.orgs = res.data;
        });
    };

    var getUser = function() {
        if(!TOKEN) { self.signout(); }
        self.request('GET', '/user').then(function(res) {
            self.user = res.data;
            self.filter = self.user.login;
            getConfig();
            getRepos();
            getOrgs();
        });
    };

    getUser();
}
