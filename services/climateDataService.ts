import type { Location, ClimateRiskType } from '../types';

export interface ChartDataPoint {
    year: string;
    value: number;
}

export interface HistoricalData {
    data: ChartDataPoint[];
    label: string;
    unit: string;
}

// Define thresholds
const HEATWAVE_THRESHOLD_C = 35; // Celsius
const HEAVY_RAIN_THRESHOLD_MM = 20; // mm
const WILDFIRE_TEMP_THRESHOLD_C = 30; // Celsius
const WILDFIRE_PRECIP_THRESHOLD_MM = 1; // mm

export const getHistoricalData = async (location: Location, riskType: ClimateRiskType): Promise<HistoricalData> => {
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() - 1); // Get data up to the end of last year
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 4); // Get 5 years of data
    
    const formattedStartDate = `${startDate.getFullYear()}-01-01`;
    const formattedEndDate = `${endDate.getFullYear()}-12-31`;

    const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        daily: 'temperature_2m_max,precipitation_sum,temperature_2m_mean',
        timezone: 'auto'
    });

    const url = `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const apiData = await response.json();

        if (!apiData.daily || !apiData.daily.time) {
             throw new Error("Invalid data format from API");
        }

        // Process data into yearly aggregates
        const yearlyTemp: Record<string, number[]> = {};
        const yearlyPrecip: Record<string, number[]> = {};
        const yearlyMeanTemp: Record<string, number[]> = {};

        apiData.daily.time.forEach((dateStr: string, index: number) => {
            const year = dateStr.substring(0, 4);
            if (!yearlyMeanTemp[year]) {
                yearlyMeanTemp[year] = [];
                yearlyTemp[year] = [];
                yearlyPrecip[year] = [];
            }
            yearlyMeanTemp[year].push(apiData.daily.temperature_2m_mean[index]);
            yearlyTemp[year].push(apiData.daily.temperature_2m_max[index]);
            yearlyPrecip[year].push(apiData.daily.precipitation_sum[index]);
        });

        let result: HistoricalData;

        switch (riskType) {
            case 'heatwave': {
                const yearlyAverages = Object.entries(yearlyMeanTemp).map(([year, temps]) => {
                    const sum = temps.reduce((a, b) => a + b, 0);
                    return { year, avg: sum / temps.length };
                });
        
                const totalAvgSum = yearlyAverages.reduce((sum, item) => sum + item.avg, 0);
                const baselineAvg = totalAvgSum / yearlyAverages.length;

                result = {
                    label: 'Annual Temperature Anomaly',
                    unit: '°C',
                    data: yearlyAverages.map(item => ({
                        year: item.year,
                        value: parseFloat((item.avg - baselineAvg).toFixed(2))
                    })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
                };
                break;
            }
            case 'flood': {
                const yearlyValues = Object.keys(yearlyPrecip).map(year => ({
                    year,
                    value: yearlyPrecip[year].filter(precip => precip > HEAVY_RAIN_THRESHOLD_MM).length
                }));
                const baselineAvg = yearlyValues.reduce((sum, item) => sum + item.value, 0) / yearlyValues.length;

                result = {
                    label: 'Heavy Rain Days Anomaly',
                    unit: ' days',
                    data: yearlyValues.map(item => ({
                        year: item.year,
                        value: parseFloat((item.value - baselineAvg).toFixed(1))
                    })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
                };
                break;
            }
            case 'drought': {
                 const yearlyValues = Object.keys(yearlyPrecip).map(year => ({
                    year,
                    value: yearlyPrecip[year].reduce((a, b) => a + b, 0)
                }));
                const baselineAvg = yearlyValues.reduce((sum, item) => sum + item.value, 0) / yearlyValues.length;
                
                result = {
                    label: 'Annual Precipitation Anomaly',
                    unit: 'mm',
                    data: yearlyValues.map(item => ({
                        year: item.year,
                        value: parseFloat((item.value - baselineAvg).toFixed(1))
                    })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
                };
                break;
            }
            case 'wildfire': {
                const yearlyValues = Object.keys(yearlyTemp).map(year => {
                    const dailyTemp = yearlyTemp[year];
                    const dailyPrecip = yearlyPrecip[year];
                    let riskDays = 0;
                    for(let i=0; i<dailyTemp.length; i++){
                        if(dailyTemp[i] > WILDFIRE_TEMP_THRESHOLD_C && dailyPrecip[i] < WILDFIRE_PRECIP_THRESHOLD_MM){
                            riskDays++;
                        }
                    }
                    return { year, value: riskDays };
                });
                const baselineAvg = yearlyValues.reduce((sum, item) => sum + item.value, 0) / yearlyValues.length;

                 result = {
                    label: 'High-Risk Wildfire Days Anomaly',
                    unit: ' days',
                    data: yearlyValues.map(item => ({
                        year: item.year,
                        value: parseFloat((item.value - baselineAvg).toFixed(1))
                    })).sort((a, b) => parseInt(a.year) - parseInt(b.year))
                };
                break;
            }
            default:
                throw new Error("Unknown risk type");
        }
        
        return result;

    } catch (error) {
        console.error("Failed to fetch historical climate data:", error);
        throw error; // Re-throw to be handled by the component
    }
};