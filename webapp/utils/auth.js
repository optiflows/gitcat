function AuthSrv($cookies, $location) {
    this.login = function(token) {
        var expires = new Date();
        expires.setHours(expires.getHours() + 1);

        $cookies.put('gitcat', token, {
            'expires' : expires
        });
        $location.url('/dashboard');
    }

    this.logout = function() {
        $cookies.remove('gitcat');
        $location.url('/');
    }

    this.getToken = function() {
        var token = $cookies.get('gitcat');
        if(token == undefined) {
            $location.url('/');
        }
        return token;
    }

    this.autoLogin = function() {
        var token = $cookies.get('gitcat');
        if(token != undefined) {
            $location.url('/dashboard');
        }
    }
}