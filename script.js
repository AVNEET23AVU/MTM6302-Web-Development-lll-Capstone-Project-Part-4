const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API Key
const cities = [
    { name: 'New York', country: 'United States' },
    { name: 'London', country: 'United Kingdom' },
    { name: 'Tokyo', country: 'Japan' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Toronto', country: 'Canada' },
    { name: 'Mumbai', country: 'India' },
    { name: 'Cairo', country: 'Egypt' }
];

let currentCity = {};
let actualTemperature = 0;
let score = 0;
let timeLeft = 10;
let timerInterval;
let gameRunning = false;

const cityNameElement = document.getElementById('city-name');
const cityCountryElement = document.getElementById('city-country');
const cityFactElement = document.getElementById('city-fact');
const guessInput = document.getElementById('guess-input');
const feedbackElement = document.getElementById('feedback');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const difficultySelect = document.getElementById('difficulty-select');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');

// Fetch current temperature from OpenWeather API
const fetchTemperature = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        return data.main.temp;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

// Fetch interesting facts about the city from Wikipedia API
const fetchCityFact = async (cityName) => {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${cityName}`);
        const data = await response.json();
        return data.extract || 'No facts available for this city.';
    } catch (error) {
        console.error('Error fetching city facts:', error);
        return 'No facts available for this city.';
    }
};

// Start the timer countdown
const startTimer = () => {
    clearInterval(timerInterval);
    timeLeft = 10;
    timerElement.textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            feedbackElement.textContent = `Time's up! The correct temperature was ${actualTemperature}°C.`;
            gameRunning = false;
            setTimeout(startNewRound, 3000);  // Wait 3 seconds before starting a new round
        }
    }, 1000);
};

// Handle the user's guess
const handleGuess = () => {
    if (!gameRunning) return; // Prevent submitting if game isn't running

    clearInterval(timerInterval);
    const userGuess = parseInt(guessInput.value, 10);

    if (isNaN(userGuess)) {
        feedbackElement.textContent = 'Please enter a valid number.';
        return;
    }

    const difference = Math.abs(userGuess - actualTemperature);
    const difficulty = difficultySelect.value;

    let points = 0;

    if (difficulty === 'easy' && difference <= 5) points = 5;
    else if (difficulty === 'medium' && difference <= 3) points = 10;
    else if (difficulty === 'hard' && difference === 0) points = 15;

    if (points > 0) {
        feedbackElement.textContent = `Correct! You scored ${points} points.`;
        score += points;
    } else {
        feedbackElement.textContent = `Incorrect. The correct temperature was ${actualTemperature}°C.`;
    }

    scoreElement.textContent = score;
    gameRunning = false;
    setTimeout(startNewRound, 3000); // Wait before starting a new round
};

// Start a new round with a random city
const startNewRound = async () => {
    gameRunning = true;
    feedbackElement.textContent = '';
    guessInput.value = '';

    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    currentCity = randomCity;

    cityNameElement.textContent = currentCity.name;
    cityCountryElement.textContent = currentCity.country;

    try {
        actualTemperature = await fetchTemperature(currentCity);
        const cityFact = await fetchCityFact(currentCity.name);
        cityFactElement.textContent = cityFact || 'No additional info available.';
    } catch (error) {
        feedbackElement.textContent = 'Failed to load city data. Please try again.';
    }

    startTimer();
};

// Reset the game
const resetGame = () => {
    score = 0;
    scoreElement.textContent = score;
    startNewRound();
};

submitBtn.addEventListener('click', handleGuess);
resetBtn.addEventListener('click', resetGame);

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', startNewRound);
