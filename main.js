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
        `<h2>Current Weather</h2>
            <h3>${responseJson.name}</h3>
            <h4>${responseJson.main.temp} °F</h4>
            <p>High: ${responseJson.main.temp_max} °F</p>
            <p>Low: ${responseJson.main.temp_min} °F</p>
            <p>Weather Condition: ${responseJson.weather[0].main}</p>`
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

function hideEvent() {
    $('.current-event').empty();
    $('.current-event').hide();
}

function showEvent() {
    $('.current-event').show();
}

function displayEventResults(event) {
    $('.current-event').append(`
            <h3>${event.dates.start.localDate} : ${event.dates.start.localTime}</h3>
            <h3><a href='${event.url}'>${event.name}</a></h3>
            <p>${event._embedded.venues[0].name}</p>
    `);
};


function getEvents(query) {
    let apiKey = 'mLp0QAqdVGdXZxVAru5MAGOfSKlzsIgS';
    const params = {
        apikey: apiKey,
        city: query,
        sort: 'date,asc',
        size: '5'
    };
    let queryString = formatQueryParams(params)
    let url = eventSearch + '?' + queryString;
    const now = new Date();

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            console.log(responseJson);
            $('.current-event').append(`
                <h2>Events happening soon</h2>
                <button type='button' class='see-events'>All Events</button>
            `);
            for (let i = 1; i < responseJson._embedded.events.length; i++) {
                let event = responseJson._embedded.events[i];
                let date = new Date(event.dates.start.dateTime);
                if (date >= now) {
                    displayEventResults(event);
                }
                url = '';
            }
        })
        .catch(err => {
        $('#js-error-message-events').text(`Something went wrong: ${err.message}`);
    });
};

function hideAllEvents() {
    $('.all-event-results').remove();
    $('.all-events').hide();
}

function showAllEvents() {
    $('.all-events').show();
}

function displayAllEventResults(event) {
    $('.all-events').append(`
            <section class='all-event-results'>
                <h3>${event.dates.start.localDate} : ${event.dates.start.localTime}</h3>
                <h3><a href='${event.url}'>${event.name}</a></h3>
                <p>${event._embedded.venues[0].name}</p>
            </section>
    `);
};

function getAllEvents(query) {
    let apiKey = 'mLp0QAqdVGdXZxVAru5MAGOfSKlzsIgS';
    const params = {
        apikey: apiKey,
        city: query,
        sort: 'date,asc',
        size: '20'
    };
    let queryString = formatQueryParams(params)
    let url = eventSearch + '?' + queryString;
    const now = new Date();
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            for (let i = 2; i < responseJson._embedded.events.length; i++) {
                let event = responseJson._embedded.events[i];
                displayAllEventResults(event);
            }
            url = '';
        })
        .catch(err => {
        $('#js-error-message-all-events').text(`Something went wrong: ${err.message}`);
    });
};


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const city = $('#js-city').val();
    hideAllEvents();
    hideEvent();
    showEvent();
    removeWeather();
    showWeather();
    getEvents(city);
    getCurrentCity(city);
    getForecastCity(city);
    watchEventClick(city);
  });
}

function watchEventClick(city) {
    $('.current-event').on('click', '.see-events', event => {
        hideEvent();
        removeWeather();
        showAllEvents();
        getAllEvents(city);
    });
}

$(watchForm);