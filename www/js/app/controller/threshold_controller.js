ThresholdController = {
  fetchAndSyn: function(){
    for(var k = 0 ; k < SiteNotificationController.collectionIds.length; k++){
      var cId = SiteNotificationController.collectionIds[k];
      ThresholdModel.fetchByCollectionId(cId, function(thresholds){
        ThresholdController.synByCollectionId(cId , thresholds);
      });
    }
  },
  synByCollectionId: function (cId, newThresholds) {
    ThresholdOffline.destroyAllByCollectionId( cId, function() {
      ThresholdOffline.add(newThresholds);
    })
  }
}
