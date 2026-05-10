import { Router } from 'express';
import axios from 'axios';
import { sendResponse } from '../utils/response';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Search cities (using GeoDB or fallback)
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit = '10', offset = '0' } = req.query as Record<string, string>;
    if (!q) throw new ApiError(400, 'Search query is required');

    if (process.env.GEODB_API_KEY) {
      const response = await axios.get(`${process.env.GEODB_BASE_URL}/geo/cities`, {
        params: { namePrefix: q, limit, offset, sort: '-population', types: 'CITY' },
        headers: {
          'X-RapidAPI-Key': process.env.GEODB_API_KEY,
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
        },
        timeout: 5000,
      });

      sendResponse({ res, message: 'Cities found', data: response.data });
    } else {
      // Fallback: return common cities
      const cities = [
        { city: 'Paris', country: 'France', countryCode: 'FR', population: 2148000 },
        { city: 'London', country: 'United Kingdom', countryCode: 'GB', population: 8982000 },
        { city: 'New York', country: 'United States', countryCode: 'US', population: 8336817 },
        { city: 'Tokyo', country: 'Japan', countryCode: 'JP', population: 13960000 },
        { city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', population: 3331000 },
        { city: 'Barcelona', country: 'Spain', countryCode: 'ES', population: 1620343 },
        { city: 'Rome', country: 'Italy', countryCode: 'IT', population: 2873000 },
        { city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', population: 821752 },
        { city: 'Singapore', country: 'Singapore', countryCode: 'SG', population: 5850342 },
        { city: 'Bangkok', country: 'Thailand', countryCode: 'TH', population: 10539000 },
        { city: 'Istanbul', country: 'Turkey', countryCode: 'TR', population: 15462452 },
        { city: 'Sydney', country: 'Australia', countryCode: 'AU', population: 5312000 },
        { city: 'Toronto', country: 'Canada', countryCode: 'CA', population: 2731571 },
        { city: 'Bali', country: 'Indonesia', countryCode: 'ID', population: 4225000 },
        { city: 'Lisbon', country: 'Portugal', countryCode: 'PT', population: 547773 },
      ].filter((c) => c.city.toLowerCase().includes(q.toLowerCase()));

      sendResponse({ res, message: 'Cities found', data: { data: cities } });
    }
  } catch (error) { next(error); }
});

// Get Unsplash image for a city
router.get('/image/:city', async (req, res, next) => {
  try {
    const { city } = req.params;

    if (process.env.UNSPLASH_ACCESS_KEY) {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: `${city} city travel`, per_page: 1, orientation: 'landscape' },
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
        timeout: 5000,
      });

      const photo = response.data.results[0];
      sendResponse({
        res,
        message: 'Image found',
        data: photo ? { url: photo.urls.regular, thumb: photo.urls.thumb, credit: photo.user.name } : null,
      });
    } else {
      // Fallback to Picsum
      sendResponse({
        res,
        message: 'Image found',
        data: { url: `https://picsum.photos/seed/${encodeURIComponent(city)}/800/400`, thumb: `https://picsum.photos/seed/${encodeURIComponent(city)}/400/200` },
      });
    }
  } catch (error) { next(error); }
});

export default router;
