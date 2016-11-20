var app = angular.module('gitcat', ['ngRoute', 'ngCookies', 'ngMaterial', 'ngMdIcons']);

app.config(['$httpProvider', function ($httpProvider) {
    // Disable cross origin OPTIONS requests
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.withCredentials = true;
}]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/', {
        controller: 'mainCtrl',
        controllerAs: 'mainCtrl',
        templateUrl: 'templates/main.html'
    })
    .when('/dashboard', {
        controller: 'dashboardCtrl',
        controllerAs: 'dashboardCtrl',
        templateUrl: 'templates/dashboard.html'
    });
}]);

app.controller('mainCtrl', mainCtrl);
app.controller('dashboardCtrl', dashboardCtrl);

