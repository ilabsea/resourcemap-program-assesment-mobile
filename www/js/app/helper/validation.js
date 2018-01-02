function validateToRemoveStyle(element) {
  if (element.attr('required') == 'required') {
    var $parent = $(element).closest(".ui-select");
    if (element.val() === "" || element.val() == undefined){
      $parent.removeClass('valid').addClass('error');
      showValidateMessage('#validation-save-site', i18n.t('validation.please_enter_required_field'));
    }
    else
      $parent.removeClass('error').addClass('valid');
  }
}

function showValidateMessage(selector, message) {
  var $element = $(selector)
  if(message != undefined)
    $element.html(message)

  $element.show().delay(3000).fadeOut();
}
