T&L Node Console
================
This is a website for displaying measurements from T&L nodes. The
measurements are obtained from a MQTT broker and/or a database.

See the [Sensor Nodes](http://sensornodeinfo.rockingdlabs.com/) site for
more details.

Installation
------------
On a system with Apache2 installed:
  * Copy the `TLnodeConsole.conf` file to the `sites-available/`
    directory.
  * Adjust the values in the `sites-available/TLnodeConsole.conf` to
    match your environment.
  * Copy the `html/js/mqttConfig.js_template` to `html/js/mqttConfig.js`
  * Adjust settings in `html/js/mqttConfig.js` to match your MQTT
    configuration.
  * Enable the web site:

      $ sudo a2ensite TLnodeConsole.conf

  * You can test the web site without an MQTT broker and TLnodes by
    uncommenting the test code in `html/js/gauges.js`


Licenses
--------

 * `mqttws31-min.js` is the [Eclipse Paho Javascript client](https://eclipse.org/paho/clients/js/).
     It is covered by the Eclipse Public License Version 1.0 and Eclipe
     Distribution License 1.0. Refer to the LICENSE_EDL.txt file for
     details.

 * `justgage-1.1.0.min.js` is the [JustGage](http://justgage.com)
   plugin. It is covered by the [MIT License](http://opensource.org/licenses/mit-license.php)
 
 * [jQuery](https://jquery.org) files are [licensed](https://jquery.org/license/)
     by the [MIT License](http://opensource.org/licenses/mit-license.php). 

  * [Font Awesome 4.5.0](http://fontawesome.io/) Created by Dave Gandy.
      - Font Awesome licensed under [SIL OFL 1.1](http://scripts.sil.org/OFL)
      - Font Awesome code licensed under [MIT License](http://opensource.org/licenses/mit-license.html)
      - Font Awesome documentation licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/)

 * Other files are covered by the [Creative Commons Attribution-ShareAlike 4.0 International Public License](https://creativecommons.org/licenses/by-sa/4.0/legalcode)
   or the _Whatever Web Hippie License_. See the LICENSE.txt and
   LICENSE_WWHL.txt files.


 
