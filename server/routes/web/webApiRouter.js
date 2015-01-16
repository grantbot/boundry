//Require endpoints from folders
var express = require('express');
var webApiRouter = express.Router();
var models = require('../../db/db').models;
var collections = require('../../db/db').collections;
var util = require('./../../../lib/utility');

//should pull events and their regions for a given org email
var getEvents = function(req,res) {
  if (util.isLoggedIn(req,res)) {
    var orgEmail = req.params.email;
    //Get organizer ID. Inefficient but that's what we're getting from client
    //for now
    new models.Organizer({email: orgEmail}).fetch().then(function(found) {
      if (found) { //Organizer exists
        var finalObj = [];
        collections.Events //Get the Organizer's events
          .query('where', 'organizer_id', '=', found.get('id'))
          .fetch({withRelated: ['regions']})
          .then(function(events) {
            if (events.length !== 0) { //Organizer has events
              events.models.forEach(function(ev) {
                // console.log('55',ev.attributes);
                ev.attributes.event_center = JSON.parse(ev.attributes.event_center);
                console.log('Event_center', ev.attributes.event_center);
                ev.attributes.regions = [];
                //for every region, push region attr to event.regions
                ev.relations.regions.models.forEach(function(reg) {
                  //We stringify this field on saving, so we have to parse it out here
                  reg.attributes.region_attr = JSON.parse(reg.attributes.region_attr);                     
                  //ev.attributes.regions.push(reg.attributes);
                });
              });
            } 
            res.status(200).send(events.models);
          })
        .catch(function(error, blah) {
          res.send(500);
          console.log('THINGY', blah);
          throw error;
        });
      } else { //Organizer does not exist
        res.status(400).send('Organizer with email ', orgEmail, ' not found');
      }
    });
  } 
  else {
    res.status(400).send('not logged in. cannot get.');
  }
};

//post update
//should save to the events table and regions table
var postEvent = function(req,res) {
 if (util.isLoggedIn(req,res)) {
   var orgEmail = req.params.email;
   //create object to save
   var eventName = req.body.name;
   var startTime = req.body.start_time;
   var eventCenter = JSON.stringify(req.body.event_center);
   var regions = req.body.regions;
   var eventId = req.body.id;

    new models.Organizer({email: orgEmail}).fetch().then(function(found) { //TODO: Do we actually need this orgEmail check?
      if (found) {
        //existing event
        if (eventId !== null) {
          collections.Events.query()
          .where({organizer_id:found.attributes.id, id: eventId})
          .update({name:eventName, event_center: eventCenter})
          .then(function(orgEvent) { //TODO: we don't use orgEvent anywhere
            regions.forEach(function(region) {
              //existing region
              if (region.id !== null) {
                // console.log('UPDATING REGION', region.id);
                collections.Regions.query()
                .where({ event_id: eventId,id: region.id})
                .update({region_name: region.region_name,
                 region_attr: JSON.stringify(region.region_attr)})
                .then(function(reg) {
                  if (region.actions !== undefined) {
                    var regionActionObj = region.actions;
                    collections.Actions.query()
                      .where({region_id: region.id})
                      .update({name:regionActionObj[0].name, action_data: regionActionObj[0].action_data})
                      .then(function(actionUpdated) {
                        console.log('actionUpdated', actionUpdated);
                      })
                    .catch(function(err) {
                      console.log('update reg error',err);
                    });
                  }
                });
              //new region
              } else {
                new models.Region({
                  region_name: region.region_name,
                  region_attr: JSON.stringify(region.region_attr),
                  event_id: eventId
                }).save()
                .then(function(savedReg) {
                  collections.Regions.query()
                  .where({id:savedReg.id})
                  .then(function(foundReg) {
                    if (foundReg.length > 0) {
                      var regId = foundReg[0].id;
                      if (region.actions.length > 0 && region.actions !== undefined) {
                        region.actions.forEach(function(action) {
                          action.region_id = savedReg.Id;
                          new models.Action({
                            name: action.name,
                            action_data: action.action_data,
                            region_id: regId
                          }).save()
                          .then(function(savedAction) {
                            console.log('saved an action!', savedAction);
                          })
                          .catch(function(err) {
                            console.log('error!!!',err);
                          });
                        });
                      }
                    }
                  });
                })
                .catch(function(err) {
                  throw(err);
                });

              }
            });
              res.status(200).send('updated');
          });
        } else {
          //save new event to event table
          new models.Event({
            name: eventName,
            start_time: startTime,
            end_time: startTime,
            event_center: eventCenter,
            organizer_id: found.attributes.id
          }).save()
          .then(function(savedEvent) {
            //get event_id for region just saved and store region data to table
            collections.Events.query()
            .where({organizer_id:found.attributes.id, name:eventName})
            .then(function(foundEv) {
              if (foundEv.length > 0) {
                var evId = foundEv[0].id;
                //save to region table region attr
                regions.forEach(function(region) {
                  //check if have regionId (existing)
                    new models.Region({
                      region_name: region.region_name,
                      region_attr: JSON.stringify(region.region_attr),
                      event_id: evId
                    }).save()
                    .then(function(savedReg) {
                      collections.Regions.query()
                      .where({id:savedReg.id})
                      .then(function(foundReg) {
                        // console.log('colReg',foundReg);
                        if (foundReg.length > 0) {
                          var regId = foundReg[0].id;
                          if (region.actions.length > 0 && region.actions !== undefined) {
                            region.actions.forEach(function(action) {
                              action.region_id = savedReg.Id;
                              new models.Action({
                                name: action.name,
                                action_data: action.action_data,
                                region_id: regId
                              }).save()
                              .then(function(savedAction) {
                                // console.log('saved an action!', savedAction);
                              })
                              .catch(function(err) {
                                console.log('error!!!',err);
                              });
                            });
                          }
                        }
                      });
                    });
                });
              }
            });
          res.status(200).send('saved ev and region');
          })
          .catch(function(err) {
            console.log('error:', err);
          }); 
        }
      }
    });
  } else {
    res.status(400).send('not logged in. cannot post.');
  }
};

var getActions = function(req,res) {
  if (util.isLoggedIn(req,res)) {
    var regId = req.params.regionId;
    console.log(regId + 'regId');
    collections.Actions.query()
    .where({region_id: regId})
    .then(function(foundActions) {
      res.status(200).send(foundActions);
    })
    .catch(function(err) {
      console.log('cant get actions', err);
    });
  } else {
    res.status(400).send('not logged in. cannot post.');
  }
};

webApiRouter.get('/organizer/:email/events', getEvents);
webApiRouter.post('/organizer/:email/events', postEvent);
webApiRouter.get('/organizer/actions/:regionId', getActions);

module.exports = webApiRouter;
