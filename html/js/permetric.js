/*
 * perdev.js - JS functions for perdev.html
 *
 * Author: J.Dunmire
 */

var globals = {},

    // color palette from
    // http://ksrowell.com/blog-visualizing-data/2012/02/02/optimal-colors-for-graphs/
    colors = [
        '#396AB1',
        '#DA7C30',
        '#3E9651',
        '#CC2529',
        '#535154',
        '#6B4C9A',
        '#922428',
        '#948B3D',
    ],

    units = {
        temperature: {
            title: 'Temperature',
            format: '{value} °F',
            minRange: 5,
            type: 'linear',
            scale: function(value) {
                return (Math.round(((value * 9 / 5) + 32) * 10) / 10);
            },
        },
        voltage: {
            title: 'Voltage',
            format: '{value}',
            minRange: 1,
            type: 'linear',
            scale: function(value) {return value;},
        },
        elapsedTime: {
            title: 'Elapsed Time (sec)',
            format: '{value}',
            minRange: 10,
            type: 'linear',
            scale: function(value) {return value;},
        },
        ambient_lux: {
            title: 'Light intensity (lux)',
            format: '{value}',
            minRange: 100,
            type: 'logarithmic',
            scale: function(value) {return (value / 64);},
        },
    };

if (typeof mqttBroker !== 'undefined') {
    jQuery(document).ready(function() {
        globals.interval = 'T24H';
        globals.metric = 'temperature';
        globals.metricLabel = $('#metricmenu').find('#label')
            .html().split('<')[0];
        globals.devices = Object.keys(nodeID2label);

        globals.values = [];
        i = 0;
        for (var id in nodeID2label) {
            globals.values[i++] = [];
        }

        $('#metric-chart').highcharts({
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            legend: {
                enabled: false,
                layout: 'vertical',
                align: 'left',
                x: 135,
                verticalAlign: 'top',
                y: 30,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            tooltip: {
                shared: true
            },
            title: {
                useHTML: true
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%H:%M<br>%b %e',
                    month: '%b %e',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                },
                crosshair: true
            },
            yAxis: [{}],
        });
        updateChart();

    });


    /* var client = new Paho.MQTT.Client(
       mqttBroker.host, mqttBroker.port,
       mqttBroker.clientPrefix + parseInt(Math.random() * 100, 10));

       var topic = mqttBroker.topicPrefix + '+/report';
       */

    function updateChart() {
        var chart = $('#metric-chart').highcharts();
        chart.setTitle(
                { text: '<p class="text-center"><b>' + globals.metricLabel},
                false);

        chart.yAxis[0].update({
            title: {
                text: units[globals.metric].title
            },
            labels: {
                format: units[globals.metric].format
            },
            minRange: units[globals.metric].minRange,
            type: units[globals.metric].type,
        });
        // y-axis: units, range?, log for light.

        var url = "php/getByMetric.php?interval=" + globals.interval
            + "&metric=" + globals.metric;
        //console.log(globals.locations[device]);

        // data is an array of elements. Where element is an object with
        // three parts: deviceid, metric, timestamp
        //
        // global.values is an array of arrays. The sub-array is an x,y
        // pair.
        //
        // I need N array-of-array arrays. Where N is the number of devices.
        // Could I create an object that could be used like:
        // devIndex.DEVICEID
        d3.csv(url, function(data) {
            // Re-factor data
            for (i = 0; i < globals.values.length; i++) {
                globals.values[i] = [];
            }
            while (chart.series.length > 0) {
                chart.series[0].remove(false);
            }

            for (index = 0; index < data.length; index++) {
                deviceid = data[index].deviceid;
                if ((devindex = $.inArray(deviceid, globals.devices)) >= 0) {
                    var o = [];
                    o[0] = parseInt(data[index].timestamp, 10);
                    if (typeof data[index].metric != 'undefined'
                            && data[index].metric != ''
                       ) {
                        o[1] = units[globals.metric].scale(
                                parseFloat(data[index].metric, 10));

                        globals.values[devindex].push(o.slice(0));
                    }
                }
            }
            //console.log(chart.series);
            for (i = 0; i < globals.values.length; i++) {
                chart.addSeries({
                    name: nodeID2label[globals.devices[i]],
                    data: globals.values[i],
                    color: colors[i%colors.length],
                }, false);
            };
            chart.redraw();
        });

    };

    // get values from drop down menu
    // Assumes li elements have a data attribute of the form XX-YYYYYY
    // Where XX is a type prefix and YYYYY is the value.
    $( document.body ).on( 'click', '.dropdown-menu li', function( event ) {

        var target = $( event.currentTarget ),
        data, dataType, dataVal;

        if (typeof $(this).attr("data") !== "undefined") {
            data = $(this).attr("data");
            dataType = data.substring(0,3);  // prefix
            dataVal = data.substring(3);     // rest of string
            //console.log(dataVal);
        }

        // Close the dropdown
        target.closest(".dropdown").find("[data-toggle='dropdown']").dropdown("toggle");

        if (dataType === "mn-") {
            globals.metric = dataVal;
            globals.metricLabel = target.text();
            target.closest(".dropdown").find( '#label' ).html(
                    target.text() + ' <span class="caret"></span>'
                    ).end()
                updateChart();
            //updateChart(dataVal, 'T24H');
        } else if (dataType === "tp-") {
            target.closest(".dropdown").find( '#label' ).html(
                    target.text() + ' <span class="caret"></span>'
                    ).end()
                globals.interval = dataVal;
            updateChart();
        }

        return false;

    });
} else {
    $('#metric-chart').append(
            '<div class="col-md-1"></div>' +
            '<div class="col-md-4">' +
            '<p></p>' +
            '<p>' +
            'MQTT configuration not found: probably due to a missing ' +
            'js/mqttConfig.js file, or syntax errors in that file.' +
            '</p>' +
            '<p>' +
            'Use the js/mqttConfig.js_template file as a reference to ' +
            'create the js/mqttConfig.js file.' +
            '</div>' +
            '</div>'
            );
};

