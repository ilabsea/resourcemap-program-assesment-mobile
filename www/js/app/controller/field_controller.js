FieldController = {
  activeLayer: null,
  layers: [],
  submited: false,
  site: { properties: {}, files: {} },
  isOnline: true,

  siteReport: function(selected){
    if(selected == "page")
      SiteReport.page(FieldController.site)

    else if(selected == "pdf") {
      SiteReport.pdf(FieldController.site, function(){
        alert("System is generating PDF for your request, once it finishes we will send you a download link to your email");
      }, function(){
        alert("Failed to request PDF");
      })
    }
  },

  reset: function(){
    this.activeLayer = null
    this.layers = []
    this.submited = false
    this.site = { properties: {}, files: {} }
    this.isOnline = true
  },

  fieldIds: function() {
    var fieldIds = []
    $.each(this.layers, function(_, layer){
      $.each(layer.fields, function(_, field){
        fieldIds.push(field.idfield)
      })
    })
    return fieldIds;
  },

  findFieldById: function(idfield) {
    for(var i=0; i<this.layers.length; i++) {
      for(var j=0; j<this.layers[i].fields.length; j++){
        if(this.layers[i].fields[j].idfield == idfield)
          return this.layers[i].fields[j];
      }
    }
    return null;
  },

  displayLayerMenu: function(layerData){
    FieldHelperView.displayLayerMenu(layerData)
  },

  renderLayerSet: function() {
    var cloneLayers = this.layers.slice(0);
    var layerData = {field_collections: cloneLayers};
    FieldHelperView.display('layer_sets', $('#div_field_collection'), layerData);
  },

  layerCollapseFields: function($layerNode){
    if(FieldController.activeLayer){
      FieldController.storeOldLayerFields(FieldController.activeLayer);
      var layer = FieldController.findLayerById(FieldController.activeLayer.attr('data-id'));
      FieldController.validateLayer(layer);
    }
  },

  validateLayer: function(layer){
    layer.valid = true
    for(var i=0; i<layer.fields.length; i++){
      var validField = FieldController.validateField(layer.fields[i]);
      if(!validField){
        layer.valid = false
      }

    }
    var $layerNode = $("#collapsable_" + layer.id_wrapper)
    layer.valid ? $layerNode.removeClass("error") : $layerNode.addClass("error")
    return layer.valid;
  },


  validateField: function(field){
    if(field.editable == 'readonly'){ //skip validation if the field is readonly
      return true
    }
    if(field.kind == 'email' && field.__value) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re.test(field.__value)){
        field.invalid = 'error'
        return false;
      }
      else {
        field.invalid = ''
        return true;
      }
    }

    if(!this.activeLayer)
      field.disableState = SkipLogic.setDisableState(field);

    if(field.kind == 'numeric' && field.config && field.__value){
      if(field.config.range) {
        if(field.__value >= field.config.range.minimum && field.__value <= field.config.range.maximum ){
          field.invalid = ''
          return true;
        }
        else {
          field.invalid = 'error';
          field.invalidMessage = customRangeMessage(field.config.range.minimum, field.config.range.maximum);
          return false;
        }
      }

      if(field.config['field_validations']){
        customValidationResult = true;
        $.each(field.config['field_validations'], function(_, v){
          compareField = FieldController.findFieldById(v["field_id"][0]);
          customValidationResult = Operators[v["condition_type"]](parseFloat(field.__value), parseFloat(compareField.__value));
          if(customValidationResult == false){
            field.invalid = 'error';
            field.invalidMessage = customValidationMessage(v["condition_type"], field.name, compareField.name);
            return false
          }
        });
        if(customValidationResult == true)
          field.invalid = '';
        return customValidationResult;
      }
    }

    if((field.required == "" || field.disableState)){
      field.invalid = '';
      return true
    }

    if(!field.__value){
      field.invalid = 'error';
      return false;
    }

    field.invalid = ''
    return true;
  },

  validateThisField: function(element){
    var field = FieldController.findFieldById(element.id);
    if(field){
      if(field.is_mandatory){
        if(!element.value){
          $(element).addClass("error");
          showValidateMessage('#validation-save-site', i18n.t('validation.please_enter_required_field'));
          return;
        }
        else{
          $(element).removeClass("error");
        }
      }

      if(field.kind == 'numeric' && field.config && element.value){
        if(field.config.range) {
          if(element.value >= field.config.range.minimum && element.value <= field.config.range.maximum ){
            $(element).removeClass("error");
          }
          else {
            showValidateMessage('#validation-save-site', i18n.t('validation.value_must_be_in_the_range_of')
                      + field.config.range.minimum + '-' + field.config.range.maximum + ')');
            $(element).addClass("error");
            return;
          }
        }

        if(field.config['field_validations']){
          customValidationResult = true;
          $.each(field.config['field_validations'], function(_, v){
            FieldController.validateCustomValidate($("#" + v["field_id"][0]), v, $(element));
          });
        }
        if(field.config['compare_custom_validations']){
          $.each(field.config['compare_custom_validations'], function(_, f){
            FieldController.validateCustomValidate($("#" + f["field_id"]), f, $("#" + f["origin_field_id"]))
          });
        }
      }

      if(field.kind == 'email' && element.value) {
        FieldController.validateFormatEmail(element);
      }
    }
  },

  validateCustomValidate: function($compareElement, config, $oriElement ){
    fieldValue = parseFloat($compareElement.val());
    if(isNaN(fieldValue)){
      fieldValue = 0;
    }
    res = Operators[config["condition_type"]]($oriElement.val(), fieldValue);
    if(res == false){
      showValidateMessage('#validation-save-site', i18n.t('validation.value_must_be')
            + TextOperator[config["condition_type"]]() + $compareElement.attr('name'));
      $oriElement.addClass("error");
      return;
    }else{
      $oriElement.removeClass("error");
    }
  },

  validateFormatEmail: function(element){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(element.value) && element.value){
      $(element).addClass("error");
      showValidateMessage('#validation-save-site', i18n.t('validation.please_enter_valid_email'));
    }
    else {
      $(element).removeClass("error");
    }
  },

  validatePhotoField: function (fieldId) {
    var field = FieldController.findFieldById(fieldId);
    if(field.is_mandatory)
      if(!($("#" + fieldId).attr('src'))){
        showValidateMessage('#validation-save-site', i18n.t('validation.please_enter_required_field'));
        $("#" + fieldId).parents().addClass("error");
      }
      else
        $("#" + fieldId).parents().removeClass("error");
  },

  validateLayers: function(){
    this.closeLayer();
    var valid = true
    for(var i=0; i < this.layers.length; i++) {
      var layerValid = FieldController.validateLayer(this.layers[i]);
      if(layerValid == false)
        valid = false
    }
    return valid;
  },

  closeLayer: function() {
    if(this.activeLayer)
      this.activeLayer.collapsible( "collapse" )
  },

  storeOldLayerFields: function($layerNode){
    var layer = this.findLayerById($layerNode.attr('data-id'));

    $.each(layer.fields, function(i, field) {
      if( (field.kind !== 'hierarchy' && field.kind !== 'photo') ||
          (field.isDependancyHierarchy)
      ){
        var value = FieldController.getFieldValueFromUI(field.idfield)
        FieldHelper.setFieldValue(field, value, this.isOnline);
      }
    })
  },

  layerExpandFields: function($layerNode) {
    if(this.activeLayer) {
      var layerChanged = $layerNode.attr('data-id') != this.activeLayer.attr('data-id')
      if(layerChanged) {
        this.removeLayerContent(this.activeLayer);
        this.renderLayerNode($layerNode)
      }
      else{
        var layer = this.findLayerById($layerNode.attr('data-id'))
        $.each(layer.fields, function(_, field){
          var $fieldUI = $("#" + field.idfield)
          if(field.kind == "photo" || field.kind == 'select_one' || field.kind == 'select_many' || field.isDependancyHierarchy || field.kind == 'location')
            field.invalid ?  $fieldUI.parent().addClass("error") : $fieldUI.parent().removeClass("error")
          else
            field.invalid ?  $fieldUI.addClass("error") : $fieldUI.removeClass("error")
        })
      }
    }
    else
      this.renderLayerNode($layerNode);
    this.calculateSkipLogic();
    this.calculateDependentHierarchyField();
    this.calculateCalculationField();
  },

  calculateDependentHierarchyField: function(){
    var layers = FieldController.layers;
    for(var i=0; i< layers.length; i++){
      var fields = layers[i].fields;
      for(var j=0; j< fields.length; j++){
        field = fields[j];
        if(field.isDependancyHierarchy){
          if(field.parentHierarchyFieldId == ''){
            $('#'+field.idfield).val(field.__value).selectmenu('refresh', true);
          }
          DependentHierarchy.updateDependentHierarchyList(field.idfield, field.__value);
        }
      }
    }
  },

  calculateCalculationField: function(){
    var layers = FieldController.layers;
    for(var i=0; i< layers.length; i++){
      var fields = layers[i].fields;
      for(var j=0; j< fields.length; j++){
        field = fields[j];
        var val = field.__value;
        if(field.kind == "calculation"){
          Calculation.updateField(field.idfield);
        }
      }
    }
  },

  calculateSkipLogic: function(){
    var layers = FieldController.layers;
    for(var i=0; i< layers.length; i++){
      var fields = layers[i].fields;
      for(var j=0; j< fields.length; j++){
        field = fields[j];
        var val = field.__value;
        if(field.kind == "numeric"){
          SkipLogic.processSkipLogic(field.idfield, parseInt(val));
        }
        if(field.kind == "select_many"){
          SkipLogic.processSkipLogic(field.idfield);
        }
        if(field.kind == "yes_no"){
          SkipLogic.processSkipLogic(field.idfield, val);
        }
        if(field.kind == "select_one"){
          codeList = FieldController.findOptionCodeByFieldOptionId([val], field.config.options);
          SkipLogic.processSkipLogic(field.idfield, codeList[0]);
        }
      }
    }
  },

  removeLayerContent: function($layerNode){
    $layerNode.find(".ui-collapsible-content").html("")
  },

  renderLayerNode: function($layerNode) {
    var layerId = $layerNode.attr('data-id')
    var $layerNodeBody = $layerNode.find(".ui-collapsible-content")
    var layer = FieldController.findLayerById(layerId);

    this.renderLayer(layer, $layerNodeBody);
    this.activeLayer = $layerNode;
  },

  renderLayer: function(layer, $layerNodeContent){
    var content = App.Template.process('layer_field', {fields: layer.fields});
    $layerNodeContent.html(content);

    $.each(layer.fields, function(_, field){
      if(field.isHierarchy && !field.isEnableDependancyHierarchy)
        Hierarchy.create(field.config, field.__value, field.idfield);

      if (field.custom_widgeted)
        CustomWidget.setInputNodeId(field);

      if (field.kind == "calculation" && field.config.dependent_fields) {
        $.each(field.config.dependent_fields, function (_, dependentField) {
          var $dependentField = $("#" + dependentField.id)
          $dependentField.addClass('calculation');
          var parentIds = $dependentField.attr('data-parent-ids') || ""
          parentIds = parentIds.split(',')
          parentIds.push(field.idfield)
          $dependentField.attr('data-parent-ids', parentIds.join(","))
        })
      }

      if(field.is_enable_custom_validation && field.kind == 'numeric'){
        var $fieldUI = $("#" + field.idfield);
        $fieldUI.addClass('customValidation');
        if(field.config['field_validations']){
          $.each(field.config['field_validations'], function(_, v){
            compareField = FieldController.findFieldById(v["field_id"][0]);
            $("#" + v["field_id"][0]).addClass('customValidation');
            FieldHelper.buildCompareFieldConfigOfCustomValidation(field, v['condition_type'], compareField);
          });
        }
      }

      if(field.kind == "photo" || field.kind == 'select_one' || field.kind == 'select_many' || field.kind == 'location'){
        var $fieldUI = $("#" + field.idfield);
        field.invalid ?  $fieldUI.parent().addClass("error") : $fieldUI.parent().removeClass("error")
      }


      DigitAllowance.prepareEventListenerOnKeyPress();
      // Readonly field
      var site = FieldController.site
      MyMembershipController.layerMembership(site, layer.id_wrapper, function(can_entry){
        if (!can_entry) {
          FieldHelperView.disableInputField();
        }
      });
      $layerNodeContent.enhanceWithin();

      if(field.kind == "photo" || field.kind == 'select_one' || field.kind == 'select_many' || field.isDependancyHierarchy){
        var $fieldUI = $("#" + field.idfield);
        field.invalid ?  $fieldUI.parent().addClass("error") : $fieldUI.parent().removeClass("error");
        field.matchAlert ?  $fieldUI.parent().addClass("info") : $fieldUI.parent().removeClass("info");
      }

      if(field.slider){
        field.matchAlert ?  $('#wrapper_' + field.idfield).find('.ui-slider').addClass("info") : $('#wrapper_' + field.idfield).find('.ui-slider').removeClass("info");
      }
      if(field.custom_widgeted && field.kind == 'numeric'){
        var $fieldUI = $("#" + field.idfield);
        $fieldUI.addClass('customValidation');
      }
    })
  },

  findLayerById: function(layerId) {
    for(var i=0; i<this.layers.length; i++){
      if(this.layers[i].id_wrapper == layerId)
        return this.layers[i];
    }
  },

  findLayerWrapperOfFieldId: function (fieldId) {
    for(var i=0 ; i<this.layers.length ; i++) {
      var layer = this.layers[i];
      for(var j=0; j<layer.fields.length; j++) {
        if(layer.fields[j].idfield == fieldId ) {
          var $layerRef = $("#site-layers-wrapper div.ui-collapsible");
          var $layerNode = $($layerRef.get(i))
          return $layerNode;
        }
      }
    }
  },

  layerDirty: function() {
    return FieldController.activeLayer;
  },

  buildLayerFields: function(layer, callback) {
    FieldHelper.buildLayerFields(layer, function(newLayer){
      callback(newLayer);
    });
  },

  renderNewSiteForm: function () {
    this.reset();
    this.site = { properties: {}, files: {} };
    var self = this;
    var cId = CollectionController.id;

    FieldOffline.fetchByCollectionId(cId, function (layerOfflines) {
      if(layerOfflines.length == 0)
        FieldHelperView.displayNoFields("field_no_field_pop_up", $('#page-pop-up-no-fields'));
      Location.prepareLocation();
      var layerIndex = 0
      layerOfflines.forEach(function (layerOffline) {
        FieldHelper.buildLayerFields(layerOffline, function(newLayer){
          self.layers.push(newLayer);
          if(layerIndex == (layerOfflines.length - 1)){
            FieldController.displayLayerMenu({field_collections: self.layers.slice(0)});
            FieldController.renderLayerSet();
            ViewBinding.setBusy(false);
          }
          layerIndex = layerIndex + 1
        });
      });
    });
  },

  errorFetchingField: function(error) {
    if (!App.isOnline())
      FieldController.renderUpdateOffline();
  },

  renderUpdateFormOfSiteNotification: function(){
    var self = this;
    self.layers = [];
    var cId = CollectionController.id;
    MyMembershipController.fetchMembershipByCollectionId(cId);

    FieldModel.fetch(cId, function (layers) {
      var layerIndex = 0;
      $.each(layers, function (_, layer) {
        FieldHelper.buildLayerFields(layer, function(newLayer){
          self.layers.push(newLayer);
          if(layerIndex == (layers.length - 1)){
            FieldController.displayLayerMenu({field_collections: self.layers.slice(0)});
            FieldController.renderLayerSet();
            ViewBinding.setBusy(false);
          }
          layerIndex = layerIndex + 1;
        }, true);
      });
    }, function(){
      alert('problem downloading fields');
    });

    LayerMembershipModel.fetchMembership(cId, function (memberships){
      uId = UserSession.getUser().id;
      LayerMembershipOffline.deleteByCollectionId(cId, function(){
        LayerMembershipOffline.add(uId, memberships);
      });
    });
  },

  //use for both online and offline site
  renderUpdateForm: function(site, isOnline){
    this.reset();
    this.isOnline = isOnline
    this.site = site;
    var self = this;

    var cId = CollectionController.id;
    self.layers = []
    if(SiteController.currentPage == '#page-notification'){
      if(App.isOnline()){
        ViewBinding.setBusy(true);

        FieldController.renderUpdateFormOfSiteNotification();

      }else {
        alert(i18n.t("global.no_internet_connection"));
      }
    }else{
      FieldOffline.fetchByCollectionId(cId, function (layerOfflines) {
        var layerIndex = 0;
        $.each(layerOfflines, function (_, layerOffline) {
          FieldHelper.buildLayerFields(layerOffline, function(newLayer){
            self.layers.push(newLayer);
            if(layerIndex == (layerOfflines.length - 1)){
              FieldController.displayLayerMenu({field_collections: self.layers.slice(0)});
              FieldController.renderLayerSet();
            }
            layerIndex = layerIndex + 1;
          }, isOnline);
        });

      });
    }
  },

  getFieldValueFromUI: function(fieldId) {
    var $field = $('#' + fieldId);
    if($field.length == 0)
      return '';

    if ($field[0].tagName.toLowerCase() == 'img') {
      if ($("#wrapper_" + fieldId).attr("class") != 'ui-disabled skip-logic-over-img')
        return $field.attr('src')
      else
        return '';
    }

    if ($field.attr("type") == 'date')
      return $field.val();

    var value = $field.hasClass("tree") ? $field.tree('getSelectedNode').id : $field.val()
    return  value == null ? "" : value;
  },

  synForCurrentCollection: function (layers) {
    var cId = CollectionController.id;
    FieldOffline.fetchByCollectionId(cId, function (fields) {
      userId = UserSession.getUser().id;
      FieldOffline.remove(fields);
      FieldOffline.add(layers, cId, userId);
    });
  },

  updateLocationField: function (lat, lng) {
    $.each(this.layers, function(_, layer){
      $.each(layer.fields, function(_, field){
        if(field.kind == "location") {
          var config = field.config;
          var locationOptions = Location.getLocations(lat, lng, config);
          if (locationOptions)
            config.locationOptions = locationOptions;

          var $fieldUI = $("#" + field.idfield);
          FieldHelperView.displayLocationField("field_location", $fieldUI, {config: config});
        }
      })
    })
  },

  params: function(){
    var properties = {};
    var files = {}
    $.each(this.layers, function(_, layer) {
      $.each(layer.fields, function(_, field) {
        if(field.__value) {

          if(field.kind == 'photo') {
            if(field.__filename){
              properties[field.idfield] = field.__filename
              files[field.__filename] = SiteCamera.dataWithoutMimeType(field.__value)
            }
            else
              properties[field.idfield] = FieldHelper.imageWithoutPath(field.__value)
          }
          else if(field.kind == 'date'){
            properties[field.idfield] = prepareForServer(field.__value)
          }
          else
            properties[field.idfield] = field.__value
        }
        else
          properties[field.idfield] = field.__value
      })
    })
   return {properties: properties, files: files}
  },

  downloadForm: function () {
    var cId = CollectionController.id;
    var self = this;
    var currentPageId = $.mobile.activePage.attr('id');

    if(App.isOnline()){
      ViewBinding.setBusy(true);
      FieldModel.fetch(cId, function (layers) {
        FieldController.synForCurrentCollection(layers);
        setTimeout(function () {
          ViewBinding.setBusy(false);
          SiteController.resetMenu();
        }, 500);

      }, FieldController.errorFetchingField);

      LayerMembershipModel.fetchMembership(cId, function (memberships){
        uId = UserSession.getUser().id;
        LayerMembershipOffline.deleteByCollectionId(cId, function(){
          LayerMembershipOffline.add(uId, memberships);
        });
      });

    }else {
      alert(i18n.t("global.no_internet_connection"));
      SiteController.resetMenu();
    }
    return false;
  },

  findOptionCodeByFieldOptionId: function(ids, all_options){
    var list_codes = new Array();
    for(var i=0; i<ids.length; i++){
      var id = ids[i];
      for(var j=0; j<all_options.length; j++){
        option = all_options[j];
        if(option.id == id){
          list_codes.push(option.code);
        }
      }
    }
    return list_codes;
  }
};
