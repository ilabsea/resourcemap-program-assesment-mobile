CameraModel = {
  fieldId: '',
  openCameraDialog: function (fieldId) {
    CameraModel.fieldId = fieldId;
    CameraModel.handleOpenCamera();
    FieldController.validatePhotoField(fieldId);
  },

  invokeCamera: function (cameraType) {
    SiteCamera.takePhoto(CameraModel.fieldId, cameraType);
    CameraModel.closeDialog();
  },

  closeDialog: function() {
    $("#cameraDialog").hide();
    $.mobile.activePage.removeClass('ui-disabled');
    FieldController.validatePhotoField(CameraModel.fieldId);
  },

  handleOpenCamera: function () {
    // localStorage['no_update_reload'] = 1;
    $.mobile.activePage.addClass("ui-disabled");
    $("#cameraDialog").show();
  }
};
