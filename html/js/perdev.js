/*
 * perdev.js - JS functions for perdev.html
 *
 * Author: J.Dunmire
 */

var globals = {};

$(function() {
    $('#dev-chart').highcharts({
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
        yAxis: [
        {
            labels: {
                format: '{value}°F',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: 'Temperature'
            }//,
            //ceiling: 150,
            //max: 150
        },
        {
            labels: {
                format: '{value}V',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Voltage'
            },
            minRange: 0.1
        },
        {
            labels: {
                format: '{value}s',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Elapsed Time'
            },
            opposite: true,
            min: 0
        },
        {
            type: 'logarithmic',
            labels: {
                format: '{value} lux',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            },
            title: {
                text: 'Light Level'
            },
            opposite: true
        }
        ],
        series: [
        {
            name: 'Temperature',
            yAxis: 0
        },
        {
            name: 'Voltage',
            yAxis: 1
        },
        {
            name: 'Elapsed Time',
            yAxis: 2
        },
        {
            name: 'Ambient Light',
            yAxis: 3
        }
        ]
    });
});

if (typeof mqttBroker !== 'undefined') {
    var gauges = {};

    /* var client = new Paho.MQTT.Client(
       mqttBroker.host, mqttBroker.port,
       mqttBroker.clientPrefix + parseInt(Math.random() * 100, 10));

       var topic = mqttBroker.topicPrefix + '+/report';
       */

    jQuery(document).ready(function() {
        globals.temperatures = [];
        globals.voltages = [];
        globals.times = [];
        globals.lux = [];
        globals.interval = 'T24H';

        function id2label(id) {
            if (id in nodeID2label) {
                return nodeID2label[id];
            }
            return id;
        }

        // add devices to devmenu
        for (var id in nodeID2label) {
            $('#devmenu ul').append(
                    '<li data=dv-' + id
                    + '><a href="#">'+ nodeID2label[id]
                    + '</a></li>'
                    );
        }

        $('#devmenu').find('#label').html(
                nodeID2label[Object.keys(nodeID2label)[0]] + ' <span class="caret"></span>').end();
        globals.device = Object.keys(nodeID2label)[0];
        updateChart(globals.device, globals.interval);

    });

} else {
    $('.gauges').append(
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

function updateChart(device, interval) {
    var chart = $('#dev-chart').highcharts();
    chart.setTitle({ text: '<p class="text-center"><b>'
        + nodeID2label[device] + '</b><br><span class="small">\('
            + device + "\)</span></p>"},
            false);

    var url = "php/getnodevalue.php?interval=" + interval
        + "&device=" + device;
    //console.log(url);
    //console.log(globals.locations[device]);
    var chart = $('#dev-chart').highcharts();
    d3.csv(url, function(data) {
        // Re-factor data
        globals.temperatures = [];
        globals.voltages = [];
        globals.times = [];
        globals.lux = [];
        $("#rangeTable").empty();
        for (index = 0; index < data.length; index++) {
            var o = [];
            o[0] = parseInt(data[index].timestamp, 10);
            if (typeof data[index].temperature != 'undefined'
                    && data[index].temperature != ''
               ) {
                o[1] = Math.round(
                        ((parseFloat(data[index].temperature, 10) * 9 / 5) + 32)
                        * 10
                        ) / 10;

                globals.temperatures.push(o.slice(0));
            }
            if (typeof data[index].voltage != 'undefined'
                    && data[index].voltage != ''
               ) {
                o[1] = parseFloat(data[index].voltage, 10);
                globals.voltages.push(o.slice(0));
            }
            if (typeof data[index].elapsedTime != 'undefined'
                    && data[index].elapsedTime != ''
               ) {
                o[1] = parseFloat(data[index].elapsedTime, 10);
                globals.times.push(o.slice(0));
            }
            if (typeof data[index].ambient_lux != 'undefined'
                    && data[index].ambient_lux != ''
               ) {
                o[1] = parseFloat(data[index].ambient_lux, 10) / 64 ;
                globals.lux.push(o.slice(0));
            }
        }
        //console.log(chart.series);
        chart.series[0].setData(globals.temperatures, false);
        chart.series[1].setData(globals.voltages, false);
        chart.series[2].setData(globals.times, false);
        chart.series[3].setData(globals.lux, true);
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

    if (dataType === "dv-") {
        globals.device = dataVal;
        target.closest(".dropdown").find( '#label' ).html(
                target.text() + ' <span class="caret"></span>'
                ).end()
        updateChart(dataVal, globals.interval);
        //updateChart(dataVal, 'T24H');
    } else if (dataType === "tp-") {
        target.closest(".dropdown").find( '#label' ).html(
                target.text() + ' <span class="caret"></span>'
                ).end()
            globals.interval = dataVal;
        updateChart(globals.device, dataVal);
    }

    return false;

});
