SiteNotificationController = {
  sites: [],
  collectionIds : [],
  fieldNames: {}, //{'field_id': 'field_name'}

  reset: function(){
    SiteNotificationController.sites = [];
    SiteNotificationController.collectionIds = [];
    SiteNotificationController.fieldNames = [];
  },

  changeColorOfSeen: function(){
    var sites = SiteNotificationController.sites;
    for(var i = 0 ; i < sites.length ; i++){
      var site = sites[i];
      $('h3#' + site.site_id + ' a').css({'background-color' : site.seen ? '#f3f3f3' : 'rgba(187, 187, 187, 0.75)'});
    }
    Jqstyle.truncateTextStyle('h3 a');
  },

  displayLists: function (sites) {
    var content = App.Template.process("site_notification_list", sites);
    var $updateNode = $("#notification-list");
    $updateNode.html(content);
    $updateNode.trigger("create");
    SiteNotificationController.changeColorOfSeen();
  },

  appendList: function(sites){
    var content = App.Template.process("site_notification_list_partial", sites);
    $element = $("#notification-list-" + sites.collection_id);
    $element.append(content);
    $element.trigger("create");
    SiteNotificationController.changeColorOfSeen();
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
        if ( i === array.length ) {
          SiteNotificationController.displayLists(collectionsData);
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
      SiteNotificationController.prepareSites(data, collection, callback);
    });
  },

  prepareSites: function(data, collection, callback){
    var offset = SiteNotificationOffline.page[collection.idcollection] * SiteNotificationOffline.limit;
    SiteNotificationOffline.updateViewed();

    SiteNotificationOffline.getByCollectionIdPerLimitInCurrentUser(collection.idcollection, offset, function(sites){
      SiteNotificationController.buildSites(sites);
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

  buildSites: function (sites) {
    SiteNotificationController.sites = [];
    sites.forEach(function(site){
      var data = {
        collection_id: site.collection_id,
        site_id: site.site_id,
        site_name: site.site_name,
        properties: site.properties,
        conditions: site.conditions,
        message_notification: site.message_notification,
        alert_id: site.alert_id,
        viewed: site.viewed,
        seen: site.seen
      }
      if(App.isOnline()){
        for(var i=0; i < site.conditions.length; i++){
          var condition = site.conditions[i];
          if (SiteNotificationController.fieldNames[condition.field]) {
            condition.field_name = SiteNotificationController.fieldNames[condition.field];
          } else{
            FieldModel.fetchById(site.collection_id, parseInt(condition.field), function (f) {
              SiteNotificationController.fieldNames[condition.field] = f.name;
              condition.field_name = f.name;
            });
          }
        }
      }
      SiteNotificationController.sites.push(data);
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
    SiteNotificationOffline.getByUserIdOffline(function(sites){
      if(App.isOnline()) {
        SiteNotificationController.storeSitesNotificationAndThresholds(sites, function(){
          SiteNotificationController.displayNotification();
        });
      }else{
        SiteNotificationController.setCollectionIds(sites);
        SiteNotificationController.displayNotification();
      }
    });
  },

  storeSitesNotificationAndThresholds: function(oldSites, callback){
    var newSitesIds = [];
    ThresholdModel.fetchSiteThreshold(function(newSites){
      SiteNotificationController.setCollectionIds(newSites);
      if ( oldSites.length == 0 ) {
        SiteNotificationOffline.add(newSites);
        callback()
      } else {
        newSites.forEach ( function ( newSite ) {
          newSitesIds.push(newSite.id);
          var isExist = false,  i = 0;
          oldSites.forEach(function(oldSite, index, array){
            if(newSite.id == oldSite.site_id){
              SiteNotificationOffline.updateBySiteId(newSite);
              isExist = true;
            }
            i++;
            if (i == array.length && !isExist) {
              SiteNotificationOffline.addOne(newSite);
              persistence.flush();
            }
            callback()
          });
        });
        for (var l = 0 ; l < oldSites.length ; l++){
          if (!(newSitesIds.indexOf(oldSites[l].site_id) > -1)){
            SiteNotificationOffline.remove(oldSites[l]);
          }
        }
      }
    });
  }
}
