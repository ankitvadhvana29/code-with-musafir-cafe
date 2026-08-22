// Pure-JS JSON file "database" - no native compilation needed (works on any
// Windows machine without Python / Visual Studio Build Tools installed).
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'globaltrotters.json');

function emptyState() {
  return {
    users: [],
    trips: [],
    tripCities: [],
    activities: [],
    nextId: { users: 1, trips: 1, tripCities: 1, activities: 1 },
  };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    const state = emptyState();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
    return state;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return emptyState();
  }
}

let state = load();

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

function nextId(table) {
  const id = state.nextId[table];
  state.nextId[table] += 1;
  return id;
}

const db = {
  // ---- users ----
  createUser({ name, email, password }) {
    const user = { id: nextId('users'), name, email, password, created_at: new Date().toISOString() };
    state.users.push(user);
    save();
    return user;
  },
  getUserByEmail(email) {
    return state.users.find((u) => u.email === email) || null;
  },
  getUserById(id) {
    return state.users.find((u) => u.id === Number(id)) || null;
  },

  // ---- trips ----
  createTrip({ user_id, title, description, start_date, end_date, cover_color }) {
    const trip = {
      id: nextId('trips'),
      user_id,
      title,
      description: description || '',
      start_date: start_date || null,
      end_date: end_date || null,
      cover_color: cover_color || '#E8794A',
      is_public: 0,
      created_at: new Date().toISOString(),
    };
    state.trips.push(trip);
    save();
    return trip;
  },
  getTripById(id) {
    return state.trips.find((t) => t.id === Number(id)) || null;
  },
  listTripsByUser(userId) {
    return state.trips
      .filter((t) => t.user_id === Number(userId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  listPublicTrips() {
    return state.trips
      .filter((t) => t.is_public)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  updateTrip(id, fields) {
    const trip = db.getTripById(id);
    if (!trip) return null;
    Object.assign(trip, fields);
    save();
    return trip;
  },
  deleteTrip(id) {
    const tripId = Number(id);
    const cityIds = state.tripCities.filter((c) => c.trip_id === tripId).map((c) => c.id);
    state.activities = state.activities.filter((a) => !cityIds.includes(a.trip_city_id));
    state.tripCities = state.tripCities.filter((c) => c.trip_id !== tripId);
    state.trips = state.trips.filter((t) => t.id !== tripId);
    save();
  },

  // ---- trip cities ----
  addCity(tripId, { city_name, country, start_date, end_date }) {
    const siblings = state.tripCities.filter((c) => c.trip_id === Number(tripId));
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.order_index), -1);
    const city = {
      id: nextId('tripCities'),
      trip_id: Number(tripId),
      city_name,
      country: country || '',
      start_date: start_date || null,
      end_date: end_date || null,
      order_index: maxOrder + 1,
    };
    state.tripCities.push(city);
    save();
    return city;
  },
  getCityById(id) {
    return state.tripCities.find((c) => c.id === Number(id)) || null;
  },
  listCitiesByTrip(tripId) {
    return state.tripCities
      .filter((c) => c.trip_id === Number(tripId))
      .sort((a, b) => a.order_index - b.order_index);
  },
  removeCity(tripId, cityId) {
    const cId = Number(cityId);
    state.activities = state.activities.filter((a) => a.trip_city_id !== cId);
    state.tripCities = state.tripCities.filter((c) => !(c.id === cId && c.trip_id === Number(tripId)));
    save();
  },

  // ---- activities ----
  addActivity(cityId, { name, category, date, cost, notes }) {
    const activity = {
      id: nextId('activities'),
      trip_city_id: Number(cityId),
      name,
      category: category || 'General',
      date: date || null,
      cost: Number(cost) || 0,
      notes: notes || '',
    };
    state.activities.push(activity);
    save();
    return activity;
  },
  getActivityById(id) {
    return state.activities.find((a) => a.id === Number(id)) || null;
  },
  listActivitiesByCity(cityId) {
    return state.activities
      .filter((a) => a.trip_city_id === Number(cityId))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  },
  removeActivity(id) {
    state.activities = state.activities.filter((a) => a.id !== Number(id));
    save();
  },
};

module.exports = db;
