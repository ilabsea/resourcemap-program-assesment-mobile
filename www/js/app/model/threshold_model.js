ThresholdModel = {
  fetchByCollectionId: function (cId, successCallback) {
    $.ajax({
      type: "get",
      url: App.urlSite() + cId + "/thresholds/to_reporter?auth_token=" + App.Session.getAuthToken(),
      dataType: "json",
      async: false,
      success: successCallback
    });
  },
  fetchSiteThreshold: function (success) {
    var url = App.urlSiteThreshold() + "?auth_token=" + App.Session.getAuthToken();
    $.ajax({
      type: "get",
      url: url,
      dataType: "json",
      success: success
    });
  }
};
