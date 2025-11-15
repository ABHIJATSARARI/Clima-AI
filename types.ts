export interface Location {
  latitude: number;
  longitude: number;
  // A simplified representation of the location name
  displayName: string; 
}

export type ClimateRiskType = 'flood' | 'heatwave' | 'drought' | 'wildfire';

export type ActionItemStatus = 'To Do' | 'In Progress' | 'Completed';

export interface ActionItem {
  title: string;
  description: string;
  category: 'Home' | 'Community' | 'Farming' | 'Conservation';
  priority: 'High' | 'Medium' | 'Low';
  resources?: { title: string; url: string; }[];
  status: ActionItemStatus;
}

export interface ActionPlan {
  summary: string;
  items: ActionItem[];
}

export interface RiskData {
  actionPlan: ActionPlan;
  futureProjection?: { year: string; value: number; }[];
  historicalData?: { data: { year: string; value: number }[]; label: string; unit: string; };
}

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  category: 'Energy' | 'Water' | 'Waste' | 'Transport';
  completed: boolean;
}

export interface ForecastDay {
  day: string;
  highTemp: number;
  lowTemp: number;
  condition: 'sunny' | 'cloudy' | 'rain' | 'partlyCloudy';
}

// New types for structured community comparison
export interface RiskComparisonItem {
  riskType: ClimateRiskType;
  myLocationScore: number; // Score from 1-10
  otherLocationScore: number; // Score from 1-10
}

export interface ComparisonData {
  summary: string;
  comparison: RiskComparisonItem[];
}

// New type for user profile context
export interface UserProfile {
  homeType: 'house' | 'apartment' | 'other' | '';
  householdDetails: ('pets' | 'children' | 'elderly')[];
  localEnvironment: ('river' | 'forest' | 'denseUrban' | 'coastal')[];
}

// New type for proactive alerts
export interface Alert {
  id: string; // Unique ID for dismissal tracking, e.g., 'heatwave-2023-10-27'
  riskType: ClimateRiskType;
  title: string;
  message: string;
}

// New type for chat messages
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'tool';
  text: string;
  // Optional field to indicate a tool call is in progress for this message
  toolCall?: { id: string, name: string, args: any };
}

// New type for AI tool status
export type AiToolStatus = 'idle' | 'thinking' | 'using_tool';


export type ActiveView = 'dashboard' | 'riskDetail' | 'community' | 'challenges' | 'profile' | 'settings' | 'chat';