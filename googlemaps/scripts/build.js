var AdmZip = require('adm-zip');

// creating archives
var zip = new AdmZip();

zip.addLocalFolder("./META-INF/", "/META-INF/");
zip.addLocalFolder("./dist/servoy/googlemaps/", "/dist/servoy/googlemaps/");
zip.addLocalFolder("./svyGMaps/", "/svyGMaps/");

zip.writeZip("googlemaps.zip");