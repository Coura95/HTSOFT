angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(43.07493, -89.381388),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("mapf"), mapOptions);

        $scope.onCreate({map: map});

        // Stop the side bar from dragging when mousedown/tapdown on the map
        /*google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });*/
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
}).directive('uiShowPassword', [
  function () {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {
      var btnShowPass = angular.element('<i style="margin-right: 20%" class="ion-eye" style="color:red"></i>'),
        elemType = elem.attr('type');

      // this hack is needed because Ionic prevents browser click event 
      // from elements inside label with input
      btnShowPass.on('onclick', function (evt) {
        (elem.attr('type') === elemType) ?
          elem.attr('type', 'text') : elem.attr('type', elemType);
        btnShowPass.toggleClass('button-positive');
        //prevent input field focus
        evt.stopPropagation();
      });

      btnShowPass.on('touchend', function (evt) {
        var syntheticClick = new Event('onclick');
        evt.currentTarget.dispatchEvent(syntheticClick);

        //stop to block ionic default event
        evt.stopPropagation();
      });

      if (elem.attr('type') === 'password') {
        elem.after(btnShowPass);
      }
    }
  };
}])

