angular
  .module('boundry.eventDashboard', [])
  .factory('EventDashboardFactory', EventDashboardFactory);

  EventDashboardFactory.$inject = ['$http', 'AuthFactory'];

  function EventDashboardFactory ($http, AuthFactory) {
    var eventData; //Set by controller after promise returns
    var currentOrganizerEmail = AuthFactory.getEmail();

    return {
      currentOrganizerEmail: currentOrganizerEmail,
      getEvents: getEvents,
      setEventData: setEventData,
      getEventData: getEventData
    };


    //Getter/setter for eventData
    function setEventData (data) {
      eventData = data;
    }
    function getEventData () {
      return eventData;
    }
    //TODO: This smells bad. Data should be resolved in the factory, not the in
    //the controller. Plus now all controllers that import that need to know
    //that getEvents returns a promise. 
    //Get all event data for an organizer
    function getEvents (organizerEmail) {
      organizerEmail = organizerEmail || 'test@org.com';
      var url = '/api/web/organizer/' + organizerEmail + '/events';
      console.log(url);
      return $http.get(url);
    }
  }