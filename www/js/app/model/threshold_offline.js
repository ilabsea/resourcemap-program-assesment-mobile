ThresholdOffline = {
  add: function (thresholds) {
    $.each(thresholds, function(index, threshold) {
      var thresholdParams = {
        collection_id: threshold.collection_id,
        alert_id: threshold.id,
        conditions: threshold.conditions,
        user_id_offline: SessionController.currentUser().id,
      };

      var thresholdObj = new Threshold(thresholdParams);
      persistence.add(thresholdObj);
    });
    persistence.flush();
  },
  destroyAllByCollectionId: function(cId, callback){
    Threshold.all()
      .filter('user_id_offline', '=', SessionController.currentUser().id)
      .filter('collection_id', '=', cId)
      .destroyAll(null, callback);
  },
  getByCollectionId: function(cId, callback){
    Threshold.all()
      .filter('collection_id', '=', cId)
      .list(null, callback);
  }
};
