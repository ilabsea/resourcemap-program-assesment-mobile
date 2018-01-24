App = App || {};
App.Session = {
  setUser: function(user){
    App.DataStore.set("currentUser", JSON.stringify(user));
    App.DataStore.set("isMigratedUserId", true); //re-enforce user to re-login to migrate user id for hot-fix site permission
  },

  getUser: function(){
    var u = App.DataStore.get("currentUser");
    if (u)
      return JSON.parse(u);
    return {};
  },

  clearUser: function(){
    App.DataStore.remove("currentUser")
  },

  getAuthToken: function() {
    var user = App.Session.getUser()
    if(user)
     return user['auth_token']
    else
      return false
  },
  create: function(user) {
    var currentUser = {id: user.id, password: user.password, email: user.email};
    App.DataStore.set("currentUser", JSON.stringify(currentUser));
  },

  resetState: function() {
    App.DataStore.remove("currentUser");
    App.DataStore.remove("cId");
    App.DataStore.remove("collectionName");
    App.DataStore.remove("sId");
  }
};
