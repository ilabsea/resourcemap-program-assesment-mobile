$(document).on("mobileinit", function() {

  $(document).delegate('#page-collection-list', 'pagebeforeshow', function() {
    App.emptyHTML();
    setTimeout(function(){
      App.validateDbConnection(function() {
        NotificationController.renderNotificationMessage();
        CollectionController.renderList();
        NotificationController.reset();
      });
    }, 500);
  });


  $(document).delegate('#page-collection-list ul#collection-list li', 'click', function(event) {
    //db should be ready before page rendering
      var li = this;
      var id = li.getAttribute("data-id");
      var name = li.getAttribute("data-name");

      CollectionController.id = id;
      CollectionController.name = name;
      CollectionController.displayName({name: name});

  });

});
