var app = angular.module("myApp", ["ngRoute","luegg.directives"]);
var conn = new WebSocket('ws://localhost:8081');
var base_url = "http://localhost:8200/api/"
app.config(function($routeProvider) {
  $routeProvider
  .when("/", {
    templateUrl : "views/chat.html",
    controller : "chatCtrl",
    authorize: true
  })
  .when("/login", {
    templateUrl : "views/auth/login.html",
    controller : "authCtrl",
    authorize: false
  })
  .when("/register", {
    templateUrl : "views/auth/register.html",
    controller : "authCtrl",
    authorize: false
  })
  .when("/blue", {
    templateUrl : "blue.htm"
  });
});


app.run(function($rootScope, $location){
    // logging helper
    function getPath(route) {
        if (!!route && typeof(route.originalPath) === "string")
            return "'" + route.originalPath + "'";
        return "[unknown route, using otherwise]";
    }

    $rootScope.$on("$routeChangeStart", function(evt, to, from){
        console.log("Route change start from", getPath(from), "to", getPath(to));
        if (to.authorize === true)
        {
            to.resolve = to.resolve || {};
            if (!to.resolve.authorizationResolver)
            {
                to.resolve.authorizationResolver = function(authService) {
                    console.log("Resolving authorization.");
                    return authService.authorize();
                };
            }
        }
    });

    $rootScope.$on("$routeChangeError", function(evt, to, from, error){
        console.log("Route change ERROR from", getPath(from), "to", getPath(to), error);
        if (error instanceof AuthorizationError)
        {
            console.log("Redirecting to login");
            $location.path("/login");
        }
    });

    // NOT needed in authorization / logging purposes only
    $rootScope.$on("$routeChangeSuccess", function(evt, to, from){
        console.log("Route change success from", getPath(from), "to", getPath(to));
    });
})



app.service("authService", function($q, $timeout,$http,$rootScope){
    var self = this;
    this.authenticated = false;
    this.authorize = function() {
        var info = this.getInfo()
        return info.then( data => {
          if(data){
            $rootScope.isUserLoggedIn = true
            return true;
          }
          throw new AuthorizationError();
        })
    };
    this.getInfo = function() {
        return $timeout(function(){
            return $http({
              method: 'POST',
              url: base_url+'auth.php?type=check',
              data : {"token" : localStorage.getItem('token')},
              headers: {
                "Content-Type": "application/json"
              },
            }).then(function successCallback(response) {
                var status = false;
                var resp = response.data;
                status = resp.status;
                return status;

            }, function errorCallback(response) {

                return false;
            });
        }, 100);
    };
});



app.service("userService", function($q, $timeout,$http,$rootScope){


    this.getUser = function() {
        return $timeout(function(){
            return $http({
              method: 'GET',
              url: base_url+'auth.php?type=getUserDetails',
              headers: {
                "Content-Type": "application/json",
                "Authorization" : localStorage.getItem('token')
              },
            }).then(function successCallback(response) {
                var status = false;
                var resp = response.data;

                return resp.data;

            }, function errorCallback(response) {

                return false;
            });
        }, 100);
    };
    this.getAllUsers = function() {
        return $timeout(function(){
            return $http({
              method: 'GET',
              url: base_url+'auth.php?type=getAllUsers',
              headers: {
                "Content-Type": "application/json",
                "Authorization" : localStorage.getItem('token')
              },
            }).then(function successCallback(response) {
                var status = false;
                var resp = response.data;
                return resp.data;
            }, function errorCallback(response) {
                return false;
            });
        }, 100);
    };
    this.getChats = function(id) {
        return $timeout(function(){
            return $http({
              method: 'POST',
              url: base_url+'auth.php?type=getChats',
              data : {"id" : id},
              headers: {
                "Content-Type": "application/json",
                "Authorization" : localStorage.getItem('token')
              },
            }).then(function successCallback(response) {
                var status = false;
                var resp = response.data;

                return resp.data;
            }, function errorCallback(response) {
                return false;
            });
        }, 100);
    };
});


// Custom error type
function AuthorizationError(description) {
    this.message = "Forbidden";
    this.description = description || "User authentication required.";
}
AuthorizationError.prototype = Object.create(Error.prototype);
AuthorizationError.prototype.constructor = AuthorizationError;
