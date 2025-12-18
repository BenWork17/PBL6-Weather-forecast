import requests
import json
from datetime import datetime

def test_weather_api():
    """Test OpenWeatherMap API"""
    api_key = "5d254dd6acc8d4ff0f338e2d3256f013"
    lat = 16.0544  # Đà Nẵng
    lon = 108.2022
    
    # Test current weather
    current_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    print(f"\nTesting current weather API: {current_url}")
    current_response = requests.get(current_url)
    print(f"Status code: {current_response.status_code}")
    if current_response.status_code == 200:
        current_data = current_response.json()
        print("\nCurrent weather data:")
        print(f"Time: {datetime.fromtimestamp(current_data['dt'])}")
        print(f"Temperature: {current_data['main']['temp']}°C")
        print(f"Pressure: {current_data['main']['pressure']} hPa")
        print(f"Humidity: {current_data['main']['humidity']}%")
        print(f"Wind speed: {current_data['wind']['speed']} m/s")
        print(f"Clouds: {current_data['clouds']['all']}%")
        print(f"Weather: {current_data['weather'][0]['main']}")
        print(f"Description: {current_data['weather'][0]['description']}")
    else:
        print(f"Error: {current_response.text}")
    
    # Test forecast
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    print(f"\nTesting forecast API: {forecast_url}")
    forecast_response = requests.get(forecast_url)
    print(f"Status code: {forecast_response.status_code}")
    if forecast_response.status_code == 200:
        forecast_data = forecast_response.json()
        print("\nForecast data:")
        for item in forecast_data['list'][:5]:  # Show first 5 forecasts
            print(f"\nTime: {datetime.fromtimestamp(item['dt'])}")
            print(f"Temperature: {item['main']['temp']}°C")
            print(f"Pressure: {item['main']['pressure']} hPa")
            print(f"Humidity: {item['main']['humidity']}%")
            print(f"Wind speed: {item['wind']['speed']} m/s")
            print(f"Clouds: {item['clouds']['all']}%")
            print(f"Weather: {item['weather'][0]['main']}")
            print(f"Description: {item['weather'][0]['description']}")
    else:
        print(f"Error: {forecast_response.text}")

if __name__ == "__main__":
    test_weather_api() 