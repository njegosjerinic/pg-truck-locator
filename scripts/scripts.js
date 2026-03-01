let state = {
  locations: [],
  selectedLocation: null,
  isActiveLocation: null,
  isOverlayOpen: false,
  activeView: "list",
};

const now = new Date(
  new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  }),
);

const dayIndex = now.getDay();

$(document).ready(function () {
  $.ajax({
    method: "GET",
    url: "https://my.api.mockaroo.com/locations.json?key=e6f81d90",
    dataType: "json",
  }).done(function (response) {
    state.locations = response;
    console.log(response);
    renderLocations();
    render();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          state.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          calculateAllDistances();
          renderLocations();
          render();
        },
        function () {
          renderLocations();
          render();
        },
      );
    } else {
      renderLocations();
      render();
    }
  });

  $(document).on("click", ".card", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const id = $(this).data("id");
    const location = state.locations.find((l) => l.id == id);
    state.selectedLocation = location;
    state.isActiveLocation = null;
    $(".placeholder").hide();
    console.log(now);
    renderMap();
    if (window.innerWidth < 782) {
      state.activeView = "map";
      console.log(state.activeView);
      renderView();
      renderButtons();
    }
    if (state.isOverlayOpen == true) {
      state.isOverlayOpen = false;
      render();
    }
  });

  $(document).on("click", ".more-info", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(".placeholder").hide();
    const id = $(this).closest(".card").data("id");
    const location = state.locations.find((l) => l.id == id);
    state.isActiveLocation = location;
    state.selectedLocation = location;
    state.isOverlayOpen = true;
    state.activeView = "map";
    render();
  });

  $(document).on("click", ".overlay-closer, .overlay-backdrop", function () {
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
    const location =
      state.locations.find((l) => l.id == id) || state.selectedLocation;
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
            <p>${element.distance ? element.distance + " mi" : ""}</p>
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
    <table class="hours-table">
      <tr data-day = "1" >
      <th>Mon:</th>
        <td>${l.monday_open} - ${l.monday_close}</td>
      </tr>
      <tr data-day = "2">
      <th>Tue:</th>
        <td>${l.tuesday_open} - ${l.tuesday_close}</td>
      </tr>
      <tr data-day = "3">
        <th>Wed:</th>
        <td>${l.wednesday_open} - ${l.wednesday_close}</td>
      </tr>
      <tr data-day = "4">
        <th>Thu:</th>
        <td>${l.thursday_open} - ${l.thursday_close}</td>
      </tr>
      <tr data-day = "5">
        <th>Fri:</th>
        <td>${l.friday_open} - ${l.friday_close}</td>
      </tr>
      <tr data-day = "6">
        <th>Sat:</th>
        <td>${l.saturday_open} - ${l.saturday_close}</td>
      </tr>
      <tr data-day = "0">
        <th>Sun:</th>
        <td>${l.sunday_open} - ${l.sunday_close}</td>
      </tr>
    </table>
  `);

  const dayIndex = now.getDay();

  // ukloni prethodni highlight (sigurnost)
  $(".hours-table tr").removeClass("active-day");

  // pronađi red koji odgovara današnjem danu
  $(`.hours-table tr[data-day="${dayIndex}"]`).addClass("active-day");

  $(".overlay").show();
}

function renderView() {
  if (window.innerWidth > 600) {
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
  const dayIndex = now.getDay();

  console.log(dayIndex);

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

  let isOpen = false;

  if (closeMinutes < openMinutes) {
    // radi preko ponoći
    if (nowMinutes >= openMinutes || nowMinutes <= closeMinutes) {
      isOpen = true;
    }
  } else {
    if (nowMinutes >= openMinutes && nowMinutes <= closeMinutes) {
      isOpen = true;
    }
  }

  if (isOpen) {
    return { text: `Open until ${close}`, type: "open" };
  }

  return { text: `Closed until ${open}`, type: "closed" };
}

function calculateAllDistances() {
  if (!state.userLocation) return;

  state.locations.forEach((loc) => {
    if (!loc.latitude || !loc.longitude) return;

    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    loc.distance = getDistanceInMiles(
      state.userLocation.lat,
      state.userLocation.lng,
      lat,
      lng,
    ).toFixed(1);
  });
}

function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function render() {
  renderButtons();
  renderView();
  renderActiveCard();
  renderMap();
  renderOverlay();
}
