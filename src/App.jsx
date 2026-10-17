import React, { useState } from "react";
import "./styles/App.css";
import "./styles/Home.css";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Spinner from "./components/Spinner";

function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  );
  const [hasSearched, setHasSearched] = useState(false);


  const handleSearch = async (city) => {
    setError(null);
    setLocation(null);
    setWeather(null);
    setLoading(true);
    setHasSearched(true);


    try {
      // Get lat/lon
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("City not found. Try again!");
        setLoading(false);
        return;
      }

      const place = data.results[0];
      const newLocation = {
        name: place.name,
        country: place.country,
        latitude: place.latitude,
        longitude: place.longitude,
      };
      setLocation(newLocation);

      // Save recent search (avoid duplicates, keep latest first)
      setRecentSearches((prev) => {
        const updated = [city, ...prev.filter((c) => c !== city)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
        return updated;
      });

      // Fetch current weather
      const weatherResp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
      );
      const weatherJson = await weatherResp.json();

      if (!weatherJson.current_weather) {
        setError("Weather data not available for this location.");
        setLoading(false);
        return;
      }

      const current = weatherJson.current_weather;

      // Convert temperature °C → °F
      const tempF = ((current.temperature * 9) / 5 + 32).toFixed(1);

      // Convert windspeed km/h → mph
      const windMph = (current.windspeed / 1.609).toFixed(1);

      // Wind direction
      const directions = [
        "North",
        "Northeast",
        "East",
        "Southeast",
        "South",
        "Southwest",
        "West",
        "Northwest",
      ];
      const windDir = directions[Math.round(current.winddirection / 45) % 8];

      // Weather code description
      const codeMap = {
        0: "Clear sky",
        1: "Mostly sunny",
        2: "Clouds and Sun, partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        61: "Rain showers",
        71: "Snowfall",
        80: "Scattered showers",
        95: "Thunderstorm",
      };

      // Find closest humidity value
      let humidityValue = null;
      if (weatherJson.hourly && weatherJson.hourly.time) {
        let closestIndex = 0;
        let minDiff = Infinity;
        weatherJson.hourly.time.forEach((t, idx) => {
          const diff = Math.abs(new Date(t) - new Date(current.time));
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });
        humidityValue = weatherJson.hourly.relativehumidity_2m[closestIndex];
      }

      setWeather({
        temperature: current.temperature,
        temperatureF: tempF,
        windspeed: current.windspeed,
        windspeedMph: windMph,
        windDirection: windDir,
        humidity: humidityValue,
        time: current.time,
        weathercode: current.weathercode,
        weathercodeDescription: codeMap[current.weathercode] || "Unknown",
      });
    } catch (err) {
      if (err.message === "Failed to fetch" || err.message.includes("NetworkError")) {
        setError("Network issue! Please check your internet connection.");
      } 
      else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Weather App 🌦️</h1>
      <SearchBar onSearch={handleSearch} />

      {loading && <Spinner />}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {hasSearched && recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3><i>Recent Searches:</i></h3>
            <ul>
              {recentSearches.map((city, index) => (
                <li key={index}>
                  <button onClick={() => handleSearch(city)}>{city}</button>
                </li>
              ))}
            </ul>
        </div>
      )}


      {location && weather && !loading && (
        <WeatherCard location={location} weather={weather} />
      )}
    </div>
  );
}

export default App;
