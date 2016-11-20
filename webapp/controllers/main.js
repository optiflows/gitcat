function mainCtrl($http, $window) {

    this.signin = function() {
        $http.get(location.origin + '/auth').then(function(res) {
            $window.location.href = res.data.url;
        }).catch(function(err) {
            console.error(err);
        });
    };
}
