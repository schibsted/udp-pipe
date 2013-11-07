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
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js'
                }
            },
            acceptance: {
                options: {
                    file: 'server.js',
                    args: ['-c', './config/config-acceptance.js']
                }
            }
        }/*,
        concurrent: {
            acceptanceTest: {
                tasks: ['nodemon', 'mochaTest'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }*/
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');
    //grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('acceptance', function () {
        grunt.config.set('mochaTest.test.src', "test_acceptance/*.coffee");
        grunt.task.run('mochaTest');
    });
    grunt.registerTask('run', function() {
        grunt.task.run('nodemon');
    });
    grunt.registerTask('runAcceptance', function() {
        grunt.task.run('nodemon:acceptance');
    })

}