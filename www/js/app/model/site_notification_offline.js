// page = {collection_id: 0}
SiteNotificationOffline = {
  limit: 5,
  page: {},
  add: function(sites) {
    $.each(sites, function(index, site) {
      SiteNotificationOffline.addOne(site);
    });
    persistence.flush();
  },

  addOne: function(site){
    var siteParams = {
      collection_id: site.collection_id,
      site_id: site.id,
      user_id_offline: SessionController.currentUser().id,
      site_name: site.name,
      properties: site.properties,
      alert_id: site.alert_id,
      created_at: site.created_at,
      updated_at: site.updated_at,
      viewed: false,
      seen: false
    };

    var siteObj = new SiteNotification(siteParams);
    persistence.add(siteObj);
  },

  updateBySiteId: function(newSite){
    SiteNotification.all().filter('site_id', '=' , newSite.id).one(null, function(site){
      if ( (newSite.updated_at != site.updated_at) || (site.alert_id != newSite.alert_id) ) {
        site.viewed = false;
        site.seen = false;
      }
      site.name = newSite.name;
      site.alert_id = newSite.alert_id;
      site.properties = newSite.properties;
      site.updated_at = newSite.updated_at;
      persistence.flush();
    });
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
    SiteNotification
      .all()
      .filter('user_id_offline','=',SessionController.currentUser().id)
      .list(null, callback);
  },

  getByCollectionIdPerLimitInCurrentUser: function (cId, offset, callback) {
    SiteNotification.all()
        .filter('collection_id', "=", cId)
        .filter('user_id_offline', '=', SessionController.currentUser().id)
        .limit(SiteNotificationOffline.limit)
        .skip(offset)
        .order('updated_at', false)
        .list(null, callback);
  },

  getViewedByUserIdOffline: function(callback){
    SiteNotification.all().filter('user_id_offline', '=', SessionController.currentUser().id).filter('viewed', '=' , true).list(null, callback);
  },

  getByCollectionIdInCurrentUser: function (cId) {
    SiteNotification
      .all()
      .filter('user_id_offline', '=', SessionController.currentUser().id)
      .filter('collection_id', '=' , cId)
      .list(null, callback);
  },

  destroyAllByUserIdOffline: function( callback) {
    SiteNotification
      .all()
      .filter('user_id_offline', '=', SessionController.currentUser().id)
      .destroyAll(null, callback);
  },

  remove: function(site){
    persistence.remove(site);
    persistence.flush();
  },

  countUnViewedByUserIdOffline: function (callback){
    SiteNotification
      .all()
      .filter('user_id_offline', '=', SessionController.currentUser().id)
      .filter('viewed', '=' , false)
      .count(null, callback);
  },

  countByCollectionIdInCurrentUser: function(cId, callback){
    SiteNotification
      .all()
      .filter('user_id_offline', '=', SessionController.currentUser().id)
      .filter('collection_id', '=' , cId)
      .count(null, callback);
  }
}
