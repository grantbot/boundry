angular
  .module('boundry.analytics', ['nvd3'])
  .controller('AnalyticsCtrl', AnalyticsCtrl);

  AnalyticsCtrl.$inject = ['$scope', '$http', 'AnalyticsFactory', 'HeatMapFactory'];
  // AnalyticsCtrl.$inject = ['$scope', '$http', 'AnalyticsFactory', 'HeatMapFactory', 'EventDashboardFactory'];

  function AnalyticsCtrl ($scope, $http, AnalyticsFactory, HeatMapFactory) {

    $scope.views = AnalyticsFactory.views;
    $scope.events = [{name: 'event1'}, {name: 'event2'}];
    $scope.regions = AnalyticsFactory.regions;

    $scope.changeView = function() {
      if($scope.dataViewSelection.name === 'Heat Map') {
        $scope.renderHeatmapSlider();
        HeatMapFactory.initializeOnce();
      } else if ($scope.dataViewSelection.name === 'Line Chart') {
        AnalyticsFactory.prepareLineChartData();
        $scope.renderLineChartSlider();
        AnalyticsFactory.renderLineChart([$('#slider-range').slider('values', 0), $('#slider-range').slider('values', 1)]);
      } else if ($scope.dataViewSelection.name === 'Bar Chart') {
        console.log('hi');
        AnalyticsFactory.prepareBarChartData();
        $scope.renderBarChartSlider();
        AnalyticsFactory.renderBarChart($('#bar-slider-range').slider('value'));
      }
    };

    $scope.renderHeatmapSlider = function() {
      var bucketSize = 1; //turn hours to minutes
      var startTime = 0;
      var endTime = 24 * 60; //turn hours to minutes
      var step = 1; //minutes

      $('#slider').slider({
        min: startTime + bucketSize/2,
        max: endTime - bucketSize/2,
        step: step,
        animate: 'fast'
      });

      $('#slider').slider({
        slide: function (event, ui) {

          $('#heatmapSlider').val( 
            changeToModTwelve( Math.floor(( ui.value - bucketSize/2 )/60) ) + //hour
            ':' +
            pad( ( ui.value - bucketSize/2 ) % 60 ) + //minutes
            determineAmOrPm( Math.floor(( ui.value - bucketSize/2 )/60) )
          );

          $scope.$apply(function () {
            //rerender heat map with each value
            HeatMapFactory.renderHeatmap(ui.value);
          });

        }     
      });

      $('#heatmapSlider').val( 
        changeToModTwelve( Math.floor(( $('#slider').slider('value') - bucketSize/2 )/60) ) + //hour
        ':' +
        pad( ( $('#slider').slider('value') - bucketSize/2 ) % 60 ) + //minutes
        determineAmOrPm( Math.floor(( $('#slider').slider('value') - bucketSize/2 )/60) )
      );

      function pad(n) {
          return (n < 10) ? ('0' + n) : n;
      }

      function changeToModTwelve(number) {
        if (number === 0 || number === 12 || number === 24) {
          return 12;
        } else {
          return number % 12;
        }
      }

      function determineAmOrPm(number) {
        if ( (0 <= number && number < 12) || number === 24) {
          return 'AM';
        } else if (12 <= number && number < 24) {
          return 'PM';
        }
      }
    };

    $scope.renderLineChartSlider = function() {

      $('#slider-range').slider({
        animate: true,
        range: true,
        min: 0,
        max: 24 * 60,
        step: 1,
        values: [ 17 * 60, 20 * 60 ],
        slide: function( event, ui ) {

          $('#timeIntervalSlider').val( 
            changeToModTwelve( Math.floor(( ui.values[0] )/60) ) + //hour
            ':' +
            pad( ( ui.values[0] ) % 60 ) + //minutes
            determineAmOrPm( Math.floor(( ui.values[0] )/60) ) +
            ' - ' +
            changeToModTwelve( Math.floor(( ui.values[1] )/60) ) + //hour
            ':' +
            pad( ( ui.values[1] ) % 60 ) + //minutes
            determineAmOrPm( Math.floor(( ui.values[1] )/60) )
          );

          $scope.$apply(function () {
            //rerender line chart with each value
            console.log(ui.values);
            AnalyticsFactory.renderLineChart([ui.values[0], ui.values[1]]);
          });

        }
      });

      $('#timeIntervalSlider').val( 
        changeToModTwelve( Math.floor( $('#slider-range').slider('values', 0) /60) ) + //hour
        ':' +
        pad( $('#slider-range').slider('values', 0) % 60 ) + //minutes
        determineAmOrPm( Math.floor( $('#slider-range').slider('values', 0) /60) ) +
        ' - ' +
        changeToModTwelve( Math.floor( $('#slider-range').slider('values', 1) /60) ) + //hour
        ':' +
        pad( $('#slider-range').slider('values', 1) % 60 ) + //minutes
        determineAmOrPm( Math.floor( $('#slider-range').slider('values', 0) /60) )
      );
  
      function pad(n) {
          return (n < 10) ? ('0' + n) : n;
      }

      function changeToModTwelve(number) {
        if (number === 0 || number === 12 || number === 24) {
          return 12;
        } else {
          return number % 12;
        }
      }

      function determineAmOrPm(number) {
        if ( (0 <= number && number < 12) || number === 24) {
          return 'AM';
        } else if (12 <= number && number < 24) {
          return 'PM';
        }
      }

    };

    $scope.renderBarChartSlider = function() {

      $('#bar-slider-range').slider({
        min: 0,
        max: 24 * 60,
        step: 1,
        animate: 'fast',
        value: 1100
      });

      $('#bar-slider-range').slider({
        slide: function( event, ui ) {

          $('#barChartSlider').val( 
            changeToModTwelve( Math.floor(( ui.value )/60) ) + //hour
            ':' +
            pad( ( ui.value ) % 60 ) + //minutes
            determineAmOrPm( Math.floor(( ui.value )/60) )
          );

          $scope.$apply(function () {
            //rerender heat map with each value
            AnalyticsFactory.renderBarChart(ui.value);
          });
        }
      });

      // $('#barChartSlider').val( 
      //   changeToModTwelve( Math.floor(( $('#slider').slider('value') )/60) ) + //hour
      //   ':' +
      //   pad( ( $('#slider').slider('value') ) % 60 ) + //minutes
      //   determineAmOrPm( Math.floor(( $('#slider').slider('value') )/60) )
      // );
    
      function pad(n) {
          return (n < 10) ? ('0' + n) : n;
      }

      function changeToModTwelve(number) {
        if (number === 0 || number === 12 || number === 24) {
          return 12;
        } else {
          return number % 12;
        }
      }

      function determineAmOrPm(number) {
        if ( (0 <= number && number < 12) || number === 24) {
          return 'AM';
        } else if (12 <= number && number < 24) {
          return 'PM';
        }
      }
    };   

    $scope.toggleHeatmap = HeatMapFactory.toggleHeatmap;
    $scope.changeGradient = HeatMapFactory.changeGradient;
    $scope.changeRadius = HeatMapFactory.changeRadius;
    $scope.changeOpacity = HeatMapFactory.changeOpacity; 
  }