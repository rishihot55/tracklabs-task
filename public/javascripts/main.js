

//var autocomplete;
var App = angular.module('tracklabs',[]);

App.controller('placesController', function($scope, $http, $document, $window, $compile) {
	var map;
	var infowindow;
	var marker;

	$scope.initMap = function() {

		var address = document.getElementById("address");
		var mapOptions = {
    		center: { lat: -34.397, lng: 150.644},
        	zoom: 15
    	};

    	var contentString = "<div id='content'>"+
    		"<h4>Place Info</h4>"+
    		"<p>Please search for a place!</p>"+
    		"</div>";

    	infowindow = new google.maps.InfoWindow({
				content: contentString
		});
    	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    	marker = new google.maps.Marker({ 
			map: map, 
			position: mapOptions.center,
			animation: google.maps.Animation.DROP,
		});

		autocomplete = new google.maps.places.Autocomplete(address);
    	autocomplete.bindTo('bounds', map);
    	google.maps.event.addListener(autocomplete, 'place_changed', function() {
			place = autocomplete.getPlace();
			if (place.length == 0) {
				alert("Place not found!");
			}

			console.log(place);

			var new_address = place.name + ", " + place.address_components[0].long_name + ", " + place.address_components[1].long_name + ", " + place.address_components[2].long_name;
			$scope.address = new_address;
			$scope.$apply(function() {
				$scope.place = {
					name: place.name,
					address: place.formatted_address,
					lat: place.geometry.location.lat(),
					long: place.geometry.location.lng(),
					place_id: place.place_id,
				};
			});

			var info = "<div id='infowindow-content'>"+
			"<h4 class='text-center'>Place Info</h4>"+
			"<p>Name: " + place.name + "</p>"+
			"<p>Address: " + place.formatted_address + "</p>"+ 
			"<p>Lat: " + place.geometry.location.lat() + "</p>"+
			"<p>Long: " + place.geometry.location.lng() + "</p>"+
			"<div class='text-center'>"+
			"<button type='button' id='add-place' ng-click='addPlace()'>Add to My Places</button>"+
			"<button type='button'>Share</button>"+
			"</div>"+
			"</div>";

			//The html needs to be compiled for angular directives to work
			var compiled = $compile(info)($scope);
			map.setCenter(place.geometry.location);
			marker.setPosition(place.geometry.location);
			infowindow.setContent(compiled[0]);
			google.maps.event.addListener(marker, 'click', function() {
    			infowindow.open(map,marker);
  			});
		});
	};

	$scope.addPlace = function() {
		var place = {
			name: $scope.place.name,
			address: $scope.place.address,
			lat: $scope.place.lat,
			long: $scope.place.long,
			place_id: $scope.place.place_id,
		};

		$http({
			url : "/place/add",
			data: {
				place,
			},
			method: "POST"
		})
		.success(function(){ 
			$("#add-place").text("Place added!");
			$("#add-place").prop("disabled", true);
		})
		.error(function(res, status) {
			if(res.place_exists == true)
			{
				$("#add-place").text("Place exists!");
				$("#add-place").prop("disabled", true);
			}
			else
			{
				alert("Place couldn't be added. Please try again!");
			}
		});
	};

	$scope.findPlace = function(place_id) {
		$scope.initMap();
		var service = new google.maps.places.PlacesService(map);
		var request = { placeId: place_id };
		service.getDetails(request, function(place, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var info = "<div id='infowindow-content'>"+
				"<h4 class='text-center'>Place Info</h4>"+
				"<p>Name: " + place.name + "</p>"+
				"<p>Address: " + place.formatted_address + "</p>"+ 
				"<p>Lat: " + place.geometry.location.lat() + "</p>"+
				"<p>Long: " + place.geometry.location.lng() + "</p>"+
				"<div class='text-center'>"+
				"<button type='button' id='add-place' ng-click='addPlace()'>Add to My Places</button>"+
				"<button type='button'>Share</button>"+
				"</div>"+
				"</div>";
			
				//The html needs to be compiled for angular directives to work
				var compiled = $compile(info)($scope);
				map.setCenter(place.geometry.location);
				marker.setPosition(place.geometry.location);
				infowindow.setContent(compiled[0]);
				google.maps.event.addListener(marker, 'click', function() {
    				infowindow.open(map,marker);
  				});
  			}
		});
	};

	$scope.getPlaces = function() {
		$http.get("/place")
		.success(function(res) {
			$scope.places = res.places;
		});
	}
	

	$scope.checkPlaces = function() {
		for (var i = 0 ; i < $scope.places.length ; i++) {
			if ($scope.places[i].checked == true) {
				$("#delete-button").prop("disabled",false);
				$("#share-button").prop("disabled", false);
				return;
			}
		}
		$("#delete-button").prop("disabled", true);
		$("#share-button").prop("disabled", true);
	};

	$scope.deletePlaces = function() {
		var placeList = "";
		var count = 1;
		for (var i = 0 ; i < $scope.places.length ; i++)
		{
			if ($scope.places[i].checked == true)
			{
				placeList += count + ". " + $scope.places[i].name + "\n";
				count++;
			}
		}

		if(confirm("Are you sure you want to delete the following places?\n" + placeList))
		{
			for (var i = 0 ; i < $scope.places.length ; i++)
			{
				if ($scope.places[i].checked == true)
				{
					$scope.places.splice(i,1);
					i--;
					continue;
				}
			}
		}
	};

	$scope.sharePlaces = function() {
		var urlString = "I want to share the following places with you:%0A";
		var count = 1;
		for (var i = 0 ; i < $scope.places.length ; i++)
		{
			if ($scope.places[i].checked == true)
			{
				urlString += count + ". " + $scope.places[i].name + " - " + $scope.places[i].url + "%0A";
			}
		}

		var gmailURL = "https://mail.google.com/mail/u/0/?view=cm&fs=1&su=" + "Tracklabs location shared" + "&body="+ urlString +"&tf=1";
		var encodedURL = encodeURI(gmailURL);
		$window.open(gmailURL);
	};
});

App.directive('ngEnter', function() {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				scope.$apply(function() {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	}
});