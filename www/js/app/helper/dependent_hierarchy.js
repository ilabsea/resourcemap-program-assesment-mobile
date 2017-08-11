DependentHierarchy = {

  children: function(parent_field_id){
    children = []
    for(var l=0; l<FieldController.layers.length; l++){
      layer = FieldController.layers[l];
      for(var f=0; f<layer.fields.length; f++){
        field = layer.fields[f];
        if(field.isEnableDependancyHierarchy && field.config['parent_hierarchy_field_id'] == parent_field_id){
          children.push(field)
        }
      }
    }
    return children;
  },

  dependentHierarchyItemList: function(hierarchyItems, value){
    for(var i=0; i<hierarchyItems.length; i++){
      if(hierarchyItems[i].id.toString() == value.toString()){
        return hierarchyItems[i].sub;
      }
    }

    for(var i=0; i<hierarchyItems.length; i++){
      subHierarchyItems = hierarchyItems[i].sub;
      if(subHierarchyItems != undefined && subHierarchyItems.length > 0){
        dependentList = DependentHierarchy.dependentHierarchyItemList(subHierarchyItems, value);
        if(dependentList != undefined && dependentList.length > 0){
          return dependentList;
        }
      }
    }

  },


  updateDependentHierarchyList: function(field_id, value) {
    children = DependentHierarchy.children(field_id);
    for(var i=0; i<children.length; i++){
      field = children[i];
      hierarchyItems = field.config.hierarchy;
      items = DependentHierarchy.dependentHierarchyItemList(hierarchyItems, value);

      if(items != undefined){ DependentHierarchy.buildOptionsForDependentHierarchyList(field.idfield, field.__value, items) };
    }
  },

  buildOptionsForDependentHierarchyList: function(fieldId, fieldValue, dependentHierarchyList){
    var $select = $('#'+fieldId);
    $select.empty().append("<option value=''>Option</option><option value=''>(no value)</option>");

    result = dependentHierarchyList.map(function(item){
      $select.append("<option value='" +item.id+ "'>"+item.name+"</option>");
      return {id: item.id, name: item.name};
    });

    $select.val(fieldValue);
    $select.selectmenu('refresh', true);
    field.config.dependentHierarchyList = result;
  },

  resetDecendentHierarchyList: function(currentFieldId){
    var layers = FieldController.layers;
    for(var i=0; i< layers.length; i++){
      var fields = layers[i].fields;
      for(var j=0; j< fields.length; j++){
        field = fields[j];
        if(field.isDependancyHierarchy){
          if(field.parentHierarchyFieldId.toString() == currentFieldId.toString()){
            $('#'+field.idfield).empty().selectmenu('refresh', true);
            field.__value = '';
            DependentHierarchy.resetDecendentHierarchyList(field.idfield);
            return;
          }
        }
      }
    }
  }
}
