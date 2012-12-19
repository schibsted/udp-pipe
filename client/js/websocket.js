// Quick and dirty javascript.
// Please do not copy this!

function updateStats(opt) {
    // var jstats = stats.collection;
    // var rps = jstats.http.requestsPerSecond;
    var stats = opt.stats;
    $('#rps_mean').text(stats.mean);
    $('#rps_count').text(stats.count);
    //    {"http":{"requestsPerSecond":{"mean":0,"count":0,"currentRate":0,"1MinuteRate":0,"5MinuteRate":0,"15MinuteRate":0}}}
    $('#rps_current_rate').text(stats.current_rate);
    $('#rps_max_rate').text(stats.max_rate);
    $('#rps_1MinuteRate').text(stats['1MinuteRate']);
    $('#rps_5MinuteRate').text(stats['5MinuteRate']);
    $('#rps_15MinuteRate').text(stats['15MinuteRate']);
    $('#mem_usage').text(stats.mem_usage);
    $('#uptime').text(stats.uptime);
    $('#last_log_lines').html(stats.last_log_lines.join(";\n"));
}


var updated = false;
var host = window.document.location.host.replace(/:.*/, '');
console.log('Trying to connect to ws://' + host + ':9999');
var ws = new WebSocket('ws://' + host + ':9999');
ws.onmessage = function (event) {
    updated = true;
    updateStats(JSON.parse(event.data));
    //console.log(event.data);
};



// Ajax fallback in case of emergency
function updateByAjax() {
    $.ajax({
    url: 'http://' + host + ':9998/stats',
    dataType: 'json',
    success: function (data, textStatus, jqXHR) {
        //var jstats = JSON.parse(data.request_pr_sec);
        var stats = data.stats;
        //var jstats = data.collection;
        //var rps = jstats.http.requestsPerSecond;
        $('#rps_mean').text(stats.mean);
        $('#rps_count').text(stats.count);
        //    {"http":{"requestsPerSecond":{"mean":0,"count":0,"currentRate":0,"1MinuteRate":0,"5MinuteRate":0,"15MinuteRate":0}}}
        $('#rps_current_rate').text(stats.current_rate);
        $('#rps_max_rate').text(stats.max_rate);
        $('#rps_1MinuteRate').text(stats['1MinuteRate']);
        $('#rps_5MinuteRate').text(stats['5MinuteRate']);
        $('#rps_15MinuteRate').text(stats['15MinuteRate']);
        $('#mem_usage').text(stats.mem_usage);
        $('#uptime').text(stats.uptime);
        $('#last_log_lines').html(stats.last_log_lines.join(";\n"));
    }
    });
    setTimeout(updateByAjax, 700);
}

// Wait, then check if things are updated by websockets. If not start ajax calls.
setTimeout(function () {
    console.log('Checking for updated: ' + updated);
    if (!updated) {
    console.log('Not updated. Starting ajax calls...');
    updateByAjax();
    }
}, 3000);