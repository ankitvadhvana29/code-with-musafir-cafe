const express = require('express');
const db = require('../db');

const router = express.Router();

// All trips the owners have marked public, with the owner's name
router.get('/trips', (req, res) => {
  const trips = db.listPublicTrips().map((trip) => {
    const owner = db.getUserById(trip.user_id);
    const cities = db.listCitiesByTrip(trip.id);
    const total = cities.reduce(
      (sum, city) => sum + db.listActivitiesByCity(city.id).reduce((s, a) => s + (a.cost || 0), 0),
      0
    );
    return {
      ...trip,
      owner_name: owner ? owner.name : 'Unknown traveler',
      total_budget: total,
      city_count: cities.length,
    };
  });

  res.json(trips);
});

// A small built-in destination/activity catalog for the discovery/search screen.
// In production this would call a real places API - kept local here so the
// demo works with zero external API keys or network calls.
const CATALOG = [
  { type: 'city', name: 'Paris', country: 'France', tags: ['romantic', 'art', 'food'] },
  { type: 'city', name: 'Tokyo', country: 'Japan', tags: ['culture', 'food', 'technology'] },
  { type: 'city', name: 'Bali', country: 'Indonesia', tags: ['beach', 'relax', 'nature'] },
  { type: 'city', name: 'Rome', country: 'Italy', tags: ['history', 'food', 'art'] },
  { type: 'city', name: 'New York', country: 'USA', tags: ['city', 'food', 'shopping'] },
  { type: 'city', name: 'Cape Town', country: 'South Africa', tags: ['nature', 'adventure'] },
  { type: 'city', name: 'Ahmedabad', country: 'India', tags: ['heritage', 'food', 'culture'] },
  { type: 'city', name: 'Goa', country: 'India', tags: ['beach', 'relax', 'nightlife'] },
  { type: 'activity', name: 'Eiffel Tower sunset visit', city: 'Paris', avg_cost: 30 },
  { type: 'activity', name: 'Shibuya food crawl', city: 'Tokyo', avg_cost: 45 },
  { type: 'activity', name: 'Ubud rice terrace trek', city: 'Bali', avg_cost: 15 },
  { type: 'activity', name: 'Colosseum guided tour', city: 'Rome', avg_cost: 40 },
  { type: 'activity', name: 'Broadway show', city: 'New York', avg_cost: 120 },
  { type: 'activity', name: 'Table Mountain cable car', city: 'Cape Town', avg_cost: 25 },
  { type: 'activity', name: 'Sabarmati Ashram tour', city: 'Ahmedabad', avg_cost: 5 },
  { type: 'activity', name: 'Sunset beach shack dinner', city: 'Goa', avg_cost: 20 },
];

router.get('/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json(CATALOG.slice(0, 8));

  const results = CATALOG.filter((item) =>
    [item.name, item.country, item.city, ...(item.tags || [])]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q))
  );
  res.json(results);
});

module.exports = router;
