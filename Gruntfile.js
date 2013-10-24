module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['server.js', 'lib/*.js'],
            options: {

            }
        },
        mochaTest: {
            test: {
                options: {
                    require: 'coffee-script'
                },
                src: ["test/*.coffee"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('acceptance', function () {
        grunt.config.set('mochaTest.test.src', "test_acceptance/*.coffee");
        grunt.task.run('mochaTest');
    });


}