var myTrip = angular.module('myTrip',['ngRoute','LocalStorageModule']);
//routing
myTrip.config(['$routeProvider',function($routeProvider){
  $routeProvider
    .when();

}]);
myTrip.config(function(localStorageServiceProvider){
  localStorageServiceProvider.setPrefix('myTrip');
});

//Controllers
myTrip.controller('LoginController', ['$http','$scope','$location','$window','localStorageService',function ($http,$scope,$location,$window,localStorageService) {


  $scope.checkUser = function () {
    if ($scope.isValid()) {
      var data={UserName:$scope.userName,Password:$scope.password};

      $http.post('http://localhost:5011/Users/Login', data)
        .then(function (response) {
          if(response.data=="login without token"){ //change according to server response
            document.getElementById('login').style.display='none';
            document.getElementById('Register').style.display='none';
            document.getElementById('Favorites').style.display='inline-block';

            $window.isLoggedIn=true;
            $window.m_currentUserName=$scope.userName;
            $location.path('/homeAfterLogin'); //name of the site after login
          }
          else if(response.data=='invalid username or password'){ //check the message for invalid username and pass
            window.alert('wrong credentials');
          }else{
            var d=Date().toString();
            localStorageService.cookie.set('currentUser',response.data); //I don't use cookies so maybe no need for local storage
            localStorageService.cookie.set('currentDate',d);
            document.getElementById('login').style.display='none';
            document.getElementById('Register').style.display='none';
            document.getElementById('Favorites').style.display='inline-block';

            $window.isLoggedIn=true;
            $window.m_currentUserName=$scope.userName;
            $location.path('/homeAfterLogin');
          }
        });
    }
  }
  $scope.unChange=function(){
    if($scope.userName=='a') return true;
    if($scope.userName.length===0){
      $scope.UnComment='';
    }else
    if($scope.userName.length<3|| $scope.userName.length>8 ){
      $scope.UnComment='user name between 3 to 8 letters and no spaces';
    }else{
      $scope.UnComment='';

    }
  }
  $scope.pdChange=function(){
    if($scope.password=='a') return true;

    if($scope.password.length===0){
      $scope.pdComment='';
    }else
    if($scope.password.length<5|| $scope.password.length>10 ){
      $scope.pdComment='password between 5 to 10 letters and no spaces';
    }else{
      $scope.pdComment='';

    }
  }
  $scope. isValid=function() {

    var a=/^[a-zA-Z]+$/.test($scope.userName);
    var b=/^\w+$/.test($scope.password);
    var i=0;
    if($scope.userName&&$scope.password){
      if(a&&b&&$scope.userName.length>0&&$scope.password.length>0){
        return true;
      }else{
        window.alert('one or more fields are wrong');
        return false;
      }
    }else{
      window.alert('one or more fields are wrong');
      return false;

    }
  }


}]);
