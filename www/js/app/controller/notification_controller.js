NotificationController = {
  allSites: [],
  sites: [],
  currentConditions: null,
  collectionIds : [],

  setCurrentConditions: function(sId){
    NotificationController.allSites.map(function(site){
      if(site.site_id == sId){
        NotificationController.currentConditions = site.threshold.conditions;
      }
    });
  },

  reset: function(){
    NotificationController.sites = [];
    NotificationController.collectionIds = [];
    NotificationController.currentConditions = null;
    NotificationController.allSites = [];
  },

  displayLists: function (sites) {
    var content = App.Template.process("notification_list", sites);
    var $updateNode = $("#notification-list");
    $updateNode.html(content);
    $updateNode.trigger("create");
  },

  appendList: function(sites){
    var content = App.Template.process("notification_list_partial", sites);
    $element = $("#notification-list-" + sites.collection_id);
    $element.append(content);
    $element.listview("refresh");
  },

  renderListAndUpdateViewed: function () {
    // {collections: [{'Test' : {sites: [{id: 1, name: 'abc', threshold: threshold}], hasMoreSites: false, collection_id: 1}}]}
    var cIds = NotificationController.collectionIds;
    var i = 0;
    var collectionsData = {collections: [] , length: cIds.length};
    if(cIds.length == 0){
      NotificationController.displayLists(collectionsData);
    }
    cIds.forEach(function(cId, index, array){
      NotificationOffline.page[cId] = 0;
      NotificationController.prepareSitesByCollectionId(cId, function(data){
        collectionsData['collections'].push(data);
        i++;
        if (i === array.length) {
          console.log('collectionsData: ', collectionsData);
          NotificationController.displayLists(collectionsData);
          SiteController.currentPage = '#page-notification';
        }
      });
    })
  },

  prepareSitesByCollectionId: function(cId, callback){
    CollectionOffline.fetchByCollectionId(cId, function(collection){
      var data = {};
      data[collection.name] = {sites: [], hasMoreSites: false, totalSites: 0, collection_id: collection.idcollection };
      if(App.isOnline()){
        ThresholdModel.fetchByCollectionId(collection.idcollection, function(thresholds){
          NotificationController.prepareSites(data, collection, thresholds, callback);
        });
      }else{
        NotificationController.prepareSites(data, collection, [], callback);
      }
    });
  },

  prepareSites: function(data, collection, thresholds, callback){
    var offset = NotificationOffline.page[collection.idcollection] * NotificationOffline.limit;
    NotificationOffline.get(function(allSites){
      NotificationOffline.updateViewed(allSites);
    })

    NotificationOffline.getByCollectionIdPerLimit(collection.idcollection, offset, function(sites){
      NotificationController.buildSites(sites, thresholds);
      data[collection.name]["sites"] = NotificationController.sites;

      NotificationOffline.countByCollectionId(collection.idcollection, function (count) {
        var l = sites.length + offset;
        data[collection.name]["totalSites"] = count;
        data[collection.name]["hasMoreSites"] = l < count ? true : false;
        callback(data, collection);
      });
    });
  },

  renderByCollectionId: function(cId, callback){
    NotificationController.prepareSitesByCollectionId(cId, function(data, collection){
      NotificationController.appendList(data[collection.name]);
    });
  },

  buildSites: function (sites, thresholds) {
    NotificationController.sites = [];
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
      if(thresholds.length > 0){
        for(var i = 0 ;i <thresholds.length ; i++){
          var threshold = thresholds[i];
          if(threshold.id == site.alert_id){
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
      NotificationController.sites.push(data);
      NotificationController.allSites.push(data);
    });
  },

  displayNotification: function () {
    NotificationOffline.countUnViewed(function(count){
      var content = App.Template.process("notifications", {'notifications': {'total': count}});
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
    NotificationController.collectionIds = collectionIds;
  },

  renderNotificationMessage: function () {
    if(App.isOnline()) {
      ThresholdModel.fetchSiteThreshold(function(sites){
        NotificationController.setCollectionIds(sites);
        NotificationController.synSitesNotification(sites);
      });
    }else{
      NotificationOffline.get(function(sites){
        NotificationController.setCollectionIds(sites);
        NotificationController.displayNotification();
      })
    }
  },

  synSitesNotification: function (newSites) {
    NotificationOffline.getViewed(function(oldSites){
      NotificationOffline.destroyAll(function(){
        NotificationOffline.add(newSites, oldSites);
        NotificationController.displayNotification();
      })
    })

  }
}
