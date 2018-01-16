$(document).on("mobileinit", function() {

  $(document).delegate('#page-notification', 'pagebeforeshow', function() {
    App.emptyHTML();
    SiteNotificationController.renderListAndUpdateViewed();
  });

  $(document).delegate('#page-notification #notification-list li', 'click', function() {
    var li = this;
    var sId = li.getAttribute('data-id');
    var cId = li.getAttribute('data-collection-id');
    if (sId == "load-more-" + cId) {
      SiteNotificationOffline.page[cId]++;
      SiteNotificationController.renderByCollectionId(cId);
      $(li).remove()
    }
    else {
      CollectionController.id = cId;
      SiteController.id = sId;
      $("#btn_save_site").text(i18n.t('global.update'));
      $("#btn_delete_site").hide();
      $("#ui-site-menu").hide();
      if(App.isOnline()){
        SiteController.renderUpdateSiteFormOnline();
      }else{
        alert(i18n.t("global.no_internet_connection"));
        location.href = '/#page-notification';
      }

    }
  });


});
