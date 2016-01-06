/*
 * Author: J.Dunmire
 */

if (typeof mqttBroker !== 'undefined') {
    var gauges = {};

    var client = new Paho.MQTT.Client(
            mqttBroker.host, mqttBroker.port,
            mqttBroker.clientPrefix + parseInt(Math.random() * 100, 10));

    var topic = mqttBroker.topic;

    jQuery(document).ready(function() {

        function id2label(id) {
            if (id in nodeID2label) {
                return nodeID2label[id];
            }
            return id;
        }

        function addGauge(id) {
        $('.gauges').append(
                '<div class="col-md-4">' +
                '<div class="container-fluid">' +
                '<div class="row">' +
                '<div class="justgauge" id="' + id + '"></div>' +
                '</div>' +
                '<div class="row">' +
                '<p id="battery-' + id +
                '" class="text-left battery">' +
                '<i class="fa fa-battery-1"></i>' +
                '</p>' +
                '<p id="time-' + id +
                '" class="text-right timestamp">' + '</p>' +
                '</div>' +
                '<div class="row">' +
                '<p class="text-center locationLabel">' +
                id2label(id) +
                '</p>' +
                '</div>' +
                '</div>' +
                '</div>');
        gauges[id] = new JustGage({
            id: id,
            min: 50,
            max: 100,
            label: "F"
        });
    };

    function updateGauge(id, degC, voltage) {
        gauges[id].refresh((degC * 9 / 5) + 32);
        var now = new Date();
        // Strip off the TZ information (i.e., 'GMT -0700 (PDT)')
        var shorterDate = now.toString().split('G');
        //console.log(shorterDate[0]);
        $('#time-' + id).text(shorterDate[0]);
        $('#battery-' + id).html(
                '<i class="fa fa-battery-1"></i>' + ' ' +
                parseFloat(voltage).toFixed(3) + 'v');
    }


    function onConnect() {
        //console.log("OnConnect, subscribing");
        client.subscribe(topic, {qos: 2});
    }

    //Gets  called if the websocket/mqtt connection gets disconnected
    //for any reason
    function onConnectionLost(responseObject) {
        // ToDo, reconnect, or possibly refresh whole page
        alert("connection lost: " + responseObject.errorMessage);
    };

    //Gets called whenever you receive a message for your subscriptions
    function onMessageArrived(message) {
        // Un-comment to show all messages in a 'message' div
        //$('#messages').append('<span>Topic: ' + message.destinationName
        //        + '  | ' + message.payloadString + '</span><br/>');
        var sensorID = message.destinationName.split('/')[1];
        var values = message.payloadString.split(',');

        if (!(sensorID in gauges)) {
            // Create the gauge if this is a new sensorID
            addGauge(sensorID);
        }
        updateGauge(sensorID, values[2], values[4]);
    };
    
    /* -------- test code --------
    var nodes = ["RDS_12AB","RDS_12CD","RDS_AC18"];
    for (var key in nodes) {
        var id = nodes[key];
        if (!(id in gauges)) {
            addGauge(id);
        }
        updateGauge(id, Math.random() * 40, Math.random() * 4);
    }
     * ------- test code end
     */

    // setup the MQTT client
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.connect({onSuccess:onConnect});

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
