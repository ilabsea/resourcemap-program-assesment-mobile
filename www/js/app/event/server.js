$(document).on("mobileinit", function() {
  $(document).delegate('#page-change-server', 'pageshow', function () {
    $('#txt-url').val(RmSetting.url());
  });
})
$(function(){
  $("#form-change-server-url").validate({
    focusInvalid: false,
    errorPlacement: function () {
    },
    submitHandler: function () {
      Dialog.showDialog("dialog-confirm-change-server");
      $('#url-error').text('');
    },
    invalidHandler: function () {
      $('#url-error').text(i18n.t('validation.invalidUrl'));
    }
  });

  $('#btn-confirm-change-server').on('click', function(){
    url = $('#txt-url').val();
    Dialog.closeDialog('dialog-confirm-change-server');
    App.changeServerUrl(normalizeUrl(url));
  });

  $('#btn-cancel-change-server').on('click', function(){
    Dialog.closeDialog('dialog-confirm-change-server');
  });

  function normalizeUrl(url){
    return (url.slice(-1) == '/') ? url.slice(0, -1) : url;
  }
});
