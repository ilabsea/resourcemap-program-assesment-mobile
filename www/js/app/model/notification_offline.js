NotificationOffline = {
  limit: 5,
  // page = {collection_id: 0}
  page: {},
  addAndUpdate: function(sites , oldSites) {
    $.each(sites, function(index, site) {
      var siteParams = {
        collection_id: site.collection_id,
        site_id: site.id,
        user_id_offline: SessionController.currentUser().id,
        site_name: site.name,
        properties: site.properties,
        alert_id: site.alert_id,
        created_at: site.created_at,
        viewed: false,
        seen: false
      };
      for(var i = 0; i < oldSites.length ; i++){
        if(oldSites[i].site_id == site.id){
          siteParams.viewed = oldSites[i].viewed;
          siteParams.seen = oldSites[i].seen;
          break;
        }
      }
      var siteObj = new SiteNotification(siteParams);
      persistence.add(siteObj);
    });
    persistence.flush();
  },

  updateViewed: function(sites){
    $.each(sites, function(index, site) {
      site.viewed = true;
    });
    persistence.flush();
  },

  updateSeenBySID: function(sId){
    SiteNotification.all().filter('site_id', '=' , sId).one(null, function(site){
      site.seen = true;
      persistence.flush();
    });
  },

  getByUserIdOffline: function(callback){
    SiteNotification.all().filter('user_id_offline','=',SessionController.currentUser().id).list(null, callback);
  },

  getByCollectionIdPerLimitInCurrentUser: function (cId, offset, callback) {
    SiteNotification.all()
        .filter('collection_id', "=", cId)
        .filter('user_id_offline', '=', SessionController.currentUser().id)
        .limit(NotificationOffline.limit)
        .skip(offset)
        .list(null, callback);
  },

  getViewedByUserIdOffline: function(callback){
    SiteNotification.all().filter('user_id_offline', '=', SessionController.currentUser().id).filter('viewed', '=' , true).list(null, callback);
  },

  destroyAllByUserIdOffline: function( callback) {
    SiteNotification.all().filter('user_id_offline', '=', SessionController.currentUser().id).destroyAll(null, callback);
  },

  countUnViewedByUserIdOffline: function (callback){
    SiteNotification.all().filter('user_id_offline', '=', SessionController.currentUser().id).filter('viewed', '=' , false).count(null, callback);
  },

  countByCollectionIdInCurrentUser: function(cId, callback){
    SiteNotification.all().filter('user_id_offline', '=', SessionController.currentUser().id).filter('collection_id', '=' , cId).count(null, callback);
  }
}
