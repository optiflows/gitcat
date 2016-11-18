/*
 * Angular application
 */

var app = angular.module("gitcat", ["ngMaterial", "ngMdIcons"]);

app.config(["$httpProvider", function ($httpProvider) {
    // Disable cross origin OPTIONS requests
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.withCredentials = true;
}]);


/*
 * Models
 */



/*
 * Main controller
 */

app.controller("mainCtrl", function($scope, $http, $location) {
    var api = $location.protocol() + "://" + $location.host() + ":8055";

    // Private methods

    var test = function() {
        return "test";
    };

    // Public methods

    $scope.hello = function() {
        $scope.hello = "hello";
    };
});
