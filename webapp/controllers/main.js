function mainCtrl($http, $location, $window) {
    var api = $location.protocol() + '://' + $location.host() + ':17098';

    this.signin = function() {
        $http.post(api + '/v1/auth').then(function(res) {
            $window.location.href = res.data.url;
        }).catch(function(err) {
            console.error(err);
        });
    };
}
