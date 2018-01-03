var TextOperator = {
  '=': function() {
    return i18n.t('operator.equal_to');
  },
  '<': function(){
    return i18n.t('operator.less_than');
  },
  '>': function(){
    return i18n.t('operator.greater_than');
  },
  ">=": function(){
    return i18n.t('operator.greater_than_or_equal');
  },
  "<=": function(){
    return i18n.t('operator.less_than_or_equal');
  },
  "!=": function(){
    return i18n.t('operator.not_equal');
  }
}
