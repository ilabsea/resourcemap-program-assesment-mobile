var FieldValidator = {

  numericRange: function (field, value) {
    if(value >= field.config.range.minimum && value <= field.config.range.maximum ){
      field.invalid = "";
      return true;
    }
    else {
      field.invalid = 'error';
      return false;
    }
  },

  numericCustomValidate: function(compareFieldId, config, oriFieldId){
    $compareElement = $("#" + compareFieldId);
    $oriElement = $("#" + oriFieldId);
    compareField = FieldController.findFieldById(compareFieldId);
    oriField = FieldController.findFieldById(oriFieldId);
    fieldValue = $compareElement.val() || compareField.__value;
    fieldValue = parseFloat(fieldValue);
    if(isNaN(fieldValue)){
      fieldValue = 0;
    }
    value = $oriElement.val() || oriField.__value;
    res = Operators[config["condition_type"]](value, fieldValue);
    if(res == false){
      showValidateMessage('#validation-save-site', i18n.t('validation.value_must_be')
            + TextOperator[config["condition_type"]]() + compareField.name) ;
      $oriElement.addClass("error");
      return;
    }else{
      $oriElement.removeClass("error");
    }
  },

  emailFormat: function(field, value){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(value)){
      field.invalid = 'error';
      return false;
    }
    else {
      field.invalid = '';
      return true;
    }
  },

  photo: function (fieldId) {
    var field = FieldController.findFieldById(fieldId);
    if(field.is_mandatory)
      if(!($("#" + fieldId).attr('src'))){
        showValidateMessage('#validation-save-site', i18n.t('validation.please_enter_required_field'));
        $("#" + fieldId).parents().addClass("error");
      }
      else
        $("#" + fieldId).parents().removeClass("error");
  },
}
