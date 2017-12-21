NotificationOffline = {
  limit: 5,
  // page = {collection_id: 0}
  page: {},
  add: function(sites , oldSites) {
    $.each(sites, function(index, site) {
      var siteParams = {
        collection_id: site.collection_id,
        site_id: site.id,
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

  get: function(callback){
    SiteNotification.all().list(null, callback);
  },

  getByCollectionIdPerLimit: function (cId, offset, callback) {
    SiteNotification.all()
        .filter('collection_id', "=", cId)
        .limit(NotificationOffline.limit)
        .skip(offset)
        .list(null, callback);
  },

  getViewed: function(callback){
    SiteNotification.all().filter('viewed', '=' , true).list(null, callback);
  },

  destroyAll: function (callback) {
    SiteNotification.all().destroyAll(null, callback);
  },

  countUnViewed: function (callback){
    SiteNotification.all().filter('viewed', '=' , false).count(null, callback);
  },

  countByCollectionId: function(cId, callback){
    SiteNotification.all().filter('collection_id', '=' , cId).count(null, callback);
  }
}
