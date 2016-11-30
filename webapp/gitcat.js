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
    });
}]);

app.controller('MainCtrl', MainCtrl);
app.controller('DashboardCtrl', DashboardCtrl);

