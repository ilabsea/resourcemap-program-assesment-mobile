ThresholdModel = {
  fetchSiteThreshold: function (success, complete) {
    var siteDateTime = localStorage['latestSiteNotification'];
    var dateTime = siteDateTime ? siteDateTime : App.getInstalledDateTime()
    var url = App.urlSiteThreshold();
    $.ajax({
      type: "get",
      url: url,
      data:  {'date': dateTime, 'auth_token': App.Session.getAuthToken()},
      dataType: "json",
      success: success
    });
  }
};
