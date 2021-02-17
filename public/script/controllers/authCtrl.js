app.controller('authCtrl', ['$scope','$http','$location',function($scope,$http,$location) {

  $scope.login = {
    "email" : "harendraverma21@gmail.com",
    "password" : "123456789"
  }
  $scope.user = {
    "f_name" : "Harendra",
    "l_name" : "Kumar",
    "email" : "harendraverma21@gmail.com",
    "password" : "123456789",
    "c_password" : "123456789"
  }

  if(localStorage.getItem('token')){
    $http({
      method: 'POST',
      url: base_url+'auth.php?type=check',
      data : {"token" : localStorage.getItem('token')},
      headers: {
        "Content-Type": "application/json"
      },
    }).then(function successCallback(response) {
        var resp = response.data;
        if(resp.status){
          $location.path('/')
        }

    }, function errorCallback(response) {
    });
  }

  $scope.alert = {};
  $scope.authLogin = (data) => {
    $scope.alert = {};
    if(!data){
      $scope.alert = {"class" : "danger", "msg" : "Email and Password are required. Please provide valid email and password."};
    }else if(!data.email){
      $scope.alert = {"class" : "danger", "msg" : "Email is empty. Please provide valid email."};
    }else if(!$scope.validateEmail(data.email)){
      $scope.alert = {"class" : "danger", "msg" : "Email is not valid. Please provide valid email."};
    }else if(!data.password){
      $scope.alert = {"class" : "danger", "msg" : "Password is empty. Please provide valid password."};
    }else if(data.password.length < 6){
      $scope.alert = {"class" : "danger", "msg" : "Password must be 6 charecters long. Please provide valid password."};
    }else{
      $scope.alert = {"class" : "warning", "msg" : "Trying to login. Please wait...."};

      $http({
        method: 'POST',
        url: base_url+'auth.php?type=login',
        data : data,
        headers: {
          "Content-Type": "application/json"
        },
      }).then(function successCallback(response) {
          var resp = response.data;
          console.log(resp)
          if(resp.status){
            var token = resp.data.token;
            localStorage.setItem('token',token);
            $location.path("/");
          }else{
              $scope.alert = {"class" : "danger", "msg" : resp.message};
          }
      }, function errorCallback(response) {
          $scope.alert = {"class" : "danger", "msg" : "Something went wrong please try again."};
      });

    }
  }
  $scope.authRegister = (data) => {
    $scope.alert = {};
    if(!data){
      $scope.alert = {"class" : "danger", "msg" : "All fields are required. Please provide valid details."};
    }else if(!data.f_name){
      $scope.alert = {"class" : "danger", "msg" : "Lastname is empty. Please provide valid Firstname."};
    }else if(!data.l_name){
      $scope.alert = {"class" : "danger", "msg" : "Email is empty. Please provide valid Lastname."};
    }else if(!data.email){
      $scope.alert = {"class" : "danger", "msg" : "Email is empty. Please provide valid email."};
    }else if(!$scope.validateEmail(data.email)){
      $scope.alert = {"class" : "danger", "msg" : "Email is not valid. Please provide valid email."};
    }else if(!data.password){
      $scope.alert = {"class" : "danger", "msg" : "Password is empty. Please provide valid password."};
    }else if(data.password.length < 6){
      $scope.alert = {"class" : "danger", "msg" : "Password must be 6 charecters long. Please provide valid password."};
    }else if(data.password != data.c_password){
      $scope.alert = {"class" : "danger", "msg" : "Passwords not matching. Please provide same passwords."};
    }else{
      $scope.alert = {"class" : "warning", "msg" : "Trying to login. Please wait...."};

      $http({
        method: 'POST',
        url: base_url+'auth.php?type=register',
        data : data,
        headers: {
          "Content-Type": "application/json"
        },
      }).then(function successCallback(response) {
        var resp = response.data;
        console.log(resp)
        if(resp.status){
          var token = resp.data.token;
          localStorage.setItem('token',token);
          $location.path("/");
        }else{
            $scope.alert = {"class" : "danger", "msg" : resp.message};
        }
      }, function errorCallback(response) {
        $scope.alert = {"class" : "danger", "msg" : "Something went wrong please try again."};
      });

    }
  }
  $scope.validateEmail = (email) =>{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}]);
