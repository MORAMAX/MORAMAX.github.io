/*
    Name:       Javascript Google Maps Plugin
    Created by: Simon Willan; slw@mcmnet.co.uk
    Date:       19-Apr-2011
    Company:    MCM Net
    Notes:      This plugin has publicly exposed functions which allow a continuation of jQuery chaining. To do this we have
                the public functions defined as commands at the top, and call them using the apply() method.
                We can use the plugin call to pass the function and any arguments as a string to the plugin 
                e.g $("#div").gmaps("myfunc", args);
*/

(function($) {

    /* define the commands that can me used */
    var commands = {
        setMarkers: setMarkers,
        geoLocation: geoLocation
    };

    //  
    /* plugin definition */
    //
    $.fn.gmap = function() {

        // have we passed a call to a publicly exposed function?
        if (typeof arguments[0] === 'string') {

            // remove the function name from the arguments. We do this as 'arguments' is a nodeList not a real array, and we want it to be an array.
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 1);

            // pass the function name to our commands object which holds the function we want to call and use apply() to run it with all the correct arguments.
            commands[arguments[0]].apply(this, args);

        } else {

            // call initialise using apply to make sure "this" is still available in the correct context
            initialise.apply(this, arguments)

        }

        return this;

    };

    // ------------------------------------------------------------ //

    //
    /* any publicly exposed plugin functions */
    //


    /* plugin defaults */
    $.fn.gmap.defaults = {
        width: 600,
        height: 200,
        zoom: 8,
        data: null,
        url: "",
        center: {
            lat: 0,
            lng: 0
        },
        mapType: "ROADMAP", // ROADMAP | HYBRID | SATELLITE | TERRAIN
        typeControl: true,
        zoomControl: true,
        panControl: true,
        streetView: true,
        draggable: true,
        scrollWheel: true
    };

    /* initialise the plugin */
    function initialise(options) {

        /* default options are set and overwritten here */
        p.opts = $.extend(true, {}, $.fn.gmap.defaults, options);

        /* main plugin body */
        return this.each(function() {

            var $this = $(this);
            p.$me = $this;

            // set up the banner css properties
            $this.css({ 
                width: p.opts.width,
                height: p.opts.height
            });

            // load map
            p.loadMap();

        });

    };

    /* set marker function */
    function setMarkers(pc, drag, obj) {

        if (p.loaded === true) {

            // clear old markers
            if (p.markers.length > 0) {
                $.each(p.markers, function(idx) {
                    $(this)[0].setMap(null);
                });
                p.markers = [];
            };

            // default markers point to the center of the map if no postcode is found
            var point = new google.maps.LatLng(p.opts.center.lat, p.opts.center.lng);

            // do we have a postcode
            if (pc) {

                // geocode postcode to get location
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ "address": pc }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        // successful geocode
                        point = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

                        $("#" + obj).val(point.lat() + "|" + point.lng())

                        // center the map
                        p.$map.setCenter(point);

                        // place the marker (and if draggable, then a new icon as well)
                        var marker = new google.maps.Marker({
                            position: point,
                            draggable: drag,
                            map: p.$map,
                            icon: (drag === true ? "http://labs.google.com/ridefinder/images/mm_20_red.png" : "")
                        });

                        // set the passed in DOM Object value to be the lat and lng values
                        google.maps.event.addListener(marker, "dragend", function(e) {
                            $("#" + obj).val(e.latLng.lat() + "|" + e.latLng.lng())
                        });

                        // push our marker into a global array in case we need it later
                        p.markers.push(marker);

                    } else { 

                        // unsuccessful geocode
                        success = false;
                        alert("geocode error: " + status);

                    };
                });

            } else {

                // no postcode supplied, assume we are trying to get the location from the server.
                if (p.opts.data !== null && p.opts.data !== 0) {
                    $.ajax({
                        url: p.opts.url,
                        data: { mode: "markers", id: p.opts.data },
                        success: function(d, textstatus) {

                            if (d && d.status === "S") {

                                var bounds = new google.maps.LatLngBounds();

                                // loop through our marker data
                                $.each(d.obj, function(idx) {

                                    // harvey jones data
                                    var id = $(this)[0].id;
                                    var loc = $(this)[0].latlngpoint;
                                    var name = $(this)[0].name;
                                    var address1 = $(this)[0].address1;
                                    var address2 = $(this)[0].address2;
                                    var address3 = $(this)[0].address3;
                                    var town = $(this)[0].town;
                                    var county = $(this)[0].county;
                                    var postcode = $(this)[0].postcode;
                                    var tel = $(this)[0].tel;
                                    var fax = $(this)[0].fax;
                                    var friendlyUrl = $(this)[0].friendlyUrl;

                                    var address = address1 + ",<br />" +
                                                  (address2.length > 0 ? address2 + ",<br />" : "") +
                                                  (address3.length > 0 ? address3 + ",<br />" : "") +
                                                   town + ",<br />" +
                                                   county + ",<br />" +
                                                   postcode + "<br /><br />" +
                                                  (tel.length > 0 ? "T: " + tel + "<br />" : "") +
                                                  (fax.length > 0 ? "F: " + fax + "<br />" : "");

                                    // get the google map latlng point
                                    loc = new google.maps.LatLng(loc.lat, loc.lng);

                                    // center the map
                                    if (p.opts.data !== -1) {
                                        p.$map.setCenter(loc);
                                    };

                                    // place the marker 
                                    var marker = new google.maps.Marker({
                                        position: loc,
                                        map: p.$map,
                                        title: name,
                                        info: address,
                                        web: friendlyUrl,
                                        sid: id
                                    });

                                    // for an individual location, set and open the window on page load
                                    if (p.opts.data > 0) {

                                        var content = p.createInfoWindowHtml(p.opts.data, marker, d, loc);

                                        // create an offset by a small amount to counter the info window loading too high up
                                        var offsetLocLat = loc.lat();
                                        offsetLocLat += 0.15;
                                        offsetLocLat = new google.maps.LatLng(offsetLocLat, loc.lng());

                                        // reset the central pos of the map to our new offset
                                        setTimeout(function() { p.$map.setCenter(offsetLocLat) }, 700);
                                        
                                        p.infoW.setContent(content.html());
                                        p.infoW.open(p.$map, marker);

                                        // when zooming, make sure the pin gets centered so we don't lose it.
                                        google.maps.event.addListener(p.$map, "zoom_changed", function () {

                                            // center on marker
                                            p.$map.setCenter(loc);

                                        });

                                    };
                                    
                                    google.maps.event.addListener(marker, "click", function() {
                                        window.location.href = "/" + d.friendly + "/" + this.web;
                                    });

                                    // setup the info window and its options
                                    google.maps.event.addListener(marker, "mouseover", function() {

                                        var content = p.createInfoWindowHtml(p.opts.data, this, d, loc);

                                        p.infoW.setContent(content.html());
                                        p.infoW.open(p.$map, this);

                                    });

                                    // only for 'all markers data' do we extend the bounds and fiddle the zoom level
                                    if (p.opts.data === -1) {
                                        // extend the bounding box
                                        bounds = bounds.extend(loc);

                                        // set up a 'zoom_changed' event to check when we are changing zoom level
                                        google.maps.event.addListenerOnce(p.$map, 'zoom_changed', function() {
                                            if (p.$map.getZoom() > 13) {
                                                p.$map.setZoom(13);
                                            };
                                        });

                                        // center the map and zoom in. if the zoom is greater than 13 than the map will not zoom further
                                        p.$map.fitBounds(bounds);
                                    }

                                    // push our marker into a global array in case we need it later
                                    p.markers.push(marker);

                                });

                            };

                        },
                        dataType: "json",
                        async: false
                    });
                } else {
                    alert("no data, cannot set marker(s).");
                };

            };

        } else { alert("map not loaded") };

    };

    /* geocode user entered location and retrieve the closest entry to the location */
    function geoLocation(pc) {

        if (p.loaded === true) {

            // do we have a postcode
            if (pc) {

                // geocode postcode to get location
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ "address": pc }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        // successful geocode
                        point = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

                        var lat = point.lat();
                        var lng = point.lng();

                        // make an ajax request to find the closest entry
                        $.ajax({
                            url: p.opts.url,
                            data: { mode: "geocode", lat: lat, lng: lng },
                            success: function(d, textstatus) {
                            
                                if (d && d.status === "S") {

                                    // get dist from postcode to each extra location
                                    var dist1 = p.distHaversine(point, new google.maps.LatLng(d.obj[1].lat, d.obj[1].lng));
                                    var dist2 = p.distHaversine(point, new google.maps.LatLng(d.obj[2].lat, d.obj[2].lng));

                                    // convert dist to miles
                                    dist1 = parseInt((dist1 / 1.609));
                                    dist2 = parseInt((dist2 / 1.609));

                                    // redirect to closest location
                                    window.location.href = "/" + d.obj[0].path + "/" + d.obj[0].friendlyUrl + "/?pc=" + pc + "&loc=" + d.obj[1].id + "|" + d.obj[2].id + "&dist=" + dist1 + "|" + dist2;

                                };

                            },
                            dataType: "json",
                            async: false
                        });

                    } else {

                        // unsuccessful geocode
                        success = false;
                        alert("geocode error: " + status);

                    };
                });

            }

        }

    };

    // ------------------------------------------------------------ //

    //
    /* any private functions local to the plugin only */
    //

    var p = {

        loaded: false,

        opts: null,
        pc: null,
        $me: null,
        $map: null,
        markers: [],
        infoW: new google.maps.InfoWindow,

        /* initialise the map */
        loadMap: function() {

            // load map and options
            p.$map = new google.maps.Map(p.$me[0], options = {
                zoom: p.opts.zoom,
                center: new google.maps.LatLng(p.opts.center.lat, p.opts.center.lng),
                mapTypeId: p.getMapType(p.opts.mapType),
                mapTypeControl: p.opts.typeControl,
                streetViewControl: p.opts.streetView,
                panControl: p.opts.panControl,
                zoomControl: p.opts.zoomControl,
                scrollwheel: p.opts.scrollWheel,
                draggable: p.opts.draggable
            });
            p.loaded = true;

        },

        /* gets the type of map layout to display */
        getMapType: function(type) {

            switch (type) {
                case "ROADMAP":
                    type = google.maps.MapTypeId.ROADMAP;
                    break;

                case "HYBRID":
                    type = google.maps.MapTypeId.HYBRID;
                    break;

                case "SATELLITE":
                    type = google.maps.MapTypeId.SATELLITE;
                    break;

                case "TERRAIN":
                    type = google.maps.MapTypeId.TERRAIN;
                    break;

                default: break;
            };

            return type;
        },
        
        createInfoWindowHtml: function(id, obj, d, loc) {
            
            var attr = { };
            var text = "";

            // different link text and location if we are an individual showroom

            if (id <= 0) {
                attr = { href: "/" + d.friendly + "/" + obj.web, title: obj.title, target: "_blank" };
                text = "<br />View more >>"
            } else {
                attr = { href: "http://maps.google.com/maps?q=" + loc.lat() + "," + loc.lng() + "&z=10/", title: obj.title, target: "_blank" }
                text = "<br /> Find directions >>"
            };


            var $infoC = $(document.createElement("div"));
            $infoC.append(p.createRecursiveObjects({
                "div": {
                    attributes: { "className": "infoW" },
                    children: [

                    // text
                        {"div": {
                            attributes: { "className": "text" },
                            children: [
                                {"p": {
                                    children: [
                                        {"strong": {
                                            children: [
                                                {"a": {
                                                    attributes: { href: "/" + d.friendly + "/" + obj.web, title: obj.title, target: "_blank" },
                                                    text: obj.title       
                                                }}
                                            ]
                                        }}
                                    ]
                                }},
                                
                                {"p": {
                                    text: obj.info
                                }},
                                
                                {"p": {
                                    children: [
                                        {"a": {
                                            attributes: attr,
                                            text: text  
                                        }}
                                    ]
                                }}
                            ]
                        }},
                        
                        {"div": {
                            attributes: { "className": "image" },
                            children: [
                                {"img": {
                                    attributes: { src: d.path + obj.sid + ".png", title: obj.title, alt: obj.title }
                                }}
                            ]
                        }}
                        
                    ]
                }
            }));

            return $infoC;
        },

        /* allows us to create html */
        createRecursiveObjects: function(spec) {
            var item, obj;
            for (item in spec) {
                // create our DOM object
                obj = document.createElement(item);
                // deal with setting up the attributes of the DOM object                                
                for (var attrib in spec[item].attributes) obj[attrib] = spec[item].attributes[attrib];
                // inner text
                if (spec[item].text && spec[item].text != "") obj.innerHTML = spec[item].text;
                // inline styles
                for (var style in spec[item].styles) obj.style[style] = spec[item].styles[style];
                // child nodes (recursion)
                for (var child in spec[item].children) obj.appendChild(p.createRecursiveObjects(spec[item].children[child]));
                if (spec[item].callback && typeof spec[item].callback == "function") spec[item].callback(obj);

                // return our DOM object
                return obj;
            }
        },

        // gets radians
        rad: function(x) {return x*Math.PI/180;},
        
        // works out distance using latitude and longitude using the haversine formula
        distHaversine: function(p1, p2) {
          var R = 6371; // earth's mean radius in km
          var dLat  = p.rad(p2.lat() - p1.lat());
          var dLong = p.rad(p2.lng() - p1.lng());

          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(p.rad(p1.lat())) * Math.cos(p.rad(p2.lat())) * Math.sin(dLong/2) * Math.sin(dLong/2);
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c;

          return d.toFixed(3);
        }

    };

})(jQuery);