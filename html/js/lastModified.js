/* Author: J.Dunmire
 *
 * Based on the example at 
 * http://www.chipchapin.com/WebTools/JavaScript/example1-02.html
 *
 * To use this, add the following line to a html document at the
 * location where the last modified string should appear.
 *
 * For example:
 *
 *  <footer>
 *    <p class="lastmodified" id="lastModified">
 *    <script type="text/javascript" src="js/lastmodified.js"></script>
 *    </p>
 *  </footer>
 *
 */
lastmod = document.lastModified;
lastmoddate = Date.parse(lastmod);
if (lastmoddate == 0) {
  document.writeln("Last Modified: Unknown")
} else {
  document.writeln("Last Modified: " + lastmod);
}
