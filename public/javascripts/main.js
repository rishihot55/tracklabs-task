

//var autocomplete;
var App = angular.module('tracklabs',[]);

App.controller('placesController', function($scope, $http, $document) {
	$document.ready(function() {
		var map;
		var infowindow;
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
    	var marker = new google.maps.Marker({ 
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
			$scope.$apply(function(){
				$scope.place = {
					name: place.name,
					address: place.formatted_address,
				};
			});
			var contentString = '<div id="content">'+
				'<h4 class="text-center">Place Info</h4>'+
				'<p>Name: '+ place.name + '</p>'+
				'<p>Address: ' + place.formatted_address + '</p>'+
				'<div class="text-center">'+
				'<button type="button">Add to My Places</button>'+
				'<button type="button">Share</button>'+
				'</div>'+
				'</div>';
			map.setCenter(place.geometry.location);
			marker.setPosition(place.geometry.location);
			infowindow.setContent(contentString);
			google.maps.event.addListener(marker, 'click', function() {
    			infowindow.open(map,marker);
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