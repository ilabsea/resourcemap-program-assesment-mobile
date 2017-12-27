module.exports = function(grunt) {

  var sourceJsFiles = [
       "www/js/libs/jquery-1.11.0.min.js",
       "www/js/libs/jquery.validate.js",

       "www/js/app/event/mobile_init.js",
       "www/js/app/event/session.js",
       "www/js/app/event/registration.js",
       "www/js/app/event/collection.js",
       "www/js/app/event/site.js",
       "www/js/app/event/map.js",
       "www/js/app/event/hierarchy.js",
       "www/js/app/event/field.js",
       "www/js/app/event/server.js",
       "www/js/app/event/site_notification.js",

       "www/js/libs/jquery.mobile-1.4.5.js",
       "www/js/libs/tree.jquery.js",

       "www/js/libs/jquery.validation_form.js",

       "www/js/libs/i18next.js",
       "www/js/libs/handlebars.runtime-v4.0.5.js",

       "www/js/vendor/persistence/persistence.js",
       "www/js/vendor/persistence/persistence.sync.js",
       "www/js/vendor/persistence/persistence.store.sql.js",
       "www/js/vendor/persistence/persistence.store.sqlite_web.js",
       "www/js/vendor/persistence/persistence.migrations.js",
       "www/js/vendor/persistence/custom-persistence.js",


       "www/js/vendor/google_map.js",
       "www/js/vendor/translate.js",
       "www/js/vendor/node-uuid/uuid.js",

       "www/js/core/setting.js",
       "www/js/core/app.js",
       "www/js/core/app.migration.js",
       "www/js/core/app_db.js",
       "www/js/core/app_template.js",
       "www/js/core/app_data_store.js",
       "www/js/core/app_cache.js",
       "www/js/core/session.js",

       "www/js/app/controller/collection_controller.js",
       "www/js/app/controller/field_controller.js",
       "www/js/app/controller/site_controller.js",
       "www/js/app/controller/session_controller.js",
       "www/js/app/controller/my_membership_controller.js",
       "www/js/app/controller/site_notification_controller.js",
       "www/js/app/controller/threshold_controller.js",

       "www/js/app/model/user_session.js",
       "www/js/app/model/collection_model.js",
       "www/js/app/model/collection_offline.js",
       "www/js/app/model/field_model.js",
       "www/js/app/model/field_offline.js",
       "www/js/app/model/hierarchy.js",
       "www/js/app/model/site_model.js",
       "www/js/app/model/site_report.js",
       "www/js/app/model/view_binding.js",
       "www/js/app/model/user_offline.js",
       "www/js/app/model/user_model.js",
       "www/js/app/model/photo.js",
       "www/js/app/model/camera_model.js",
       "www/js/app/model/site_camera.js",
       "www/js/app/model/calculation.js",
       "www/js/app/model/site_offline.js",
       "www/js/app/model/my_membership_obj.js",
       "www/js/app/model/layer_membership_model.js",
       "www/js/app/model/layer_membership_offline.js",
       "www/js/app/model/membership_model.js",
       "www/js/app/model/membership_offline.js",
       "www/js/app/model/site_membership_model.js",
       "www/js/app/model/site_membership_offline.js",
       "www/js/app/model/site_notification_offline.js",
       "www/js/app/model/threshold_model.js",
       "www/js/app/model/threshold_offline.js",

       "www/js/app/helper/field_helper.js",
       "www/js/app/helper/spinner.js",
       "www/js/app/helper/date.js",
       "www/js/app/helper/custom_widget.js",
       "www/js/app/helper/handlebarhelper.js",
       "www/js/app/helper/skip_logic.js",
       "www/js/app/helper/field_helper_view.js",
       "www/js/app/helper/operator.js",
       "www/js/app/helper/dialog.js",
       "www/js/app/helper/site_helper.js",
       "www/js/app/helper/location.js",
       "www/js/app/helper/require_reload.js",
       "www/js/app/helper/digit_allowance.js",
       "www/js/app/helper/validation.js",
       "www/js/app/helper/custom_validation.js",
       "www/js/app/helper/dependent_hierarchy.js"
  ]

  var sourceCssFiles = [
    "www/css/index.css",
    "www/css/form_validation.css",
    "www/css/alert_style.css",
    "www/css/font_style.css",

    "www/css/libs/jquery.mobile-1.4.2.css",
    "www/css/libs/jqm1.4.2.css",
    "www/css/libs/jquery.mobile.icons.min.css",
    "www/css/libs/jqtree.css",
    "www/css/override.css"
  ]

  var templateFiles = [
      "www/js/app/template/language_menu.handlebars",
      "www/js/app/template/collection_list.handlebars",
      "www/js/app/template/collection_name.handlebars",
      "www/js/app/template/site_list.handlebars",
      "www/js/app/template/site_list_offline.handlebars",
      "www/js/app/template/site_list_offline_selectable.handlebars",
      "www/js/app/template/site_form.handlebars",
      "www/js/app/template/layer_sets.handlebars",
      "www/js/app/template/layer_field.handlebars",
      "www/js/app/template/field_location.handlebars",
      "www/js/app/template/field_no_field_pop_up.handlebars",
      "www/js/app/template/layer_menu.handlebars",
      "www/js/app/template/site_error_upload.handlebars",
      "www/js/app/template/site_notification_list.handlebars",
      "www/js/app/template/site_notifications.handlebars",
      "www/js/app/template/site_notification_list_partial.handlebars"
  ]

  var watchFiles = sourceCssFiles.concat(sourceJsFiles).concat(templateFiles)

  function outputPrecompiles(sources) {
    var outputFiles = []
    for(var i=0; i<sources.length; i++) {
      var outputFile = sources[i].replace('template', 'template_precompile') + ".js"
      outputFiles.push(outputFile)
    }
    return outputFiles
  }

  grunt.initConfig({
    uglify: {
      app: {
        options: {
          sourceMap: true,
          sourceMapName: 'www/js/dist/app.map'
        },
        files: {
          'www/js/dist/app.min.js': sourceJsFiles
        }
      },
      template: {
        options: {
          sourceMap: true,
          sourceMapName: 'www/js/dist/template.map'
        },
        files: {
          'www/js/dist/template.min.js': outputPrecompiles(templateFiles)
        }
      }
    },

    cssmin: {
      options: {
        sourceMap: true,
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'www/css/dist/app.min.css': sourceCssFiles
        }
      }
    },

    exec: {
      precompile: {
        cmd: function() {
          var commands = ["echo 'Precompiling template' \n"]
          var outputFiles =  outputPrecompiles(templateFiles)
          for(var i=0; i<templateFiles.length; i++) {
            var inputFile = templateFiles[i]
            var outputFile = outputFiles[i]
            var command = "handlebars " +  inputFile + " -f " + outputFile + " -k each -k if -k unless"
            command += "\n echo '" + command + "'"
            commands.push(command)
          }
          return commands.join("\n")
        }
      }
    },

    watch: {
      css: {
        files: sourceCssFiles ,
        tasks: ['cssmin'],
      },
      template: {
        files: templateFiles ,
        tasks: ['exec', 'uglify:template'],
      },
      js: {
        files: sourceJsFiles,
        tasks: ['uglify:app'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['cssmin', 'exec', 'uglify']);
  grunt.registerTask('default', ['watch']);

};
