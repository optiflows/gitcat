function mainCtrl($http, $window, $routeParams) {

    /*
     * Controller attributes
     */

    this.requesting = false;
    this.api = location.origin + '/api/auth';

    /*
     * Controller methods
     */

    this.signin = function() {
        $http.post(this.api).then(function(res) {
            $window.location.href = res.data.url;
        }).catch(function(err) {
            console.error(err);
        });
    };

    this.authenticate = function(state, code) {
        var data = {state: state, code: code};
        $http.patch(this.api, data).then(function(res) {
            console.log(res.data.token);
        }).catch(function(err) {
            console.error(err);
        });
    };

    /*
     * Entrypoint
     */

    var code = $routeParams.code;
    var state = $routeParams.state;
    if(code && state) {
        this.requesting = true;
        this.authenticate(state, code);
    }

}
