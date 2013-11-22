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


// Init Flot graph.
var flot_options = {
    counter : 2,
    counter_5min : 1,
    graph_data_points : 750,
    update_interval_5min : 60,
    data_series_map : {},
    data_series_5min_map : {},
    label_map : {
        '2' : 'primary',
        '4' : 'success',
        '6' : 'info',
        '8' : 'warning',
        '10' : 'danger'
    },
    options : {
        grid : {
            show : true,
            borderWidth: 0
        },
        xaxis:{
            mode: "time",
            timeformat: "%H:%M:%S",
            minTickSize: [10, "second"],
            ticks: 5
        },
        yaxis: {
            min: 0,
            minTickSize: 1,
            tickDecimals: 0,
            ticks: 5
        },
        colors: ['#999999', '#808080', '#428bca', '#428bca', '#5cb85c', '#5cb85c', '#5bc0de', '#5bc0de', '#f0ad4e', '#f0ad4e', '#d9534f', '#d9534f']
    },
    options_5min : {
        grid : {
            show : true,
            borderWidth: 0
        },
        xaxis:{
            mode: "time",
            timeformat: "%H:%M:%S",
            minTickSize: [10, "second"],
            ticks: 5
        },
        yaxis: {
            min: 0,
            minTickSize: 1,
            tickDecimals: 0,
            ticks: 5
        },
        colors: ['#999999', '#428bca', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f']
    },
    time_options : {
        grid : {
            show : true,
            borderWidth: 0
        },
        xaxis:{
            mode: "time",
            timeformat: "%H:%M:%S",
            minTickSize: [10, "second"],
            ticks: 5
        },
        yaxis: {
            min: 0,
            minTickSize: 0.0001,
            tickDecimals: 4,
            ticks: 5
        },
        colors: ['#999999', '#808080', '#428bca', '#428bca', '#5cb85c', '#5cb85c', '#5bc0de', '#5bc0de', '#f0ad4e', '#f0ad4e', '#d9534f', '#d9534f']
    },
    series_array : [],
    time_series_array : [],
    series_5min_array : [],
    series : {
        lines: {
            lineWidth: 0,
            show: true,
            fill: true
        },
//        bars: {
//            show: true,
//            barWidth: 5,
//            align: "center"
//        },
        data: []
    },
    series2 : {
        lines: {
            lineWidth: 1,
            show: true,
            fill: false
        },
        data: []
    },
    time_series : {
        lines: {
            lineWidth: 0,
            show: true,
            fill: true
        },
        data: []
    },
    time_series2 : {
        lines: {
            lineWidth: 1,
            show: true,
            fill: false
        },
        data: []
    },
    series_5min : {
        lines: {
            lineWidth: 0,
            show: true,
            fill: true
        },
        data: []
    }
};
var plot = null;
var time_plot = null;
// Set up some options on our data series
flot_options.series_array.push(flot_options.series);
flot_options.series_array.push(flot_options.series2);

flot_options.time_series_array.push(flot_options.time_series);
flot_options.time_series_array.push(flot_options.time_series2);

flot_options.series_5min_array.push(flot_options.series_5min);

// Init graph
plot = $.plot($('#process_graph'), flot_options.series_array, flot_options.options);
plot.draw();

time_plot = $.plot($('#time_graph'), flot_options.time_series_array, flot_options.time_options);
time_plot.draw();

plot_5min = $.plot($('#process_graph_5min'), flot_options.series_5min_array, flot_options.options_5min);
plot.draw();

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

    //series_array.push(series);
    flot_options.series_array[0].data.push([stats.timestamp, stats.current_rate]);
    flot_options.series_array[1].data.push([stats.timestamp, stats['1MinuteRate']]);

    flot_options.time_series_array[0].data.push([stats.timestamp, stats.execution_time]);
    flot_options.time_series_array[1].data.push([stats.timestamp, stats.avg_execution_time]);

    var now = parseInt((new Date()).getTime() / 1000);
    var last_time = 0;
    if (flot_options.series_5min_array[0].data.length > 0)
        last_time = parseInt(flot_options.series_5min_array[0].data[ flot_options.series_5min_array[0].data.length - 1][0] / 1000);

    if (flot_options.series_5min_array[0].data.length <= 2)
        flot_options.series_5min_array[0].data.push([stats.timestamp, stats['5MinuteRate']]);

    if (now - last_time >= flot_options.update_interval_5min)
        flot_options.series_5min_array[0].data.push([stats.timestamp, stats['5MinuteRate']]);

    // Keep the data series a manageable length
    for (var i in flot_options.series_array) {
        while (flot_options.series_array[i].data.length > flot_options.graph_data_points) {
            flot_options.series_array[i].data.shift();
            flot_options.time_series_array[i].data.shift();
        }
    }
    for (var i in flot_options.series_5min_array) {
        while (flot_options.series_5min_array[i].data.length > flot_options.graph_data_points) {
            flot_options.series_5min_array[i].data.shift();
        }
    }

    if (Object.prototype.toString.call( stats.plugins ) === '[object Object]') {
        $.each( stats.plugins, function( key, value ) {
            if ($('#' + key + '_total_execution_cnt').length == 0) {
                flot_options.data_series_map[key] = flot_options.counter;
                flot_options.data_series_5min_map[key] = flot_options.counter_5min;
                flot_options.series_array[flot_options.counter] = { lines: { lineWidth: 0, show: true, fill: true }, data : [] };
                flot_options.series_array[flot_options.counter+1] = { lines: { lineWidth: 1, show: true, fill: false }, data : [] };
                flot_options.time_series_array[flot_options.counter] = { lines: { lineWidth: 0, show: true, fill: true }, data : [] };
                flot_options.time_series_array[flot_options.counter+1] = { lines: { lineWidth: 1, show: true, fill: false }, data : [] };
                flot_options.series_5min_array[flot_options.counter_5min] = { lines: { lineWidth: 1, show: true, fill: false }, data : [] };
                $('#plugins_name').append('<th class="num">' + key + '</th>');
                $('#plugins_count').append('<td class="num"><span id="' + key + '_total_execution_cnt" class="label label-' + flot_options.label_map[flot_options.counter] +'"></span></td>');
                $('#plugins_run_time').append('<td class="num"><span id="' + key + '_run_time"> </span> <span class="text-muted">s</span></td>');
                $('#plugins_max_rate').append('<td class="num"><span id="' + key + '_max_rate"> </span> <span class="text-muted">req/s</span></td>');
                $('#plugins_mean').append('<td class="num"><span id="' + key + '_mean"> </span> <span class="text-muted">req/s</span></td>');
                $('#plugins_current_rate').append('<td class="num"><span class="label label-' + flot_options.label_map[flot_options.counter] +'"><span id="' + key + '_current_rate"></span> req/s</span></td>');
                $('#plugins_one_min_rate').append('<td class="num"><span id="' + key + '_one_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                $('#plugins_five_min_rate').append('<td class="num"><span id="' + key + '_five_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                $('#plugins_fifteen_min_rate').append('<td class="num"><span id="' + key + '_fifteen_minute_rate"> </span> <span class="text-muted">req/s</span></td>');
                $('#plugins_avg_execution_time').append('<td class="num"><span class="label label-' + flot_options.label_map[flot_options.counter] +'"><span id="' + key + '_avg_execution_time"></span> s</span></td>');
                $('#plugins_max_execution_time').append('<td class="num"><span id="' + key + '_max_execution_time"> </span> <span class="text-muted">s</span></td>');
                $('#plugins_min_execution_time').append('<td class="num"><span id="' + key + '_min_execution_time"> </span> <span class="text-muted">s</span></td>');
                $('#plugins_total_execution_time').append('<td class="num"><span id="' + key + '_total_execution_time"> </span> <span class="text-muted">s</span></td>');
                flot_options.counter+=2;
                flot_options.counter_5min++;
            }

            if ($('#' + key + '_total_execution_cnt').length > 0) {
                var i = flot_options.data_series_map[key];
                var j = flot_options.data_series_5min_map[key];
                flot_options.series_array[i].data.push([stats.timestamp, value.current_rate]);
                flot_options.series_array[i+1].data.push([stats.timestamp, value.one_minute_rate]);
                flot_options.time_series_array[i].data.push([stats.timestamp, value.execution_time]);
                flot_options.time_series_array[i+1].data.push([stats.timestamp, value.avg_execution_time]);
                if (now - last_time >= flot_options.update_interval_5min)
                    flot_options.series_5min_array[j].data.push([stats.timestamp, value.five_minute_rate]);
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

    // Plot graph
    plot.setData(flot_options.series_array);
    plot.setupGrid(flot_options.options);
    plot.draw();

    time_plot.setData(flot_options.time_series_array);
    time_plot.setupGrid(flot_options.time_options);
    time_plot.draw();

    plot_5min.setData(flot_options.series_5min_array);
    plot_5min.setupGrid(flot_options.options_5min);
    plot_5min.draw();

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
            updateStats(data);
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