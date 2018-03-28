persistence.defineMigration(1, {
  up: function() {
    this.executeSql('CREATE TABLE IF NOT EXISTS layer_memberships (id VARCHAR(32) PRIMARY KEY, collection_id INT, user_id INT, user_offline_id INT, layer_id INT,  read BOOL, write BOOL)');
  },
  down: function() {
    this.dropTable('layer_memberships');
  }
});

persistence.defineMigration(2, {
  up: function() {
    this.executeSql('CREATE TABLE IF NOT EXISTS memberships (id VARCHAR(32) PRIMARY KEY, collection_id INT, user_id INT, user_email TEXT, admin BOOL, can_edit_other BOOL, can_view_other BOOL)');
  },
  down: function() {
    this.dropTable('memberships');
  }
});

persistence.defineMigration(3, {
  up: function() {
    this.executeSql('CREATE TABLE IF NOT EXISTS site_memberships (id VARCHAR(32) PRIMARY KEY, collection_id INT, user_id INT, site_id INT, none BOOL, read BOOL, write BOOL)');
  },
  down: function() {
    this.dropTable('site_memberships');
  }
});

persistence.defineMigration(4, {
  up: function() {
    this.addColumn('users', 'iduser', 'INT');
  },
  down: function() {
    this.removeColumn('iduser');
  }
});

persistence.defineMigration(5, {
  up: function() {
    this.executeSql('CREATE TABLE IF NOT EXISTS site_memberships (id VARCHAR(32) PRIMARY KEY, collection_id INT, site_id INT, user_id_offline TEXT, site_name TEXT, properties JSON, conditions JSON, alert_id INT,  created_at TEXT, updated_at TEXT, viewed BOOL, seen BOOL)');
  },
  down: function() {
    this.dropTable('site_notifications');
  }
});

persistence.defineMigration(6, {
  up: function() {
    this.addColumn('site_notifications', 'message_notification', 'TEXT');
  },
  down: function() {
    this.removeColumn('message_notification');
  }
});

function migrate(){
    persistence.migrations.init( function(){
      persistence.migrate( function(){
          console.log('migration complete!' );
      } );
    });
}
