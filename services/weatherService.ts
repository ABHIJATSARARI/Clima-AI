import type { Location, ForecastDay } from '../types';

// WMO Weather interpretation codes
// Sourced from: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
const weatherCodeMap: Record<number, ForecastDay['condition']> = {
    0: 'sunny', // Clear sky
    1: 'sunny', // Mainly clear
    2: 'partlyCloudy', // Partly cloudy
    3: 'cloudy', // Overcast
    45: 'cloudy', // Fog
    48: 'cloudy', // Depositing rime fog
    51: 'rain', // Drizzle: Light
    53: 'rain', // Drizzle: Moderate
    55: 'rain', // Drizzle: Dense intensity
    61: 'rain', // Rain: Slight
    63: 'rain', // Rain: Moderate
    65: 'rain', // Rain: Heavy intensity
    80: 'rain', // Rain showers: Slight
    81: 'rain', // Rain showers: Moderate
    82: 'rain', // Rain showers: Violent
    95: 'rain', // Thunderstorm: Slight or moderate
    96: 'rain', // Thunderstorm with slight hail
    99: 'rain', // Thunderstorm with heavy hail
};

const mapWeatherCodeToCondition = (code: number): ForecastDay['condition'] => {
    return weatherCodeMap[code] || 'partlyCloudy'; // Default to partly cloudy for unhandled codes
};


export const getWeatherForecast = async (location: Location, unit: 'celsius' | 'fahrenheit' = 'celsius'): Promise<ForecastDay[]> => {
    const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        temperature_unit: unit,
        timezone: 'auto',
        forecast_days: '5'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (!data.daily || !data.daily.time) {
            throw new Error("Invalid data format from weather API");
        }

        const forecast: ForecastDay[] = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < 5; i++) {
            const date = new Date(data.daily.time[i]);
            forecast.push({
                day: days[date.getUTCDay()],
                highTemp: Math.round(data.daily.temperature_2m_max[i]),
                lowTemp: Math.round(data.daily.temperature_2m_min[i]),
                condition: mapWeatherCodeToCondition(data.daily.weathercode[i])
            });
        }
        return forecast;
    } catch (error) {
        console.error("Failed to fetch weather forecast:", error);
        // Re-throw a user-friendly error to be handled by the component
        throw new Error("Could not load weather forecast at this time.");
    }
};