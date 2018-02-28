App = {
  DB_SIZE: 5 * 1024 * 1024,
  DB_NAME: 'resourcemap_db',
  VERSION: "1.3",
  DEBUG: RmSetting.DEBUG,
  interval: 900000,
  userId: "",
  dbConnected: false,
  defaultPage: "#page-collection-list",
  dialogPageId: '',
  endPoint: function(){ return RmSetting.endPoint() },
  imgPath: function(){ return RmSetting.url() + "/photo_field/" },
  authUrl: function(){ return RmSetting.endPoint() + "/users/sign_in.json" },
  listCollection: function(){ return RmSetting.endPoint() + "/collections?auth_token=" },
  urlSignup: function(){ return RmSetting.endPoint() + "/users.json" },
  urlLogout: function(){ return RmSetting.endPoint() + "/users/sign_out.json?auth_token=" },
  urlField: function(){ return RmSetting.endPoint() + "/v1/collections/" },
  urlSite: function(){ return RmSetting.endPoint() + "/v1/collections/" },
  urlSiteThreshold: function(){ return RmSetting.endPoint() + "/v1/sites/alerted_to_reporters" },
  log: function (text, data) {
    if (App.DEBUG)
      console.log(text, data);
  },
  initialize: function () {
    this.bindEvents();
    this.setUpConfig();
    //for mobile web testing without platform
    if(typeof cordova == "undefined" )
      App.onDeviceReady();
  },
  setUpConfig: function(){
    persistence.debug = App.DEBUG;
    jQuery.validator.setDefaults({
      debug: true,
      success: "valid",
      ignore: ":hidden:not(select)"
    });

  },
  resetDb: function () {
    if(App.dbConnected) {
      persistence.reset();
      persistence.schemaSync();
    }
    else {
      App.log("Db connection is not ready");
    }
  },
  resetCache: function () {
    App.Cache.clearAll();
  },
  bindEvents: function () {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  validateDbConnection: function(callbackAction) {
    if(App.dbConnected)
      callbackAction()
    else {
      App.connectDB(App.DB_NAME, App.DB_SIZE);
      callbackAction();
    }
  },

  changeServerUrl: function(url){
    App.resetDb();
    App.DataStore.set("endPoint", url);
    App.redirectTo("#page-login");
  },

  onDeviceReady: function () {
    App.connectDB(App.DB_NAME, App.DB_SIZE);

    document.addEventListener("offline", function() {
      SiteController.onlineStatus(false);
    }, false);
    document.addEventListener("online",  function(){
      SiteController.onlineStatus(true)
    }, false);

    document.addEventListener("backbutton", function(){
      App.listenBackButton();
    }, false);

  },

  listenBackButton: function(){
    var activePageId = $.mobile.activePage.attr('id');
    var isPopup = location.href.indexOf('ui-state=dialog');
    if(App.dialogPageId){
      Dialog.closeDialog(App.dialogPageId);
    } else if (isPopup != -1){
      navigator.app.backHistory();
    } else {
      switch (activePageId) {
        case 'page-login':
        case 'page-collection-list': {
          navigator.app.exitApp();
          break;
        }
        case 'page-site-list-all':
        case 'page-site-list':
        case 'page-notification': {
          $.mobile.changePage('#page-collection-list');
          break;
        }
        case 'page-map': {
          $.mobile.changePage('#page-save-site');
          break;
        }
        case 'page-save-site': {
          $.mobile.changePage(SiteController.currentPage)
          break;
        }
        case 'page-change-server': {
          $.mobile.changePage('#page-login');
          break;
        }
        default: {
          navigator.app.backHistory();
        }
      }
    }
  },

  emptyHTML: function () {
    $(".clearPreviousDisplay").html("");
  },
  redirectTo: function (nextPage, options) {
    $.mobile.pageContainer.pagecontainer('change', nextPage, options);
  },
  isOnline: function () {
    var online = false;
    if (navigator.connection) {
      online = (navigator.connection.type !== Connection.NONE);
      return online;
    }
    online = navigator.onLine;
    return online;
  },

  allBooleanTrue: function (arr) {
    for (var i in arr)
      if (!arr[i])
        return false;
    return true;
  },

  connectDB: function(dbName, size) {
    if (window.openDatabase || window.sqlitePlugin)
      persistence.store.websql.config(persistence, dbName, 'database', size);
    else
      alert("Your device must support a database connection");

    App.defineSchema()
    persistence.schemaSync(function(){
      migrate();
    });
    App.dbConnected = true
  },
  defineSchema: function(){
    Collection = persistence.define('collections', {
      idcollection: "INT",
      name: "TEXT",
      description: "TEXT",
      user_id: "INT"
    });

    User = persistence.define('users', {
      iduser: "INT",
      email: "TEXT",
      password: "TEXT",
      auth_token: "TEXT"
    });

    Site = persistence.define('sites', {
      idsite: "INT",
      name: "TEXT",
      lat: "INT",
      lng: "INT",
      start_entry_date: "TEXT",
      end_entry_date: "TEXT",
      created_at: "DATE",
      collection_id: "INT",
      collection_name: "TEXT",
      user_id: "INT",
      device_id: "TEXT",
      properties: "TEXT",
      files: "TEXT"
    });

    Field = persistence.define('fields', {
      collection_id: "INT",
      user_id: "INT",
      name_wrapper: "TEXT",
      id_wrapper: "INT",
      fields: "JSON"
    });

    LayerMembership = persistence.define('layer_memberships', {
      collection_id: "INT",
      user_id: "INT",
      user_offline_id: "INT",
      layer_id: "INT",
      read: "BOOL",
      write: "BOOL"
    });

    Membership = persistence.define('memberships', {
      collection_id: "INT",
      user_id: "INT",
      user_email: "TEXT",
      admin: "BOOL",
      can_edit_other: "BOOL",
      can_view_other: "BOOL"
    });

    SiteMembership = persistence.define('site_memberships', {
      user_id: "INT",
      collection_id: "INT",
      site_id: "INT",
      none: "BOOL",
      read: "BOOL",
      write: "BOOL"
    });

    SiteNotification = persistence.define('site_notifications', {
      collection_id: "INT",
      site_id: "INT",
      user_id_offline: "TEXT",
      site_name: "TEXT",
      properties: "JSON",
      conditions: "JSON",
      alert_id: "INT",
      created_at: "TEXT",
      updated_at: "TEXT",
      viewed: "BOOL",
      seen: "BOOL" // view detail of the site alert
    });

    CacheData = persistence.define('cache_datas', {
      key: "TEXT",
      value: "TEXT",
      user: "TEXT"
    });
  }
};

App.initialize();
