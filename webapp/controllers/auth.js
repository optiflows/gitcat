function authCtrl($routeParams, $location, $cookies, $http) {
    var api = $location.protocol() + '://' + $location.host() + ':17098';
    var cookies = $cookies.get('gitcat');

    console.log($routeParams.code);
    console.log($routeParams.state);
    console.log($routeParams);

    // var token = null;
    // if(!cookies) {
    //     var code = $routeParams.code;
    //     var state = $routeParams.state;
    //     var path = '/v1/auth?code=' + code + '&state=' + state;
    //
    //     $http.get(api + path).then(function(res) {
    //         token = res.data.token;
    //         $cookies.put('gitcat', {'token': token});
    //     }).catch(function(err) {
    //         console.error(err);
    //     });
    // } else {
    //     token = cookies.token;
    // }
    // this.token = token;
}