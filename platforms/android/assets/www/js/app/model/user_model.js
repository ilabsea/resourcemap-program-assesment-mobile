UserModel = {
  create: function(url, attr, successCallback, errorCallback) {
    $.ajax({
      url: url,
      type: "POST",
      data: attr,
      success: successCallback,
      error: errorCallback
    });
  },
  delete: function(callback) {
    $.ajax({
      url: App.urlLogout() + App.Session.getAuthToken(),
      type: "POST",
      complete: function() {
        callback();
        ViewBinding.setBusy(false);
      }
    });
  }
};
