var myTrip = angular.module('myTrip',['ngRoute']);
//routing
myTrip.config(['$routeProvider',function($routeProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'views/Home.html',
      controller:'WelcomeController'
    })
    .when('/login',{
      templateUrl: 'views/login.html',
      controller:'LoginController'
    })
    .when('/Favorites',{
      templateUrl: 'views/Favorites.html',
      controller: 'FavoritesController'
    })
    .when('/homeAfterLogin',{
      templateUrl: 'views/homeAfterLogin.html',
      controller: 'WelcomeController'
    })
    .when('/Register',{
      templateUrl: 'views/Register.html',
      controller: 'RegisterController'
    })
    .when('/POI',{
      templateUrl: 'views/POI.html',
      controller: 'POIController'
    })
    .when('/About',{
      templateUrl: 'views/about.html',
      controller: ''
    })
    .when('/passwordRetrieve',{
      templateUrl: 'views/passwordRetrieve.html',
      controller: 'PassController'
    })
    .otherwise({
      redirectTo: '/'
    });
}]);

var Favorites ={};
var m_currentUserName='Guest';
var isLoggedIn=false;

myTrip.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);


myTrip.factory('myService',['$http',function($http){
  var service={};
  service.currentUser='';
  service.isLoggedIn=false;
  service.favorites='';
  service.token='';
  service.firstname='';
  return service;
}])



//Controllers
myTrip.controller('LoginController', ['$http','$scope','$location','$window',function ($http,$scope,$location,$window) {

  $scope.checkUser = function () {
    if ($scope.isValid()) {
      var data={username:$scope.userName,password:$scope.password};

      $http.post('http://localhost:5011/Users/Login', data)
        .then(function (response) {
          if(response.data=="login without token"){ //change according to server response
            document.getElementById('login').style.display='none';
            document.getElementById('Register').style.display='none';
            document.getElementById('Favorites').style.display='inline-block';

            $window.isLoggedIn=true;
            $window.m_currentUserName=$scope.userName;
            $window.token = response.token;
            $window.firstname= response.firstname;
            $location.path('/homeAfterLogin'); //name of the site after login
          }
          else if(response.data=='invalid username or password'){ //check the message for invalid username and pass
            window.alert('wrong credentials');
          }else{
            var d=Date().toString();
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
myTrip.controller('WelcomeController', ['$http','$scope','$window',function ($http,$scope,$window) {
//Implement token check
  $scope.favorites=[];
  $scope.m_currentUserName = $window.m_currentUserName;
  $scope.token=$window.token;


//handle cookies
//   $http.post('http://localhost:5011/Users/SendCookie', data)
//     .then(function (response) {
//       if(response.data!='wrong cookie'){
//         document.getElementById('login').style.display='none';
//         document.getElementById('Register').style.display='none';
//         document.getElementById('cartC').style.display='block';
//         $window.isLoggedIn=true;
//         $window.m_currentUserName=response.data[0].UserName;
//         $scope.isLoggedIn=$window.isLoggedIn;
//         $scope.m_currentUserName=$window.m_currentUserName;
//         $scope.m_currentDate=localStorageService.cookie.get('currentDate');
//
//         $http.get("http://localhost:5011/Users/Top5TrendMovies")
//           .then(function (response) {
//             $scope.movies=response.data;
//
//
//           })
//           .catch(function (err) {
//             window.alert(err);
//           })
//         $scope.addToCartHandler =function (movie) {
//           cart[movie.Name] = movie;
//           window.alert("The movie " + movie.Name + " was added to cart");
//         }
//
//         //movies from last month:
//         $scope.lastMonthMovies =[];
//         $http.get("http://localhost:5011/Users/TopNewestMovies")
//           .then(function (response) {
//             $scope.lastMonthMovies=response.data;
//
//
//           })
//           .catch(function (err) {
//             window.alert(err);
//           })
//       }else{
//         $scope.m_currentUserName=$window.m_currentUserName;
//         $http.get("http://localhost:5011/Users/Top5TrendMovies")
//           .then(function (response) {
//             $scope.movies=response.data;
//
//
//           })
//           .catch(function (err) {
//             window.alert(err);
//           })
//         $scope.addToCartHandler =function (movie) {
//           cart[movie.Name] = movie;
//           window.alert("The movie " + movie.Name + " was added to cart");
//         }
//       }
//    });



}]);


myTrip.controller('RegisterController', ['$http','$scope','$location','localStorageService',function ($http,$scope,$location,localStorageService) {

  $scope.checked = {};

  $http.get('http://localhost:5011/Users/Intrests') // Implement interests get function in API
    .then(function (response) {
      $scope.categories = response.data;


    });


  var request = new XMLHttpRequest();
  request.open('GET', 'countries.xml', false);
  request.send();
  var xml = request.responseXML;
  $scope.countries = xml.getElementsByTagName("Name");


  $scope.addUser = function () {
    if ($scope.isValid()) {
      var categories = [];
      var data = {
        username: $scope.userName,
        Password: $scope.password,
        Question: $scope.question,
        Answer: $scope.answer,
        firstname: $scope.firstName,
        lastname: $scope.lastName,
        address: $scope.adress,
        Country: $scope.countrySelected,
        city: $scope.city

      };

      for (var key in $scope.checked) {
        if ($scope.checked[key] == true) {
          categories.push(key);
        }
      }
      data['Categories']=categories;

      $http.post('http://localhost:5011/Users/Register', data)
        .then(function (response) {
          if(response.status===403){

            window.alert('userName is already taken , please pick another name')
          }else{
            $location.path('/login');
          }
        })



    }
  }
  $scope.unChange=function(){
    if($scope.userName.length===0){
      $scope.UnComment='';
    }else
    if($scope.userName.length<3|| $scope.userName.length>8 ){
      $scope.UnComment='user name between 3 to 8 letters';
    }else{
      $scope.UnComment='';

    }
  }
  $scope.pdChange=function(){
    if($scope.password.length===0){
      $scope.pdComment='';
    }else
    if($scope.password.length<5|| $scope.password.length>10 ){
      $scope.pdComment='password between 5 to 10 letters';
    }else{
      $scope.pdComment='';

    }
  }
  $scope. isValid=function() {

    var a=/^[a-zA-Z]+$/.test($scope.userName);
    var abool=true;
    if( $scope.UnComment.length>0){
      abool=false;
    }
    a=a&&abool;
    var b=/^\w+$/.test($scope.password);
    var bbool=true;
    if($scope.pdComment.length>0){
      bbool=false;
    }
    b=b&&bbool;

    var i=0;
    if($scope.userName&&$scope.password&&$scope.firstName&&$scope.lastName&&$scope.adress&&$scope.city&&$scope.question&&$scope.answer&&$scope.countrySelected){
      if(a&&b&&$scope.userName.length>0&&$scope.password.length>0&&$scope.firstName.length>0&&$scope.lastName.length>0&&$scope.adress.length>0&&$scope.city.length>0
        &&$scope.question.length>0&&$scope.answer.length>0&&$scope.countrySelected.length>0){
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
  $scope.listChange=function(category){
    var status;
    if(!(category.CategoryName in $scope.checked))
      $scope.checked[category.CategoryName]=true;
    else {
      $scope.checked[category.CategoryName]=!$scope.checked[category.CategoryName];
    }

  }


}]);
