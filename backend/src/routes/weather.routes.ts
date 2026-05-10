import { Router } from 'express';
import axios from 'axios';
import { sendResponse } from '../utils/response';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/:city', async (req, res, next) => {
  try {
    const { city } = req.params;
    const { units = 'metric' } = req.query as { units: string };

    if (process.env.OPENWEATHER_API_KEY) {
      const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units,
        },
        timeout: 5000,
      });

      const data = response.data;
      sendResponse({
        res,
        message: 'Weather data retrieved',
        data: {
          city: data.name,
          country: data.sys.country,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          windSpeed: data.wind.speed,
          units,
        },
      });
    } else {
      // Fallback mock weather data
      sendResponse({
        res,
        message: 'Weather data retrieved',
        data: {
          city,
          temperature: 22,
          feelsLike: 20,
          humidity: 65,
          description: 'partly cloudy',
          icon: 'https://openweathermap.org/img/wn/02d@2x.png',
          windSpeed: 10,
          units,
          isMock: true,
        },
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      next(new ApiError(404, 'City not found'));
    } else {
      next(error);
    }
  }
});

export default router;
