ThresholdModel = {
  fetchSiteThreshold: function (success, complete) {
    var url = App.urlSiteThreshold() + "?auth_token=" + App.Session.getAuthToken();
    $.ajax({
      type: "get",
      url: url,
      dataType: "json",
      success: success,
      complete: complete
    });
  }
};
