const allowedCombos = {
  "10ml": {
    "50-4-2": 4999,
    "100-3-2": 5299,
    "100-4-3": 5699,
    "150-4-3": 6899,
    "200-4-4": 10099
  },
  "30ml": {
    "50-4-2": 7099,
    "100-3-2": 9999,
    "100-4-3": 10999,
    "150-4-3": 14999,
    "200-4-4": 18999
  }
};

let selected = {
  bottle: null,
  people: null,
  scents: null,
  hours: null
};

const priceDisplay = document.getElementById("price");
const showReservationBtn = document.getElementById("show-reservation");
const reservationSection = document.getElementById("reservation-section");
const eventTypeSelect = document.getElementById("event-type");
const customEventLabel = document.getElementById("custom-event-label");

// Listen for all option button clicks
document.querySelectorAll(".option-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-type");
    const value = btn.getAttribute("data-value");

    // Set selected value
    selected[type] = value;

    // Highlight selected, unhighlight others in same group
    document.querySelectorAll(`.option-btn[data-type="${type}"]`).forEach(b => {
      b.classList.remove("active");
    });
    btn.classList.add("active");

    updateValidOptions(); // disable invalid ones
    updatePrice();
  });
});

// Show/hide custom event input
eventTypeSelect.addEventListener("change", () => {
  customEventLabel.style.display = eventTypeSelect.value === "Others" ? "block" : "none";
});

// Validate selections and calculate price
function updatePrice() {
  const { bottle, people, scents, hours } = selected;
  if (!bottle || !people || !scents || !hours) {
    priceDisplay.textContent = "₱0";
    return;
  }

  const key = `${people}-${scents}-${hours}`;
  const price = allowedCombos[bottle]?.[key];

  priceDisplay.textContent = price ? `₱${price.toLocaleString()}` : "₱0";
}

// Disable options that are not valid with selected bottle
function updateValidOptions() {
  const bottle = selected.bottle;
  if (!bottle) return;

  const validKeys = Object.keys(allowedCombos[bottle] || {});
  const validPeople = new Set(validKeys.map(k => k.split("-")[0]));
  const validScents = new Set(validKeys.map(k => k.split("-")[1]));
  const validHours = new Set(validKeys.map(k => k.split("-")[2]));

  const selectedPeople = selected.people;

  // Disable invalid hour options based on people count
  document.querySelectorAll('.option-btn[data-type="hours"]').forEach(btn => {
    const val = btn.getAttribute("data-value");

    const shouldDisable =
      (selectedPeople === "50" && (val === "3" || val === "4")) ||
      (selectedPeople === "100" && val === "4") ||
      (selectedPeople === "150" && (val === "2" || val === "4")) ||
      (selectedPeople === "200" && (val === "2" || val === "3"));

    if (shouldDisable) {
      btn.disabled = true;
      btn.classList.remove("active");
      btn.setAttribute("title", "Unavailable for selected number of people");
    } else {
      btn.removeAttribute("title");
      btn.disabled = !validHours.has(val);
    }
  });

  // Disable people options
  document.querySelectorAll('.option-btn[data-type="people"]').forEach(btn => {
    const val = btn.getAttribute("data-value");
    btn.disabled = !validPeople.has(val);
  });

  // Disable perfume sets (scents)
  document.querySelectorAll('.option-btn[data-type="scents"]').forEach(btn => {
    const val = btn.getAttribute("data-value");
    const shouldDisable = (val === "3" && selectedPeople !== "100");

    if (shouldDisable) {
      btn.disabled = true;
      btn.classList.remove("active");
      btn.setAttribute("title", "3 sets only available for 100 guests");
    } else {
      btn.removeAttribute("title");
      btn.disabled = !validScents.has(val);
    }
  });
}

// Show reservation form if combo is valid
showReservationBtn.addEventListener("click", () => {
  const price = priceDisplay.textContent;
  if (price === "₱0") {
    alert("Please choose a valid combination first.");
    return;
  }
  reservationSection.style.display = "block";
  showReservationBtn.scrollIntoView({ behavior: "smooth" });
});

// Populate hidden fields before sending form
const reservationForm = document.getElementById("reservation-form");
reservationForm.addEventListener("submit", () => {
  document.getElementById("hidden-bottle").value = selected.bottle || "";
  document.getElementById("hidden-people").value = selected.people || "";
  document.getElementById("hidden-scents").value = selected.scents || "";
  document.getElementById("hidden-hours").value = selected.hours || "";
  document.getElementById("hidden-event").value =
    eventTypeSelect.value === "Others"
      ? document.getElementById("custom-event").value
      : eventTypeSelect.value;
  document.getElementById("hidden-price").value = priceDisplay.textContent;
});
