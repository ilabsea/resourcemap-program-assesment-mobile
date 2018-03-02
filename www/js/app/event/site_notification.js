$(document).on("mobileinit", function() {

  $(document).delegate('#page-notification', 'pagebeforeshow', function() {
    App.emptyHTML();
    SiteNotificationController.renderListAndUpdateViewed();
  });

  $(document).delegate('#notification-list .load-more', 'click', function() {
    var li = this;
    var cId = li.getAttribute('data-collection-id');
    SiteNotificationOffline.page[cId]++;
    SiteNotificationController.renderByCollectionId(cId);
    $(li).remove()
  });

  $(document).on("collapsibleexpand", "#page-notification [data-role=collapsible]", function () {
    var sId = this.getAttribute('data-site-id');
    SiteNotificationOffline.updateSeenBySID(sId);
    $('h3#' + sId + ' a').css({'background-color' : '#f3f3f3'});
  });
});
