var mapObject = {
  map: null,
  marker: null,
  heightMapCanvas: "",
  setHeightContent: function () {
    var $content = $("#map_canvas");
    var mapCanvasTop = $content.offset().top;
    this.heightMapCanvas = $(window).height() - mapCanvasTop;
    $content.height(this.heightMapCanvas);
    if (this.map) {
      this.map.setCenter(this.getLatLng());
      google.maps.event.trigger(map_canvas, 'resize');
    }
  },
  render: function () {
    this.setHeightContent();
    if (this.map == null) {
      this.loadMap();
    }
    else {
      this.setMarker();
    }
  },
  setMarker: function () {
    var latlng = this.getLatLng();
    _self = this;
    if (this.marker) {
      this.marker.setPosition(latlng);
    }
    else {
      this.marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: latlng,
        draggable: true,
        map: _self.map
      });
    }
    var point = this.marker.getPosition();
    this.map.panTo(point);
    google.maps.event.trigger(map_canvas, 'resize');
  },
  getLatLng: function () {
    var lat = $("#mark_lat").val();
    var lng = $("#mark_lng").val();
    var latlng = new google.maps.LatLng(lat, lng);
    return latlng;
  },
  loadMap: function () {
    var $content = $("#map_canvas");
    var mapCanvas = $content[0];

    var options = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(mapCanvas, options);

    this.setMarker();
    _self = this;

    google.maps.event.addListener(_self.marker, 'dragend', function () {
      var point = _self.marker.getPosition();
      var lat = point.lat();
      var lng = point.lng();
      $("#updatelolat").val(lat);
      $("#updatelolng").val(lng);
      $("#updatelolat_online").val(lat);
      $("#updatelolng_online").val(lng);
      $("#lat").val(lat);
      $("#lng").val(lng);
      $("#mark_lat").val(lat);
      $("#mark_lng").val(lng);
      _self.map.panTo(point);
    });
  }
};