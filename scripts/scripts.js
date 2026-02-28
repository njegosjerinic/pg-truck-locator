let state = {
  locations: [],
  selectedLocation: null,
  isActiveLocation: null,
  isOverlayOpen: false,
  activeView: "list",
};

$(document).ready(function () {
  $.ajax({
    method: "GET",
    url: "https://my.api.mockaroo.com/locations.json?key=e6f81d90",
    dataType: "json",
  }).done(function (response) {
    // work with response data here
    state.locations = response;
    renderLocations();
    render();
  });

  $(document).on("click", ".card", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).data("id");
    const location = state.locations.find((l) => l.id == id);
    state.selectedLocation = location;
    state.isActiveLocation = null;
    $('.placeholder').hide();
    renderMap();
    if (window.innerWidth < 782) {
      state.activeView = "map";
      renderView();
      
    }
    if (state.isOverlayOpen == true) {
      state.isOverlayOpen = false;
      render();
    }
  });

  $(document).on("click", ".more-info", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('.placeholder').hide();
    const id = $(this).closest(".card").data("id");
    const location = state.locations.find((l) => l.id == id);
    state.isActiveLocation = location;
    state.selectedLocation = location;
    state.isOverlayOpen = true;
    if (window.innerWidth < 782) {
      state.activeView = "map";
      renderView();
    }
    renderView();
    render();
  });

  $(document).on("click", ".overlay-close, .overlay-backdrop", function () {
    state.isOverlayOpen = false;
    state.isActiveLocation = null;
    render();
  });

  $(document).on("click", ".btn-list", function () {
    state.activeView = "list";
    renderButtons();
    render();
  });

  $(document).on("click", ".btn-map", function () {
    state.activeView = "map";
    renderButtons();
    render();
  });

  $(document).on("click", ".btn-directions, .ov-directions", function (e) {
    e.preventDefault();
    const id = $(this).closest(".card").data("id");
    const location = state.locations.find((l) => l.id == id);
    state.selectedLocation = location;

    if (!state.selectedLocation) return;

    const l = state.selectedLocation;

    const destination = encodeURIComponent(
      `${l.address}, ${l.city}, ${l.state} ${l.postal_code}`,
    );

    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    window.open(url, "_blank", "noopener,noreferrer");
  });

  $(window).on("resize", function () {
    renderView();
  });

  $(document).on("click", ".ov-details", function () {
    if (!state.selectedLocation) return;

    const url = state.selectedLocation.url;

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  });


});

function renderLocations() {
  let locationContainer = $(".location-list");
  locationContainer.empty();

  state.locations.forEach((element) => {
    const status = getOpenStatus(element);

    let card = `
      <div class="card" data-id="${element.id}">
        <div class="card-text">
          <div class="card-head">
            <h3>${element.name}</h3>
          </div>

          <p>${element.address}</p>
          <p>${element.city}, ${element.state} ${element.postal_code}</p>

          <p class="status ${status.type}">
            ${status.text}
          </p>

          <div class="card-bottom">
            <img src="assets/phone-icon.png" />
            <p>${element.phone ? element.phone : "(555) 123-4567"}</p>
          </div>
        </div>

        <div class="card-buttons">
          <button class="btn-directions">DIRECTIONS</button>
          <button class="more-info">MORE INFO</button>
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
  if (!state.isActiveLocation) return;
  $(`.card[data-id="${state.isActiveLocation.id}"]`).addClass("active");
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

  $(".ov-phone").text(l.phone ? l.phone : "Phone: (555) 123-4567");

  $(".ov-hours").html(`
    <div>
    <p>Mon:</p> <p>${l.monday_open} - ${l.monday_close}</p>
    </div>
    <div>
    <p>Tue:</p> <p>${l.tuesday_open} - ${l.tuesday_close}</p>
    </div>
    <div>
    <p>Wed:</p> <p>${l.wednesday_open} - ${l.wednesday_close}</p>
    </div>
    <div>
    <p>Thu:</p> <p>${l.thursday_open} - ${l.thursday_close}</p>
    </div>
    <div>
    <p>Fri:</p> <p>${l.friday_open} - ${l.friday_close}</p>
    </div>
    <div>
    <p>Sat:</p> <p>${l.saturday_open} - ${l.saturday_close}</p>
    </div>
    <div>
    <p>Sun:</p> <p>CLOSED</p>
    </div>
  `);

  $(".overlay").show();
}

function renderView() {
  if (window.innerWidth > 768) {
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

function renderButtons() {
  $(".btn-list, .btn-map").removeClass("active-button");
  if (state.activeView === "list") $(".btn-list").addClass("active-button");
  if (state.activeView === "map") $(".btn-map").addClass("active-button");
}

function getOpenStatus(location) {
  const now = new Date();
  const dayIndex = now.getDay();

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = days[dayIndex];

  const open = location[`${today}_open`];
  const close = location[`${today}_close`];

  if (!open || !close) {
    return { text: "Closed", type: "closed" };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function convertToMinutes(timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");

    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  const openMinutes = convertToMinutes(open);
  const closeMinutes = convertToMinutes(close);

  if (nowMinutes >= openMinutes && nowMinutes <= closeMinutes) {
    return { text: `Open until ${close}`, type: "open" };
  }

  if (nowMinutes < openMinutes) {
    return { text: `Opens at ${open}`, type: "soon" };
  }

  return { text: "Closed", type: "closed" };
}

function render() {
  renderButtons();
  renderView();
  renderActiveCard();
  renderMap();
  renderOverlay();
}
