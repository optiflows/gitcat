var app = angular.module('gitcat', ['ngRoute', 'ngCookies', 'ngMaterial', 'ngMdIcons']);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        controller: 'MainCtrl',
        controllerAs: 'self',
        templateUrl: 'templates/main.html'
    })
    .when('/dashboard', {
        controller: 'DashboardCtrl',
        controllerAs: 'self',
        templateUrl: 'templates/dashboard.html'
    })
    .when('/settings', {
        controller: 'SettingsCtrl',
        controllerAs: 'self',
        templateUrl: 'templates/settings.html'
    });
}]);

app.config(['$mdAriaProvider', function($mdAriaProvider) {
    $mdAriaProvider.disableWarnings();
}]);

app.service('AuthSrv', AuthSrv);
app.controller('MainCtrl', MainCtrl);
app.controller('DashboardCtrl', DashboardCtrl);
app.controller('SettingsCtrl', SettingsCtrl);


var $http = angular.injector(['ng']).get('$http');
$http.get(location.origin + '/api/app').then(function(res) {
    app.constant('APPID', res.data.gitcat_id);

    // Bootstrap Angular application
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['gitcat']);
    });
}).catch(function(err) {
    console.error("Gitcat ID is missing!");
});
