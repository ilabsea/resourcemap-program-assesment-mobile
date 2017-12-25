$(document).on("mobileinit", function() {

  $(document).delegate('#page-collection-list', 'pagebeforeshow', function() {
    App.emptyHTML();
    setTimeout(function(){
      App.validateDbConnection(function() {
        SiteNotificationController.renderNotificationMessage();
        CollectionController.renderList();
        SiteNotificationController.reset();
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
