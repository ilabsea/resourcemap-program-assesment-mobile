var Dialog = {
  closeDialog: function(element) {
    $("#" + element).hide();
    App.dialogPageId = '';
    $.mobile.activePage.removeClass('ui-disabled');
  },
  showDialog:function(element){
    $("#" + element).show();
    App.dialogPageId = element;
    $.mobile.activePage.addClass('ui-disabled');
  }
};
