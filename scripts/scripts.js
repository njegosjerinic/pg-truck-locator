let state = {
  locations: [],
  selectedLocation: null,
  isOverlayOpen: false,
  activeView: "list",
};

$(document).ready(function () {
  $.ajax({
    method: "GET",
    // url: "https://my.api.mockaroo.com/locations.json?key=e6f81d90",
    url: "locations.json",
    dataType: "json",
  }).done(function (response) {
    // work with response data here
    state.locations = response;
    renderLocations();
    render()
  });

  $(document).on("click", ".card", function () {
    const id = $(this).data("id");
    const location = state.locations.find((l) => l.id == id);
    state.selectedLocation = location;
    renderMap();
    console.log(state.locations);
    if (state.isOverlayOpen == true) {
      state.isOverlayOpen = false;
      render();
    }
  });

  $(document).on("click", ".more-info", function (e) {
    e.stopPropagation();

    const id = $(this).closest(".card").data("id");
    const location = state.locations.find((l) => l.id == id);
    state.selectedLocation = location;
    state.isOverlayOpen = true;
    render();
  });

  $(document).on("click", ".overlay-close, .overlay-backdrop", function () {
    state.isOverlayOpen = false;
    render();
  });

  $(document).on("click", ".btn-list", function () {
    state.activeView = "list";
    render();
  });

  $(document).on("click", ".btn-map", function () {
    state.activeView = "map";
    render();
  });

  // DEMO
  $(".map").attr(
    "src",
    "https://maps.googleapis.com/maps/api/staticmap?center=32.823943,-117.150259&key=AIzaSyCAJz__098vTeQTMMWL6nARxZhvaK9pcsg&zoom=13&scale=2&size=400x1000&maptype=roadmap&format=png&visual_refresh=true&markers=size:small%7Ccolor:0xff0000%7Clabel:1%7C32.823943,-117.150259",
  );
});

function renderLocations() {
  let locationContainer = $(".location-list");
  locationContainer.empty();
  state.locations.forEach((element) => {
    let card = `
            <div class="card" data-id="${element.id}">
                <div class="card-text">
                    <h3>${element.name}</h3>
                    <p>${element.address}</p>
                    <p>${element.city},${element.state}${element.postal_code}</p>
                </div>
                <div class="card-buttons">
                    <button>Directions</button>
                    <button class="more-info">More info</button>
                </div>
            </div>
        `;
    locationContainer.append(card);
  });
}

function renderMap() {
  if (!state.selectedLocation) return;

  const lat = state.selectedLocation.latitude;
  const lng = state.selectedLocation.longitude;

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&key=AIzaSyCAJz__098vTeQTMMWL6nARxZhvaK9pcsg&zoom=13&scale=2&size=400x1000&maptype=roadmap&format=png&visual_refresh=true&markers=size:small%7Ccolor:0xff0000%7Clabel:1%7C${lat},${lng}`;

  $(".map").attr("src", mapUrl);
}

function renderActiveCard() {
  $(".card").removeClass("active");
  if (!state.selectedLocation) return;
  $(`.card[data-id="${state.selectedLocation.id}"]`).addClass("active");
}

function renderOverlay() {
  if (!state.isOverlayOpen) {
    $(".overlay").hide();
    return;
  }

  if (!state.selectedLocation) return;

  const l = state.selectedLocation;

  $(".ov-name").text(l.name);
  $(".ov-address").text(`${l.address}, ${l.city}, ${l.state} ${l.postal_code}`);

  // ako nema phone u JSON-u možeš dodati fallback
  $(".ov-phone").text(l.phone ? l.phone : "Phone: (555) 123-4567");

  $(".ov-hours").html(`
    <p>Mon: ${l.monday_open} - ${l.monday_close}</p>
    <p>Tue: ${l.tuesday_open} - ${l.tuesday_close}</p>
    <p>Wed: ${l.wednesday_open} - ${l.wednesday_close}</p>
    <p>Thu: ${l.thursday_open} - ${l.thursday_close}</p>
    <p>Fri: ${l.friday_open} - ${l.friday_close}</p>
    <p>Sat: ${l.saturday_open} - ${l.saturday_close}</p>
    <p>Sun: CLOSED</p>
  `);

  $(".overlay").show();
}

function renderView() {
  if (window.innerWidth > 768) {
    // desktop → uvijek prikazuj oba
    $(".location-list").show();
    $(".map-wrap").show();
    return;
  }

  if (state.activeView === "list") {
    $(".location-list").show();
    $(".map-wrap").hide();
  } else {
    $(".location-list").hide();
    $(".map-wrap").show();
  }
}

function render() {
  renderView();
  renderActiveCard();
  renderMap();
  renderOverlay();
}
