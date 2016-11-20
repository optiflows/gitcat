var app = angular.module('gitcat', ['ngRoute', 'ngCookies', 'ngMaterial', 'ngMdIcons']);

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

