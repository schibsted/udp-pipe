var config = module.exports;

config["My tests"] = {
    environment: "node",
    rootPath: "../",
    tests: [
        "all-tests.js"
    ],

    // buster-istanbul setup
    "buster-istanbul": {
        outputDirectory: "coverage",
        format: "lcov"
    },
    sources: [
        "lib/**/*.js",
        "plugins/**/*.js"
    ],
    extensions: [
        require('buster-istanbul')
    ]
};