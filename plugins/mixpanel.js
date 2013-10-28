var Mixpanel = function (options) {
    var that;
    var version = '1.0.0';
    var name = "mixpanel";
    var Mixpanel = require('mixpanel');

    function init(opt) {

    }

    function execute(message, callback) {
        if (message.event.mixpanel != undefined) {
            // Decode JSON.
            var mixpanel_data = JSON.parse(message.event.mixpanel);

            if (options.debug_token) {
                mixpanel_data.$token = options.debug_token;
            }
            var mixpanel = Mixpanel.init(mixpanel_data.$token);

            if (mixpanel_data.event != undefined) {
                // Remove time to be compatible with this module. If time is set it will use import endpoint instead of track.
                delete mixpanel_data.properties.time;
                mixpanel.track(mixpanel_data.event, mixpanel_data.properties, function(err) { if (err) throw err; });

            } else if (mixpanel_data.$distinct_id) {
                mixpanel.people.set(mixpanel_data.$distinct_id, mixpanel_data.$set, function(err) { if (err) throw err; });

            }
            // revenue
            // other stuff?

            var mixpanel_json = JSON.stringify(mixpanel_data);

            // Log Mixpanel data.
            console.log('mixpanel.js : '
                + mixpanel_json
            );
        }
        callback();
    }

    // Export functions and vars
    that = {
        version: version,
        init: init,
        execute: execute,
        name: name
    };

    // Call init when module is constructed.
    init(options);

    // Return object to make functions accessible.
    return that;
};

module.exports = Mixpanel;


// {
//     "name":"logserver",
//     "hostname":"isteins-MacBook-Pro.local",
//     "pid":23939,
//     "level":10,
//     "event":{
//         "name":"Profile updated",
//         "type":0,
//         "group":2,
//         "timestamp":1382958971,
//         "created":"2013-10-28 12:16:11",
//         "year":"2013",
//         "month":"10",
//         "week":"44",
//         "client_id":"4cf36fa274dea2117e030000",
//         "user_id":286679,
//         "merchant_id":47001,
//         "distinct_id":"Xlo2skXmv48wcXpotbxx",
//         "properties":{
//             "ip":"10.211.55.2",
//             "user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
//             "user_age":11,
//             "user_gender":"male",
//             "user_status":1,
//             "user_since":"2013-10-21 13:58:21",
//             "client_ids":["google","4d06920474dea26227070000","4cf36fa274dea2117e030000"],
//             "Changes":["name"],
//             "flow":"none",
//             "tracking_ref":"none",
//             "tracking_tag":"none"
//         },
//         "mixpanel":"{\"event\":\"SPiD - Profile updated\",\"properties\":{\"token\":\"1aabaaa5c10922561e5ff09d6129371c\",\"time\":1382958971,\"distinct_id\":\"Xlo2skXmv48wcXpotbxx\",\"mp_name_tag\":\"Xlo2skXmv48wcXpotbxx\",\"Version\":\"2.11.0\",\"Revision\":\"be81c14\",\"SPiD ID\":286679,\"Client\":\"VK\",\"Merchant\":\"Verdens Gang AS\",\"ip\":\"10.211.55.2\",\"User agent\":\"Mozilla\\/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/30.0.1599.101 Safari\\/537.36\",\"Age\":11,\"Gender\":\"male\",\"User status\":1,\"Registered\":\"2013-10-21 13:58:21\",\"Tracking ref\":\"none\",\"Tracking tag\":\"none\",\"Flow\":\"none\",\"Changes\":[\"name\"]}}"
//     },
//     "request_method":"POST",
//     "request_ip":"10.211.55.2",
//     "request_time":"2013-10-28CET12:16:11.000000",
//     "msg":"",
//     "time":"2013-10-28T11:16:11.635Z",
//     "v":0
// }


// {
//     "name":"logserver","hostname":"isteins-MacBook-Pro.local","pid":27692,"level":10,
//     "event":{
//          "name":"Add user traits",
//          "type":1,
//          "group":5,
//          "timestamp":1382960871,
//          "created":"2013-10-28 12:47:51",
//          "year":"2013",
//          "month":"10",
//          "week":"44",
//          "client_id":"4d06920474dea26227070000",
//          "user_id":286679,
//          "merchant_id":47000,
//          "distinct_id":"Xlo2skXmv48wcXpotbxx",
//          "properties":{
//              "ip":"10.211.55.2",
//              "user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
//              "user_age":11,
//              "user_gender":"male",
//              "user_status":1,
//              "user_since":"2013-10-21 13:58:21",
//              "client_ids":["google","4d06920474dea26227070000","4cf36fa274dea2117e030000"],
//              "created":"2013-10-21 13:58:21",
//              "locale":"nb_NO",
//              "birthday":"2002-02-02",
//              "last_authenticated":false,
//              "last_logged_in":"2013-10-23",
//              "home_zipcode":"undisclosed",
//              "home_city":"undisclosed",
//              "home_region":"undisclosed",
//              "home_country":"Norge",
//              "invoice_zipcode":"undisclosed",
//              "invoice_city":"undisclosed",
//              "invoice_region":"undisclosed",
//              "invoice_country":"undisclosed"
//          },
//          "mixpanel":"{\"$token\":\"890d008232333807619df7f1ee0fd56a\",\"$distinct_id\":\"Xlo2skXmv48wcXpotbxx\",\"$ip\":\"10.211.55.2\",\"$set\":{\"SPiD ID\":286679,\"Merchant\":\"Schibsted Payment AS\",\"Age\":11,\"Gender\":\"male\",\"User status\":1,\"Registered\":\"2013-10-21 13:58:21\",\"$created\":\"2013-10-21 13:58:21\",\"Locale\":\"nb_NO\",\"Birthday\":\"2002-02-02\",\"Last authenticated\":false,\"Last login\":\"2013-10-23\",\"SPiD Home Zip\":\"undisclosed\",\"SPiD Home City\":\"undisclosed\",\"SPiD Home Region\":\"undisclosed\",\"SPiD Home Country\":\"Norge\",\"SPiD Invoice Zip\":\"undisclosed\",\"SPiD Invoice City\":\"undisclosed\",\"SPiD Invoice Region\":\"undisclosed\",\"SPiD Invoice Country\":\"undisclosed\"}}"
//      },
//      "request_method":"POST",
//      "request_ip":"10.211.55.2",
//      "request_time":"2013-10-28CET12:47:51.000000",
//      "msg":"",
//      "time":"2013-10-28T11:47:50.452Z",
//      "v":0
// }
//
