const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getFullTrip(tripId) {
  const trip = db.getTripById(tripId);
  if (!trip) return null;

  const cities = db.listCitiesByTrip(trip.id).map((city) => {
    const activities = db.listActivitiesByCity(city.id);
    return { ...city, activities };
  });

  const totalBudget = cities.reduce(
    (sum, city) => sum + city.activities.reduce((s, a) => s + (a.cost || 0), 0),
    0
  );

  return { ...trip, cities, total_budget: totalBudget };
}

function tripSummary(trip) {
  const cities = db.listCitiesByTrip(trip.id);
  const total = cities.reduce(
    (sum, city) => sum + db.listActivitiesByCity(city.id).reduce((s, a) => s + (a.cost || 0), 0),
    0
  );
  return { ...trip, total_budget: total, city_count: cities.length };
}

// List current user's trips
router.get('/', (req, res) => {
  const trips = db.listTripsByUser(req.userId).map(tripSummary);
  res.json(trips);
});

// Create trip
router.post('/', (req, res) => {
  const { title, description, start_date, end_date, cover_color } = req.body;
  if (!title) return res.status(400).json({ error: 'Trip title is required.' });

  const trip = db.createTrip({
    user_id: req.userId,
    title,
    description,
    start_date,
    end_date,
    cover_color,
  });

  res.status(201).json(getFullTrip(trip.id));
});

// Get single trip (with cities + activities + budget)
router.get('/:id', (req, res) => {
  const trip = getFullTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId && !trip.is_public) {
    return res.status(403).json({ error: 'You do not have access to this trip.' });
  }
  res.json(trip);
});

// Update trip (title, dates, share toggle)
router.patch('/:id', (req, res) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  const fields = ['title', 'description', 'start_date', 'end_date', 'is_public', 'cover_color'];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  db.updateTrip(trip.id, updates);
  res.json(getFullTrip(trip.id));
});

// Delete trip
router.delete('/:id', (req, res) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  db.deleteTrip(trip.id);
  res.json({ success: true });
});

// Add a city stop to a trip
router.post('/:id/cities', (req, res) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  const { city_name, country, start_date, end_date } = req.body;
  if (!city_name) return res.status(400).json({ error: 'City name is required.' });

  db.addCity(trip.id, { city_name, country, start_date, end_date });
  res.status(201).json(getFullTrip(trip.id));
});

// Remove a city stop
router.delete('/:tripId/cities/:cityId', (req, res) => {
  const trip = db.getTripById(req.params.tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  db.removeCity(trip.id, req.params.cityId);
  res.json(getFullTrip(trip.id));
});

// Add an activity to a city stop
router.post('/cities/:cityId/activities', (req, res) => {
  const city = db.getCityById(req.params.cityId);
  if (!city) return res.status(404).json({ error: 'City stop not found.' });

  const trip = db.getTripById(city.trip_id);
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  const { name, category, date, cost, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Activity name is required.' });

  db.addActivity(city.id, { name, category, date, cost, notes });
  res.status(201).json(getFullTrip(trip.id));
});

// Delete an activity
router.delete('/activities/:activityId', (req, res) => {
  const activity = db.getActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ error: 'Activity not found.' });

  const city = db.getCityById(activity.trip_city_id);
  const trip = db.getTripById(city.trip_id);
  if (trip.user_id !== req.userId) return res.status(403).json({ error: 'Not your trip.' });

  db.removeActivity(activity.id);
  res.json(getFullTrip(trip.id));
});

// Budget breakdown for a trip (by city and by category)
router.get('/:id/budget', (req, res) => {
  const trip = getFullTrip(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.userId && !trip.is_public) {
    return res.status(403).json({ error: 'You do not have access to this trip.' });
  }

  const byCity = trip.cities.map((c) => ({
    city_name: c.city_name,
    total: c.activities.reduce((s, a) => s + (a.cost || 0), 0),
  }));

  const byCategory = {};
  trip.cities.forEach((c) =>
    c.activities.forEach((a) => {
      const cat = a.category || 'General';
      byCategory[cat] = (byCategory[cat] || 0) + (a.cost || 0);
    })
  );

  res.json({
    total_budget: trip.total_budget,
    by_city: byCity,
    by_category: Object.entries(byCategory).map(([category, total]) => ({ category, total })),
  });
});

module.exports = router;
