import type { ForecastDay, Alert, ClimateRiskType } from '../types';

// Define thresholds for alerts
const HEATWAVE_TEMP_THRESHOLD = 35; // Celsius
const HEATWAVE_DAYS_THRESHOLD = 3;
const FLOOD_RAIN_DAYS_THRESHOLD = 2;
const WILDFIRE_TEMP_THRESHOLD = 30; // Celsius
const WILDFIRE_SUNNY_DAYS_THRESHOLD = 3;

export const checkForAlerts = (forecast: ForecastDay[]): Alert[] => {
    if (!forecast || forecast.length < 5) {
        return [];
    }
    
    const today = new Date().toISOString().split('T')[0];
    const alerts: Alert[] = [];

    // --- Heatwave Check ---
    let consecutiveHotDays = 0;
    for (const day of forecast) {
        if (day.highTemp >= HEATWAVE_TEMP_THRESHOLD) {
            consecutiveHotDays++;
        } else {
            consecutiveHotDays = 0; // Reset counter
        }
        if (consecutiveHotDays >= HEATWAVE_DAYS_THRESHOLD) {
            alerts.push({
                id: `heatwave-${today}`,
                riskType: 'heatwave',
                title: 'Heatwave Alert',
                message: `An extended period of high temperatures (${HEATWAVE_DAYS_THRESHOLD}+ days over ${HEATWAVE_TEMP_THRESHOLD}°C) is forecast.`,
            });
            break; // Only add one heatwave alert
        }
    }
    
    // --- Flood Risk Check ---
    const rainyDays = forecast.filter(day => day.condition === 'rain').length;
    if (rainyDays >= FLOOD_RAIN_DAYS_THRESHOLD) {
        alerts.push({
            id: `flood-${today}`,
            riskType: 'flood',
            title: 'Increased Flood Risk',
            message: `Multiple days of rain (${rainyDays} days) are forecast, which may increase the risk of local flooding.`,
        });
    }

    // --- Wildfire Danger Check ---
    const hotAndDryDays = forecast.filter(day => day.highTemp >= WILDFIRE_TEMP_THRESHOLD && (day.condition === 'sunny' || day.condition === 'partlyCloudy')).length;
    if (hotAndDryDays >= WILDFIRE_SUNNY_DAYS_THRESHOLD) {
         alerts.push({
            id: `wildfire-${today}`,
            riskType: 'wildfire',
            title: 'Elevated Wildfire Danger',
            message: `A period of hot, dry weather (${hotAndDryDays} days) is forecast, increasing the risk of wildfires.`,
        });
    }

    return alerts;
};