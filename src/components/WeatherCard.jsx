import React from "react";
import "../styles/WeatherCard.css";

function WeatherCard({ location, weather }) {
  if (!weather || !location) return null;

  return (
    <div className="weather-card">
      <h2>
        {location.name}, {location.country}
      </h2>
      <h3>Current Weather Details</h3>

      <p>
        <strong>Windspeed:</strong> {weather.windspeed} km/h ({weather.windspeedMph} mph){" "}
        {weather.windDirection}
      </p>
      <p>
        <strong>Temperature:</strong> {weather.temperature}°C ({weather.temperatureF}°F)
      </p>
      <p>
        <strong>Humidity:</strong> {weather.humidity ? `${weather.humidity}%` : "N/A"}
      </p>
      <p>
        <strong>Condition:</strong> {weather.weathercodeDescription}
      </p>
    </div>
  );
}

export default WeatherCard;
