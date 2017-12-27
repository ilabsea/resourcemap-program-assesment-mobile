FieldModel = {
  fetch: function(cId, successCallback, errorCallBack) {
    $.ajax({
      url: App.urlField() + cId + "/fields?auth_token=" + App.Session.getAuthToken(),
      type: "get",
      datatype: 'json',
      success: successCallback,
      timeout: 600000,
      error: errorCallBack
    });
  },

  fetchById: function(cId,fieldId, successCallback){
    $.ajax({
      url: App.urlField() + cId + "/fields/" + fieldId + "?auth_token=" + App.Session.getAuthToken(),
      type: "get",
      datatype: 'json',
      async: false,
      success: successCallback,
      timeout: 600000
    });
  }
};
