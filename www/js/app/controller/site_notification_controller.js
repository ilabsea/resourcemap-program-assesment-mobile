SiteNotificationController = {
  allSites: [],
  sites: [],
  currentConditions: null,
  collectionIds : [],

  setCurrentConditions: function(sId){
    SiteNotificationController.allSites.map(function(site){
      if(site.site_id == sId){
        SiteNotificationController.currentConditions = site.threshold.conditions;
      }
    });
  },

  reset: function(){
    SiteNotificationController.sites = [];
    SiteNotificationController.collectionIds = [];
    SiteNotificationController.currentConditions = null;
    SiteNotificationController.allSites = [];
  },

  displayLists: function (sites) {
    var content = App.Template.process("site_notification_list", sites);
    var $updateNode = $("#notification-list");
    $updateNode.html(content);
    $updateNode.trigger("create");
  },

  appendList: function(sites){
    var content = App.Template.process("site_notification_list_partial", sites);
    $element = $("#notification-list-" + sites.collection_id);
    $element.append(content);
    $element.listview("refresh");
  },

  renderListAndUpdateViewed: function () {
    // {collections: [{'Test' : {sites: [{id: 1, name: 'abc', threshold: threshold}], hasMoreSites: false, collection_id: 1}}]}
    var cIds = SiteNotificationController.collectionIds;
    var i = 0;
    var collectionsData = { collections: [] };
    if(cIds.length == 0){
      SiteNotificationController.displayLists(collectionsData);
    }
    cIds.forEach(function(cId, index, array){
      SiteNotificationOffline.page[cId] = 0;
      SiteNotificationController.prepareSitesByCollectionId(cId, function(data){
        collectionsData['collections'].push(data);
        i++;
        if (i === array.length) {
          SiteNotificationController.displayLists(collectionsData);
          SiteController.currentPage = '#page-notification';
        }
      });
    })
  },

  prepareSitesByCollectionId: function(cId, callback){
    CollectionOffline.fetchByCollectionId(cId, function(collection){
      var data = {};
      data[collection.name] = {
        sites: [],
        hasMoreSites: false,
        totalSites: 0,
        collection_id: collection.idcollection
      };
      ThresholdOffline.getByCollectionId(collection.idcollection, function(thresholds){
        SiteNotificationController.prepareSites(data, collection, thresholds, callback);
      });
    });
  },

  prepareSites: function(data, collection, thresholds, callback){
    var offset = SiteNotificationOffline.page[collection.idcollection] * SiteNotificationOffline.limit;
    SiteNotificationOffline.getByUserIdOffline(function(allSites){
      SiteNotificationOffline.updateViewed(allSites);
    })

    SiteNotificationOffline.getByCollectionIdPerLimitInCurrentUser(collection.idcollection, offset, function(sites){
      SiteNotificationController.buildSites(sites, thresholds);
      data[collection.name]["sites"] = SiteNotificationController.sites;

      SiteNotificationOffline.countByCollectionIdInCurrentUser(collection.idcollection, function (count) {
        var l = sites.length + offset;
        data[collection.name]["totalSites"] = count;
        data[collection.name]["hasMoreSites"] = l < count ? true : false;
        callback(data, collection);
      });
    });
  },

  renderByCollectionId: function(cId, callback){
    SiteNotificationController.prepareSitesByCollectionId(cId, function(data, collection){
      SiteNotificationController.appendList(data[collection.name]);
    });
  },

  buildSites: function (sites, thresholds) {
    SiteNotificationController.sites = [];
    sites.forEach(function(site){
      var data = {
        collection_id: site.collection_id,
        site_id: site.site_id,
        site_name: site.site_name,
        properties: site.properties,
        alert_id: site.alert_id,
        viewed: site.viewed,
        seen: site.seen
      }
      if(App.isOnline()){
        for(var i = 0 ; i <thresholds.length ; i++){
          var threshold = thresholds[i];
          if(threshold.alert_id == site.alert_id){
            data.threshold = threshold;
            for(var j=0; j < threshold.conditions.length; j++){
              var condition = threshold.conditions[j];
              FieldModel.fetchById(site.collection_id, parseInt(condition.field), function (f) {
                condition.field_name = f.name;
              });
            }
          }
        }
      }
      SiteNotificationController.sites.push(data);
      SiteNotificationController.allSites.push(data);
    });
  },

  displayNotification: function () {
    SiteNotificationOffline.countUnViewedByUserIdOffline(function(count){
      var content = App.Template.process("site_notifications", {'notifications': {'total': count}});
      var $updateNode = $("#notifications");
      $updateNode.html(content);
      $updateNode.listview("refresh");
    });
  },

  setCollectionIds: function(sites){
    var collectionIds = [];

    for (var i = 0 ; i < sites.length ; i++){
      site = sites[i];
      if (!(collectionIds.indexOf(site.collection_id) > -1))
        collectionIds.push(site.collection_id);
    }
    SiteNotificationController.collectionIds = collectionIds;
  },

  renderNotificationMessage: function () {
    if(App.isOnline()) {
      SiteNotificationController.storeSitesNotificationAndThresholds(function(){
        SiteNotificationController.displayNotification();
      });
    }else{
      SiteNotificationOffline.getByUserIdOffline(function(sites){
        SiteNotificationController.setCollectionIds(sites);
        SiteNotificationController.displayNotification();
      })
    }
  },

  storeSitesNotificationAndThresholds: function(callback){
    var newSitesIds = [];
    SiteNotificationOffline.getByUserIdOffline(function(oldSites){
      ThresholdModel.fetchSiteThreshold(function(newSites){
        SiteNotificationController.setCollectionIds(newSites);
        ThresholdController.fetchAndSyn();
        if ( oldSites.length == 0 ) {
          SiteNotificationOffline.add(newSites);
        } else {
          newSites.forEach(function( newSite ){
            newSitesIds.push(newSite.id);
            var isExist = false,  i = 0;
            oldSites.forEach(function(oldSite, index, array){
              if(newSite.id == oldSite.site_id){
                ThresholdOffline.getByCollectionId(newSite.collection_id, function(thresholds){
                  thresholds.forEach( function( threshold ){
                    threshold.conditions.forEach(function( condition) {
                      if ( oldSite.properties[condition.field] != newSite.properties[condition.field] ) {
                        SiteNotificationOffline.updateBySiteId(newSite);
                      }
                    });
                  });
                });
                isExist = true;
              }
              i++;
              if (i == array.length && !isExist) {
                SiteNotificationOffline.addOne(newSite);
                persistence.flush();
              }
            });
          });
          for (var l = 0 ; l < oldSites.length ; l++){
            if (!(newSitesIds.indexOf(oldSites[l].site_id) > -1)){
              SiteNotificationOffline.remove(oldSites[l]);
            }
          }
        }
        callback();
      });
    });
  }
}
