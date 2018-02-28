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
    Dialog.closeDialog("cameraDialog");
    FieldController.validatePhotoField(CameraModel.fieldId);
  },

  handleOpenCamera: function () {
    Dialog.showDialog("cameraDialog")
  }
};
