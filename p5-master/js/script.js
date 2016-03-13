function initMap() {
//create the google maps object
    var Map = function (element, opts) {
        this.gMap = new google.maps.Map(element, opts);
        //use the zoom method to get and set the zoom level, if no value is supplied the current zoom level will be returned.
        this.zoom = function (level) {
            if (level) {
                this.gMap.setZoom(level);
            } else {
                return this.gMap.getZoom();
            }
        };
    };
//map options object to be supplied when creating a new Map
    var mapOptions = {
        center: {
            lat: 42.027169,
            lng: -93.645950
        },
        zoom: 15,
        disableDefaultUI: false,
        scrollwheel: true,
        draggable: true,
        //Could choose satellite etc, roadmap is the cleanest however.
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT,
            style: google.maps.ZoomControlStyle.SMALL
        },
        panControlOptions: {
            position: google.maps.ControlPosition.BOTTOM_LEFT
        }
    };
    var element = document.getElementById('map-canvas'),
//iconSelected = './images/gMapPin.png';
        iconSelected = '';

    var map = new Map(element, mapOptions);
    map.zoom(15);

//initialize infoBubble library. Adds tabs tot he info bubbles on the markers
    var infoBubble = new InfoBubble({
        maxWidth: 300,
        maxHeight: 300,
        closeSrc: './images/close.png',
        backgroundClassName: 'infoBubble'
    });

    infoBubble.addTab('NYtimes', 'Content Pending');

//data
    var PLACES = [
        {
            id: 1,
            name: 'Iowa State University',
            map: map.gMap,
            position: {
                lat: 42.027169,
                lng: -93.645950
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 2,
            name: 'Jack Trice Stadium',
            map: map.gMap,
            position: {
                lat: 42.014142,
                lng: -93.636070
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 3,
            name: 'Coover Hall Iowa State University Engineering',
            map: map.gMap,
            position: {
                lat: 42.028591,
                lng: -93.650873
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 4,
            name: 'Iowa State University College of Design',
            map: map.gMap,
            position: {
                lat: 42.028531,
                lng: -93.652889
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 5,
            name: 'Iowa State Physics Hall',
            map: map.gMap,
            position: {
                lat: 42.029507,
                lng: -93.647319
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 6,
            name: 'Iowa State University Lagomarcino Hall',
            map: map.gMap,
            position: {
                lat: 42.029858,
                lng: -93.645141
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 7,
            name: 'Iowa State College of Business',
            map: map.gMap,
            position: {
                lat: 42.025196,
                lng: -93.644572
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 8,
            name: 'Iowa State University Industrial and Manufacturing Systems Engineering',
            map: map.gMap,
            position: {
                lat: 42.026017,
                lng: -93.650902
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 9,
            name: 'Iowa State University Department of Residence',
            map: map.gMap,
            position: {
                lat: 42.023872,
                lng: -93.650157
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        },
        {
            id: 10,
            name: 'Virtual Reality Applications Center',
            map: map.gMap,
            position: {
                lat: 42.026700,
                lng: -93.652239
            },
            icon: null,
            animation: google.maps.Animation.DROP,
            selected: 0
        }
    ];

//create marker
    var Place = function (place) {
        place.name = ko.observable(place.name);
        place.selected = ko.observable(place.selected);
        var marker = new google.maps.Marker(place);

        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 2100);

        return marker;
    };


//octopus
    var ViewModel = function () {
        var self = this;
        self.list = ko.observableArray([]);

        //create and bind our markers from our raw data
        PLACES.forEach(function (place) {
            var marker = new Place(place);
            //add event listener using a closure.
            google.maps.event.addListener(marker, 'click', (function (Copy) {
                return function () {
                    self.setCurrentPlace(Copy);
                    //console.log(marker);
                    //each new pin that is clicked will have a bounced animation for 2 seconds.
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    //marker.setVisible(false);
                    setTimeout(function () {
                        marker.setAnimation(null);
                        marker.setVisible(true);
                    }, 2000);

                };
            })(marker));

            // Listen for user click on map to close any open info bubbles
            google.maps.event.addListener(map, "click", function () {
                infoBubble.close();
            });

            self.list().push(marker);
        });
        //ajax calls
        this.ajaxCallNY = function (data) {

            var contentString;
            var nyTimes = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + data.name() + "&page=0&fl=headline,snippet&api-key=355a2879bb4d70ec48556d0bbf1f2c98:2:73794013";
            $.getJSON(nyTimes, function (data) {

                var items = [];

                $.each(data.response.docs, function (id, obj) {
                    if (obj.snippet == null || obj.headline.length < 5) {
                        items.push("<h4>" + "<li>" + "Nothing to report );" + "</h4></li>");
                    }
                    else {
                        items.push("<h4>" + "<li>" + obj.headline.main + "</h4></li>");
                        items.push("<p>" + obj.snippet + "</p>");
                    }

                });

                contentString = items.join("");

                infoBubble.updateTab(0, '<div class="infoBubble">NYtimes</div>', contentString);
                infoBubble.updateContent_();
            }).error(function (e) {
                var error = "<p>error: failed to load articles from NYTimes. Here is the actual error...</p>" + e.statusText;
                infoBubble.updateTab(0, '<div class="infoBubble">NYtimes</div>', error);
                infoBubble.updateContent_();
            });
        };

        this.setCurrentPlace = function (data) {

            self.list().forEach(function (data) {
                data.setIcon(null);
                data.selected(null);
            });
            data.setIcon(iconSelected);
            data.selected(1);
            self.currentPlace(data);
            self.ajaxCallNY(data);
            //console.log(data);
            data.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                data.setAnimation(null);
            }, 2000);

            infoBubble.open(map.gMap, data);
            return true;
        };
        this.currentPlace = ko.observable(this.list()[0]);
        this.searchBox = ko.observable("");


        //This array keeps track of the values of the search indices for the marker to determine if it should appear on the
        //map
        var markerCheck = new Array(self.list().length);


        //search implementation
        this.searchPlaces = ko.computed(function () {


            if (self.searchBox() === "") {
                //console.log(self.list()[0].name());
                for (i = 0; i < self.list().length; ++i){
                    self.list()[i].setVisible(true);
                    markerCheck[i] = 0;
                    console.log(markerCheck[i]);
                }
                return self.list();

            } else {
                return ko.utils.arrayFilter(self.list(), function (item) {
                    //self.list()[0].setVisible(false);
                    //var ArrayInc = [];
                    //ArrayInc =  item.name().toLowerCase().indexOf(self.searchBox().toLowerCase()) > -1;
                    //console.log(ArrayInc.length);
                    console.log(item.id);
                    console.log(item.name());
                    console.log(item.name().toLowerCase().indexOf(self.searchBox().toLowerCase()));

                    //for (i = 0; i < self.list().length; ++i) {
                        console.log("This is item: " + item.id);
                        markerCheck[item.id - 1] = item.name().toLowerCase().indexOf(self.searchBox().toLowerCase());
                        console.log(markerCheck[item.id - 1] + " marker");
                        //if (item.name().toLowerCase().indexOf(self.searchBox().toLowerCase()) < -1 self.list()[i].name().toLowerCase())
                        //if (self.list()[i].name().toLowerCase().indexOf(self.searchBox().toLowerCase()) > -1)
                        if (self.list()[item.id - 1].name().toLowerCase().indexOf(self.searchBox().toLowerCase()) <= -1){
                            self.list()[item.id - 1].setVisible(false);
                        }
                        else{
                            self.list()[item.id - 1].setVisible(true);
                        }
                    //}
                    markerCheck.push(item.name().toLowerCase().indexOf(self.searchBox().toLowerCase()) > -1);
                    return item.name().toLowerCase().indexOf(self.searchBox().toLowerCase()) > -1;
                });
            }

        });
        $("#placesBtn").click(function () {
            $("#PLACES").toggleClass("hidden-xs");
        });
        window.onload = function () {
            self.setCurrentPlace(self.list()[0]);

        };
    };
    ko.applyBindings(new ViewModel());
}