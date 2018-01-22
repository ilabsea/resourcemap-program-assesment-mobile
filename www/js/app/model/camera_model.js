CameraModel = {
  fieldId: '',
  openCameraDialog: function (fieldId) {
    CameraModel.fieldId = fieldId;
    CameraModel.handleOpenCamera();
  },

  invokeCamera: function (cameraType) {
    SiteCamera.takePhoto(CameraModel.fieldId, cameraType);
    CameraModel.closeDialog();
  },

  closeDialog: function() {
    $("#cameraDialog").hide();
    $.mobile.activePage.removeClass('ui-disabled');
    FieldValidator.photo(CameraModel.fieldId);
  },

  handleOpenCamera: function () {
    $.mobile.activePage.addClass("ui-disabled");
    $("#cameraDialog").show();
  }
};
