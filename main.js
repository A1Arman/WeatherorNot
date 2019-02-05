'use strict'

let eventSearch = 'https://app.ticketmaster.com/discovery/v2/events.json';
let searchURL = 'https://api.openweathermap.org/data/2.5/weather';
let forecastSearchURL ='https://api.openweathermap.org/data/2.5/forecast'

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayCurrentResults(responseJson) {
    $('#js-error-message').empty();
    $('.current').append(
        `<section>
            <h2>Current Weather</h2>
            <h3>${responseJson.name}</h3>
            <h4>${responseJson.main.temp} °F</h4>
            <p>High: ${responseJson.main.temp_max} °F</p>
            <p>Low: ${responseJson.main.temp_min} °F</p>
            <p>Weather Condition: ${responseJson.weather[0].main}</p>
            <button type="button" class="see-event">Check for Events</button>
        </section>`
        )
};

function getCurrentCity(query) {
    let apiKey = '41aa8645e31c470d3cc1c97fdb0431b6';
    const params = {
        APPID: apiKey,
        q: query,
        units: 'imperial'
    };
    let queryString = formatQueryParams(params)
    let url = searchURL + '?' + queryString;

    console.log('I am running');

    fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json()
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayCurrentResults(responseJson))
        .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
};

function displayForecastResults(responseJson) {
    console.log(responseJson);
    $('#js-error-message').empty();
    $('.projected-weather').append(`<h2>5 Day Forecast</h2>`)
    for (let i = 0; i < responseJson.cnt; i+=8) {
        $('.projected-weather').append(
        `<section class='projected-weather-results'>
            <h3>${responseJson.list[i].dt_txt}</h3>
            <h4>Temperature: ${responseJson.list[i].main.temp} °F</h4>
            <p>Weather Condition: ${responseJson.list[i].weather[0].main}</p>         
            <button type="button" class="see-event">Check for Events</button>
        </section>`
        )
    }
};

function getForecastCity(query) {
    let apiKey = '41aa8645e31c470d3cc1c97fdb0431b6';
    const params = {
        APPID: apiKey,
        q: query,
        units: 'imperial',
    };
    let queryString = formatQueryParams(params)
    let url = forecastSearchURL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayForecastResults(responseJson))
        .catch(err => {
        $('#js-error-message-forecast').text(`Something went wrong: ${err.message}`);
    });
};

function removeWeather() {
        $('.current').empty();
        $('.current').hide();
        $('.projected-weather').empty();
        $('.projected-weather').hide();
};

function showWeather() {
    $('.current').show();
    $('.projected-weather').show();
};

function displayEventResults(event) {
    $('.events').append(`
        <section>
            <h3>${event.dates.start.localDate} : ${event.dates.start.localTime}</h3>
            <h3><a href='${event.url}'>${event.name}</a></h3>
            <p>${event._embedded.venues[0].name}</p>
            <button type='button'>Add to Calendar</button>
        </section>
    `);
};

function hideEvents() {
    $('.events').empty();
    $('.events').hide();
}

function showEvents() {
    $('.events').show();
}

function getEvents(query) {
    let apiKey = 'mLp0QAqdVGdXZxVAru5MAGOfSKlzsIgS';
    const params = {
        apikey: apiKey,
        city: query,
        sort: 'date,asc',
        size: '15'
    };
    let queryString = formatQueryParams(params)
    let url = eventSearch + '?' + queryString;
    const now = new Date();
    console.log(url);
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            for (let i = 0; i < responseJson._embedded.events.length; i++) {
                let event = responseJson._embedded.events[i];
                let date = new Date(event.dates.start.dateTime);
                console.log(event);
                if (date > now) {
                    removeWeather();
                    displayEventResults(event);
                }
            }
            url = '';
        })
        .catch(err => {
        $('#js-error-message-events').text(`Something went wrong: ${err.message}`);
    });
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const city = $('#js-city').val();
    removeWeather();
    showWeather();
    getCurrentCity(city);
    getForecastCity(city);
    watchEventClick(city);
    hideEvents();
  });
}

function watchEventClick(city) {
    $('.projected-weather, .current').on('click', '.see-event', event => {
        showEvents();
        getEvents(city);
    });
}

$(watchForm);