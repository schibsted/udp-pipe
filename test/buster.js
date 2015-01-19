var config = module.exports;

config["My tests"] = {
    environment: "node",
    rootPath: "../",
    tests: [
        "test/**/*-test.js"
    ],

    // buster-istanbul setup
    "buster-istanbul": {
        outputDirectory: "coverage",
        format: "lcov"
    },
    sources: [
        "server.js",
        "lib/**/*.js",
        "plugins/**/*.js"
    ],
    extensions: [
        require('buster-istanbul')
    ]
};