persistence.defineMigration(1, {
  up: function() {
    this.createTable('layer_memberships', function(t){
      t.integer('collection_id');
      t.integer('user_id');
      t.integer('user_offline_id');
      t.integer('layer_id');
      t.boolean('read');
      t.boolean('write');
    });
  },
  down: function() {
    this.dropTable('layer_memberships');
  }
});

persistence.defineMigration(2, {
  up: function() {
    this.createTable('memberships', function(t){
      t.integer('collection_id');
      t.integer('user_id');
      t.text('user_email');
      t.boolean('admin');
      t.boolean('can_edit_other');
      t.boolean('can_view_other');
    });
  },
  down: function() {
    this.dropTable('memberships');
  }
});

persistence.defineMigration(3, {
  up: function() {
    this.createTable('site_memberships', function(t){
      t.integer('user_id');
      t.integer('collection_id');
      t.integer('site_id');
      t.boolean('none');
      t.boolean('read');
      t.boolean('write');
    });
  },
  down: function() {
    this.dropTable('site_memberships');
  }
});

persistence.defineMigration(4, {
  up: function() {
    this.addColumn('users', 'iduser', 'INT');
  }
});

persistence.defineMigration(5, {
  up: function() {
    this.createTable('site_notifications', function(t){
      t.integer('collection_id');
      t.integer('site_id');
      t.text('user_id_offline');
      t.text('site_name');
      t.json('properties');
      t.json('conditions');
      t.integer('alert_id');
      t.text('created_at');
      t.text('updated_at');
      t.boolean('viewed');
      t.boolean('seen'); // view detail of the site alert
    });
  },
  down: function() {
    this.dropTable('site_notifications');
  }
});

persistence.defineMigration(6, {
  up: function() {
    this.addColumn('site_notifications', 'message_notification', 'TEXT');
  }
});

function migrate(){
    persistence.migrations.init( function(){
        persistence.migrate( function(){
            console.log('migration complete!');
        } );
    });
}
