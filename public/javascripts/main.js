var geocoder;
var map;
//var autocomplete;
var App = angular.module('tracklabs',[]);

App.controller('placesController', function($scope, $http, $document) {
	$document.ready(function() {
		geocoder = new google.maps.Geocoder();
		var address = document.getElementById("address");
		var mapOptions = {
    		center: { lat: -34.397, lng: 150.644},
        	zoom: 15
    	};
    	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
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
			$scope.$apply(function(){
				$scope.place = {
					name: place.name,
					address: place.formatted_address,
				};
				map.setCenter(place.geometry.location);
				var marker = new google.maps.Marker({ 
					map: map, 
					position: place.geometry.location 
				});
				$scope.place_loaded = true;
			});

		});
	});
	$scope.places = [{
		name: "Cream Center",
		url: "#testurl",
		address: "Premium Veg. Restaurant",
	}, {
		name: "Dominos Pizza",
		url: "#testurl",
		address: "Best Pizza",
	}];

	$scope.place_loaded = false;
	/*
	$scope.trackLocation = function(address) {
		if (address !== undefined && address !== null)
		{
			if (address != $("#address").val())
				address = $("#address").val();
			alert("Address: " + address);
			geocoder.geocode( {'address' : address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					map.setCenter(results[0].geometry.location);
					var marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location,
					});
					$scope.$apply(function(){
						$scope.place_loaded = true;
					});
				} else {
					alert("Could not geocode this location!");
				}
			});
		}
	};
	*/
	$scope.checkPlaces = function() {
		for (var i = 0 ; i < $scope.places.length ; i++)
		{
			if ($scope.places[i].checked == true)
			{
				$("#delete-button").prop("disabled",false);
				$("#share-button").prop("disabled", false);
				return;
			}
		}
		$("#delete-button").prop("disabled", true);
		$("#share-button").prop("disabled", true);
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