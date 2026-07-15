const https  = require('https');
const R      = require('../../utils/response');
const logger = require('../../utils/logger')('weather.controller');

const WMO_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid response from weather service')); }
      });
    }).on('error', reject);
  });
}

const getCurrent = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return R.badRequest(res, 'lat and lon query params are required');
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return R.badRequest(res, 'Invalid coordinates');
    }

    logger.debug('fetching weather', { lat, lon });

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
      `&timezone=Asia%2FKolkata&forecast_days=1`;

    const data = await fetchJson(url);
    const c    = data.current;

    const result = {
      latitude:             lat,
      longitude:            lon,
      timezone:             data.timezone,
      temperature:          c.temperature_2m,
      feels_like:           c.apparent_temperature,
      humidity:             c.relative_humidity_2m,
      wind_speed:           c.wind_speed_10m,
      precipitation:        c.precipitation,
      weather_code:         c.weather_code,
      condition:            WMO_CODES[c.weather_code] || 'Unknown',
      unit_temperature:     data.current_units?.temperature_2m || '°C',
      unit_wind_speed:      data.current_units?.wind_speed_10m || 'km/h',
      unit_precipitation:   data.current_units?.precipitation  || 'mm',
      observed_at:          c.time,
    };

    logger.info('weather fetched', { lat, lon, condition: result.condition, temp: result.temperature });
    return R.success(res, 'Weather fetched successfully', result);
  } catch (e) {
    logger.error('weather fetch failed', { error: e.message });
    next(e);
  }
};

module.exports = { getCurrent };
