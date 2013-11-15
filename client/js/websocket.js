// Quick and dirty javascript.
// Please do not copy this!
Number.prototype.formatNum = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

function updateStats(opt) {
    var stats = opt.stats;
    $('#rps_mean').text(stats.mean.formatNum(1,' ',','));
    $('#rps_count').text(stats.count.formatNum(0,' ',','));
    $('#rps_current_rate').text(stats.current_rate.formatNum(1,' ',','));
    $('#rps_max_rate').text(stats.max_rate.formatNum(1,' ',','));
    $('#rps_1MinuteRate').text(stats['1MinuteRate'].formatNum(1,' ',','));
    $('#rps_5MinuteRate').text(stats['5MinuteRate'].formatNum(1,' ',','));
    $('#rps_15MinuteRate').text(stats['15MinuteRate'].formatNum(1,' ',','));
    $('#mem_usage').text(stats.mem_usage);
    $('#uptime').text(stats.uptime.formatNum(0,' ',','));
    $('#avg_execution_time').text(stats.avg_execution_time.formatNum(4,' ',','));
    $('#max_execution_time').text(stats.max_execution_time.formatNum(4,' ',','));
    $('#min_execution_time').text(stats.min_execution_time.formatNum(4,' ',','));
    $('#total_execution_time').text(stats.total_execution_time.formatNum(1,' ',','));
    $('#last_log_lines').html(stats.last_log_lines.join(";\n"));

    if (Object.prototype.toString.call( stats.plugins ) === '[object Object]') {
        $.each( stats.plugins, function( key, value ) {
            try {
                if ($('#' + key + '_total_execution_cnt').length == 0) {
                    $('#plugins_name').append('<th class="num">' + key + '</th>');
                    $('#plugins_count').append('<td class="num"><span id="' + key + '_total_execution_cnt" class="label label-info"></span></td>');
                    $('#plugins_run_time').append('<td class="num"><span id="' + key + '_run_time"> </span> <span class="text-muted">s</span></td>');
                    $('#plugins_max_rate').append('<td class="num"><span id="' + key + '_max_rate"> </span> <span class="text-muted">req/s</span></td>');
                    $('#plugins_mean').append('<td class="num"><span id="' + key + '_mean"> </span> <span class="text-muted">req/s</span></td>');
                    $('#plugins_current_rate').append('<td class="num"><span class="label label-info"><span id="' + key + '_current_rate"></span> req/s</span></td>');
                    $('#plugins_one_min_rate').append('<td class="num"><span id="' + key + '_one_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                    $('#plugins_five_min_rate').append('<td class="num"><span id="' + key + '_five_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                    $('#plugins_fifteen_min_rate').append('<td class="num"><span id="' + key + '_fifteen_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                    $('#plugins_avg_execution_time').append('<td class="num"><span class="label label-info"><span id="' + key + '_avg_execution_time"></span> s</span></td>');
                    $('#plugins_max_execution_time').append('<td class="num"><span id="' + key + '_max_execution_time"> </span> <span class="text-muted">s</span></td>');
                    $('#plugins_min_execution_time').append('<td class="num"><span id="' + key + '_min_execution_time"> </span> <span class="text-muted">s</span></td>');
                    $('#plugins_total_execution_time').append('<td class="num"><span id="' + key + '_total_execution_time"> </span> <span class="text-muted">s</span></td>');
                }
            } catch (error) {
                console.log(error);
            }
            if ($('#' + key + '_total_execution_cnt').length > 0) {
                $('#' + key + '_total_execution_cnt').text(value.count.formatNum(0,' ',','));
                $('#' + key + '_mean').text(value.mean.formatNum(1,' ',','));
                $('#' + key + '_max_rate').text(value.max_rate.formatNum(1,' ',','));
                $('#' + key + '_run_time').text(value.run_time.formatNum(0,' ',','));
                $('#' + key + '_avg_execution_time').text(value.avg_execution_time.formatNum(4,' ',','));
                $('#' + key + '_max_execution_time').text(value.max_execution_time.formatNum(4,' ',','));
                $('#' + key + '_min_execution_time').text(value.min_execution_time.formatNum(4,' ',','));
                $('#' + key + '_total_execution_time').text(value.total_execution_time.formatNum(1,' ',','));
                $('#' + key + '_current_rate').text(value.current_rate.formatNum(1,' ',','));
                $('#' + key + '_one_minute_rate').text(value.one_minute_rate.formatNum(1,' ',','));
                $('#' + key + '_five_minute_rate').text(value.five_minute_rate.formatNum(1,' ',','));
                $('#' + key + '_fifteen_minute_rate').text(value.fifteen_minute_rate.formatNum(1,' ',','));
            }
        });
    }
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

            if (Object.prototype.toString.call( stats.plugins ) === '[object Object]') {
                $.each( stats.plugins, function( key, value ) {
                    if (key !== undefined) {
                        if ($('#' + key).length == 0) {
                            $('#plugins').append(
                                '    <tr id="' + key + '">' +
                                    '        <th>' + key + '</th>' +
                                    '        <td class="num"><span class="total_execution_cnt"></span></td>' +
                                    '        <td class="num"><span class="run_time"></span>s</td>' +
                                    '        <td class="num"><span class="avg_execution_time"></span>s</td>' +
                                    '        <td class="num"><span class="max_execution_time"></span>s</td>' +
                                    '        <td class="num"><span class="min_execution_time"></span>s</td>' +
                                    '        <td class="num"><span class="total_execution_time"></span>s</td>' +
                                    '    </tr>'
                            );
                        }
                    }
                    if ($('#' + key).length > 0) {
                        $('#' + key + ' .total_execution_cnt').text(value.cnt.formatNum(0,' ',','));
                        $('#' + key + ' .run_time').text(value.run_time.formatNum(0,' ',','));
                        $('#' + key + ' .max_execution_time').text(value.max_execution_time.formatNum(4,' ',','));
                        $('#' + key + ' .min_execution_time').text(value.min_execution_time.formatNum(4,' ',','));
                        $('#' + key + ' .total_execution_time').text(value.total_execution_time.formatNum(4,' ',','));
                        $('#' + key + ' .avg_execution_time').text(value.avg_execution_time.formatNum(4,' ',','));
                    }

                });
            }
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