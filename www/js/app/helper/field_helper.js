
FieldHelper = {
  buildLayerFields: function (layer, callback) {
    var layerData = layer._data;
    var isOnline = false;

    var newLayer = {
      cId: CollectionController.id,
      userId: UserSession.getUser().id,
      name_wrapper: layerData.name_wrapper,
      id_wrapper: layerData.id_wrapper,
      valid: true,
      fields: []
    }

    MyMembershipController.layerMembership(FieldController.site, newLayer.id_wrapper, function(can_entry){

      $.each(layer.fields, function (_, field) {
        var fieldForUI = FieldHelper.fieldForUI(field, can_entry, layer.id_wrapper)

        for(fieldId in FieldController.site.properties) {
          if(fieldId == fieldForUI.idfield){
            FieldHelper.setFieldValue(fieldForUI, FieldController.site.properties[fieldId], isOnline);
            break;
          }
        }
        newLayer.fields.push(fieldForUI);
      });
      callback(newLayer);

    });
  },

  fieldForUI: function(field, layer_field_permission, layer_id){
    var widgetMapper = { "numeric": "number", "yes_no": "select_one", "phone": "tel",
                         "location": "select_one", "calculation": "text" };

    var fieldUI = {
      idfield: field.id,
      layer_id: layer_id,
      name: field.name,
      kind: field.kind,
      code: field.code,
      config: field.config,
      multiple: (field.kind === "select_many" ? "multiple" : ""),
      isPhoto: (field.kind === "photo" ? true : false),
      isHierarchy: (field.kind === "hierarchy" ? true : false),
      isCustomWidget: (field.kind === "custom_widget" ? true : false),
      is_enable_field_logic: field.is_enable_field_logic,
      is_enable_custom_validation: field.is_enable_custom_validation,
      custom_widgeted: field.custom_widgeted,
      readonly_custom_widgeted: field.readonly_custom_widgeted,
      is_mandatory: field.is_mandatory,
      is_display_field: field.is_display_field,
      invisible: '',
      slider: '',
      ctrue: '',
      readonly: '',
      disableState: false,
      __value: '',
      __filename: '',
      invalid: '',
      invalidMessage: ''
    };
    if(field.custom_widgeted )
      fieldUI.widgetType = 'custom_widget_tokenizer';
    else if (widgetMapper[field.kind])
      fieldUI.widgetType = widgetMapper[field.kind];
    else
      fieldUI.widgetType = fieldUI.kind;

    fieldUI.required =  fieldUI.is_mandatory ? "required" : ""

    if (fieldUI.kind === "select_one" && fieldUI.is_enable_field_logic) {
      if (!fieldUI.config.field_logics)
        fieldUI.is_enable_field_logic = false;
    }

    if (fieldUI.kind === "yes_no") {
      options = FieldHelper.buildFieldYesNo(fieldUI.config);
      fieldUI.config["options"] = options["options"]
      fieldUI.slider = "slider";
      fieldUI.ctrue = "true";
    }

    if (fieldUI.kind === "calculation") {
      fieldUI.readonly = 'readonly';

      if (!fieldUI.is_display_field)
        fieldUI.invisible = "invisble-div";
    }

    if (fieldUI.kind === "custom_widget")
      fieldUI.config = FieldHelper.buildFieldCustomWidget(fieldUI.config, fieldUI.readonly_custom_widgeted);

    if (fieldUI.kind == 'location')
      fieldUI.config.locationOptions = Location.getLocations(FieldController.site.lat, FieldController.site.lng, fieldUI.config);

    var can_edit = layer_field_permission;

    if (fieldUI.kind == 'yes_no')
      fieldUI.editable = can_edit ? "" : "disabled";
    else
      fieldUI.editable = can_edit ? "" : "readonly";

    return fieldUI;
  },

  buildFieldCustomWidget: function (config, readonly){
    widgetContent = config["widget_content"];
    regExp = /(&nbsp;)|\{([^}]*)\}/mg ;
    widgetContent = widgetContent.replace(regExp, function(match, space, token) {
        replace = space || token ;
        if(replace === "&nbsp;")
          replaceBy = '';
        else{
            isReadOnly = readonly ? " data-readonly='readonly' " : ""
            replaceBy = '<div data-custom-widget-code="'
                          + replace +'" ' + isReadOnly +  '></div>';

        }
       return replaceBy;
    });

    config.widget_content = widgetContent;
    return config;
  },

  buildFieldSelectOne: function (config) {

    $.each(config.options, function ( _ , option) {
      if (config.field_logics) {
        $.each(config.field_logics, function ( _ , fieldLogic) {
          if (option.id === fieldLogic.value && !option["field_id"])
            option["field_id"] = fieldLogic.field_id;
        });
      }
    });

    return config;

  },

  buildFieldYesNo: function (config, isOnline) {
    var field_id0, field_id1;
    config = {
      options: [{
          id: 0,
          label: "NO",
          code: "1"
        },
        {id: 1,
          label: "YES",
          code: "2"
        }]
    };
    return config;
  },

  setFieldValue: function (field, value, isOnline) {
    if(!value){
      field.__value = ''
      return;
    }

    switch (field.kind) {
      case "photo" :
        if(isOnline)
          field.__value = FieldHelper.imageWithPath(value);
        else{
          var imageData = FieldController.site.files[value]
          if(imageData){
            field.__value = SiteCamera.dataWithMimeType(imageData);
            field.__filename = value;
          }
          else
            field.__value = ''
        }
        break;
      case "select_many":
      case "select_one":
      case "yes_no":
        field.__value = value;
        $.each(field.config.options, function(k, option){
          if (field.__value instanceof Array) {
            $.each(field.__value, function(_, valueOption){
              if (option.id == valueOption || option.code == valueOption){
                field.config.options[k]["selected"] = "selected";
              }
            })
          }

          else if(option.id == value || option.code == value){
            field.__value = option.id;
            field.config.options[k]["selected"] = "selected";
          }else{
            field.config.options[k]["selected"] = "";
          }
        })
        break;

      case "location":
        field.__value = value;
        for (var k = 0; k < field.config.locationOptions.length; k++) {
          field.config.locationOptions[k]["selected"] = "";
          if (field.config.locationOptions[k].code == field.__value) {
            field.config.locationOptions[k]["selected"] = "selected";
          }
        }
        break;
      case "hierarchy":
        field.__value = value;
        field._selected = Hierarchy._selected;
        break;
      case "date":
        if (value) {
          var date = prepareForClient(value.split("T")[0]);
          // alert("set value original: " + value + "set value: " + date)
          field.__value = date;
        }
        break;
      case "numeric":
      case "calculation":
        field.__value = value;
        if (value && field.config && field.config.allows_decimals == "true" && field.config.digits_precision && !isNaN(parseFloat(value))){
          var floatValue = parseFloat(value);
          field.__value = Number(floatValue.toFixed(parseInt(field.config.digits_precision)));
        }
        break;
      default:
        field.__value = value;
    }
  },

  generateCodeToIdSelectManyOption: function (field, values) {
    var codeIds = [];
    $.each(field.config.options, function (_, option) {
      if(values.indexOf(option.code) != -1)
        codeIds.push(option.id);
    });

    if (codeIds.length === 0)
      codeIds = values;
    return codeIds;
  },

  imageWithPath: function(imgFileName) {
    return App.imgPath() + imgFileName;
  },

  imageWithoutPath: function(imageFullPath) {
    return imageFullPath.replace(App.imgPath(), '')
  },

  getFieldValue: function(field_id){
    var $fieldUI = $("#" + field_id)
    if($fieldUI.length){
      return $fieldUI.val();
    }
    else{
      var layers = FieldController.layers;
      for(var i=0; i< layers.length; i++){
        var fields = layers[i].fields;
        for(var j=0; j< fields.length; j++){
          field = fields[j];
          if(field.idfield == field_id){
            return field.__value;
          }
        }
      }
      return 0;
    }
  },

  getSavedField: function(field_id){
    var layers = FieldController.layers;
    for(var i=0; i< layers.length; i++){
      var fields = layers[i].fields;
      for(var j=0; j< fields.length; j++){
        field = fields[j];
        if(field.idfield == field_id){
          return field;
        }
      }
    }
    return null;
  }

};
