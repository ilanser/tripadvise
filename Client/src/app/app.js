var myTrip = angular.module('myTrip',['ngRoute','checklist-model']);
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

var Favorites =[];
var m_currentUserName='Guest';
var isLoggedIn=false;
var Token='';

myTrip.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);


// myTrip.factory('myService',['$http',function($http){
//   var service={};
//   service.currentUser='';
//   service.isLoggedIn=false;
//   service.favorites='';
//   service.token='';
//   service.firstname='';
//   return service;
// }])



//Controllers
myTrip.controller('LoginController', ['$http','$scope','$location','$window',function ($http,$scope,$location,$window) {

  $scope.checkUser = function () {
    if ($scope.isValid()) {
      var data={username:$scope.userName,password:$scope.password};

      $http.post('http://localhost:5011/Users/Login', data)
        .then(function (response) {
          if(response.data=='invalid username or password'){ //check the message for invalid username and pass
            window.alert('wrong credentials');
          }else{
            document.getElementById('login').style.display='none';
            document.getElementById('Register').style.display='none';
            document.getElementById('Favorites').style.display='inline-block';

            $window.isLoggedIn=true;
            $window.m_currentUserName=$scope.userName;
            $window.token = response.token;
            $window.firstname= response.firstname;
            Token=response.data.token;
            this.Favorites=response.data.favorites.trim();
            $location.path('/Home');
          }
        })
        .catch(function(err){
          console.log("error while logging in: "+err);
        })
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
  $scope.poi=[];
  $scope.allPoi=[];
  $scope.recommendedPoi = [];
  $scope.local_favorites = Favorites;
  $scope.isLoggedIn=isLoggedIn;
  var data = {
    username:m_currentUserName
  }

  if(m_currentUserName.length>0 && m_currentUserName!='Guest'){
    $http.post("http://localhost:5011/Users/SuggestedPOI",data) //create function in server

      .then(function (response) {
        $scope.recommendedPoi=response.data;

      })
      .catch(function (err) {
        window.alert(err);
      })
    $http.get("http://localhost:5011/Users/Favorites",{headers: {"token":Token}})
      .then(function(results){
        $scope.local_favorites = $scope.allPoi.filter(poi => results.data.favorites.indexOf(poi.PoiID)>-1);
        Favorites=$scope.local_favorites;
      })
      .catch(function(err){
        console.log("error fetching favorites: "+err);
      })
  }
  else{
    $http.get("http://localhost:5011/POI/poidetails")
      .then(function (response) {
        $scope.poi=response.data;
        $scope.allPoi = $scope.poi;
        let random = Math.floor(Math.random()*($scope.allPoi.length)+1);
        $scope.recommendedPoi.push($scope.allPoi[random]);
        random = Math.floor(Math.random()*($scope.allPoi.length)+1);
        $scope.recommendedPoi.push($scope.allPoi[random]);
        random = Math.floor(Math.random()*($scope.allPoi.length)+1);
        $scope.recommendedPoi.push($scope.allPoi[random]);
        console.log($scope.recommendedPoi);
      })
      .catch(function (err) {
        window.alert(err);
      })



  }
  $http.get("http://localhost:5011/POI/poidetails")
    .then(function (response) {
      $scope.poi=response.data;
      $scope.allPoi = $scope.poi;
    })
    .catch(function (err) {
      window.alert(err);
    })

  $http.get("http://localhost:5011/POI/Categories")
    .then(function (response) {
      $scope.categories=response.data;
    })
    .catch(function (err) {
      window.alert(err);
    })
  $scope.selectedHandler = function () {

    $scope.filtered = [];
    $scope.poi = $scope.allPoi;
    for (var i = 0; i < $scope.poi.length; i++) {
      if ($scope.poi[i].Category === $scope.selected.CategoryName) {
        $scope.filtered.push($scope.poi[i])
      }
    }
    $scope.poi = $scope.poi;
  }
  $scope.addToFavoritesHandler =function (poi) {
    let index = Favorites.indexOf(poi);
    if(index>-1)
      Favorites.splice(index,1);
    else
      Favorites.push(poi);
    let newfav = "";
    for(let i=0;i<Favorites.length;i++)
      newfav = newfav+Favorites[i].PoiID+" ";
    newfav= '"'+newfav.trim()+'"';
    console.log(Favorites);
    console.log(newfav);
    $http.put("http://localhost:5011/Users/Favorites",{'favorites':newfav},{headers: {'token': Token }})
      .then(function(response){
        console.log("favorites update: "+response);
      })
      .catch(function(err){
        console.log("error updating favorites: "+err);
      });


  }


}]);

// Register controller fix the interests section
myTrip.controller('RegisterController', ['$http','$scope','$location',function ($http,$scope,$location) {

  $scope.checked = {};
  $scope.interestselected=[];
  $http.get('http://localhost:5011/POI/Categories')
    .then(function (response) {
      $scope.Categories = response.data;
      console.log($scope.Categories);

    });


  var request = new XMLHttpRequest();
  request.open('GET', 'countries.xml', false);
  request.send();
  var xml = request.responseXML;
  $scope.countries = xml.getElementsByTagName("Name");


  $scope.addUser = function () {
    if ($scope.isValid()) {
      console.log($scope.interestselected);
      var categories = [];
      var user = {
        username: $scope.userName,
        password: $scope.password,
        secretquestion: $scope.question,
        secretanswer: $scope.answer,
        firstname: $scope.firstName,
        lastname: $scope.lastName,
        email: $scope.email,
        country: $scope.countrySelected,
        city: $scope.city,
        interests: $scope.interestselected
      };


      $http.post('http://localhost:5011/Users/Register', user)
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
    if($scope.userName&&$scope.password&&$scope.firstName&&$scope.lastName&&$scope.city&&$scope.question&&$scope.answer&&$scope.countrySelected){
      if(a&&b&&$scope.userName.length>0&&$scope.password.length>0&&$scope.firstName.length>0&&$scope.lastName.length>0&&$scope.city.length>0
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
// Fix the add to favorites function
myTrip.controller('POIController',['$window','$scope','$http',function($window,$scope,$http){
  // top 5 POI:
  $scope.poi=[];
  $scope.allPoi=[];
  $scope.recommendedPoi = [];
  $scope.isLoggedIn=isLoggedIn;
  var data = {
    username:m_currentUserName
  }
  if(m_currentUserName!='Guest'){
    $http.post("http://localhost:5011/Users/SuggestedPOI",data) //create function in server

      .then(function (response) {
        $scope.recommendedPoi=response.data;

      })
      .catch(function (err) {
        window.alert(err);
      })

  }
  $http.get("http://localhost:5011/POI/poidetails")
    .then(function (response) {
      $scope.poi=response.data;
      $scope.allPoi = $scope.poi;

    })
    .catch(function (err) {
      window.alert(err);
    })

  $http.get("http://localhost:5011/POI/Categories")
    .then(function (response) {
      $scope.categories=response.data;
    })
    .catch(function (err) {
      window.alert(err);
    })
  $scope.selectedHandler = function () {

    $scope.filtered=[];
    $scope.poi=$scope.allPoi;
    for(var i = 0; i < $scope.poi.length ; i++){
      if($scope.poi[i].Category === $scope.selected.CategoryName){
        $scope.filtered.push($scope.poi[i])
      }
    }
    $scope.poi = $scope.poi;
  }

  $scope.Favorites=Favorites;
  $scope.addToFavoritesHandler =function (poi) {
    let index = Favorites.indexOf(poi);
    if(index>-1)
      Favorites.splice(index,1);
    else
      Favorites.push(poi);
    let newfav = "";
    for(let i=0;i<Favorites.length;i++)
      newfav = newfav+Favorites[i].PoiID+" ";
    newfav= '"'+newfav.trim()+'"';
    console.log(Favorites);
    console.log(newfav);
    $http.put("http://localhost:5011/Users/Favorites",{'favorites':newfav},{headers: {'token': Token }})
      .then(function(response){
        console.log("favorites update: "+response);
      })
      .catch(function(err){
        console.log("error updating favorites: "+err);
      });


  }



}]);
//Fix the remove from favorites function
myTrip.controller('FavoritesController',['$scope','$http',function($scope,$http){
  $scope.allPoi={};
  $scope.Favorites=Favorites;
  $http.get('http://localhost:5011/POI/poidetails')
    .then(function(response){
      $scope.allPoi=response.data;
    })
    .catch(function(err){
      console.log("Error while fetching all poi data: "+err);
    })

  $scope.addToFavoritesHandler =function (poi) {
    let index = Favorites.indexOf(poi);
    if(index>-1)
      Favorites.splice(index,1);
    let newfav = "";
    for(let i=0;i<Favorites.length;i++)
      newfav = newfav+Favorites[i].PoiID+" ";
    newfav= '"'+newfav.trim()+'"';
    console.log(Favorites);
    console.log(newfav);
    $http.put("http://localhost:5011/Users/Favorites",{'favorites':newfav},{headers: {'token': Token }})
      .then(function(response){
        console.log("favorites update: "+response);
      })
      .catch(function(err){
        console.log("error updating favorites: "+err);
      });


  }
}]);

myTrip.controller('PassController',['$scope','$http',function($scope,$http){

  $scope.isShow=false;
  $scope.retrievePass=function() {
    var data={username:$scope.userName,secretquestion:$scope.question,secretanswer:$scope.answer};
    $http.post('http://localhost:5011/Users/RetrievePassword', data)
      .then(function (response) {
        console.log(response.data);
        console.log(response.data.password);
        if(response.data.password!="wrong question/answer"){
          $scope.Pass=response.data.password;
          $scope.isShow=true;

        }else{
          window.alert('wrong credentials')
        }

      });
  }

}]);
