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
    $('#current').append(
        `<section class="current-temp">   
            <h2>Current Weather</h2>
            <h3>${responseJson.name}</h3>
            <h4>${responseJson.main.temp} °F</h4>
            <p>High: ${responseJson.main.temp_max} °F</p>
            <p>Low: ${responseJson.main.temp_min} °F</p>
            <p>Weather Condition: ${responseJson.weather[0].main}</p>
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


    fetch(url)
        .then(response => {
            if(response.ok) {
                return response.json()
            }
            return Promise.reject({message: 'Weather not found'});
        })
        .then(responseJson => {
            displayCurrentResults(responseJson);
        })
        .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
};

function displayForecastResults(responseJson) {
    $('#js-error-message').empty();
    $('#projected-weather').append(`<h2>5 Day Forecast</h2>`);
    let projectedResults = [];
    //For loop iterates response of the 5 day / 3 hour forecast to display only 5 days
    for (let i = 0; i < responseJson.cnt; i+=8) {
        projectedResults.push(
        `<section class="projected-weather-results">
            <h3>${responseJson.list[i].dt_txt}</h3>
            <h4>Temperature: ${responseJson.list[i].main.temp} °F</h4>
            <p>Weather Condition: ${responseJson.list[i].weather[0].main}</p>         
        </section>`
        );
    };
    $('#projected-weather').append(projectedResults.join(""));
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


    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return Promise.reject({message: 'Not a valid City'});
        })
        .then(responseJson => displayForecastResults(responseJson))
        .catch(err => {
        $('#js-error-message-forecast').text(`Something went wrong: ${err.message}`);
    });
};

function removeWeather() {
        $('#current').empty();
        $('#current').hide();
        $('#projected-weather').empty();
        $('#projected-weather').hide();
};

function showWeather() {
    $('#current').fadeIn();
    $('#projected-weather').fadeIn();
};

function hideEvent() {
    $('#current-event').empty();
    $('#current-event').hide();
}

function showEvent() {
    $('#current-event').fadeIn();
}

function displayEventResults(event) {
    $('#current-event').append(`
        <section class="current-event-section">
            <h3>${event.dates.start.localDate} : ${event.dates.start.localTime}</h3>
            <h3><a href='${event.url}'>${event.name}</a></h3>
            <p>${event._embedded.venues[0].name}</p>
        </section>
    `);
};

function getEvents(query) {
    const now = new Date();
    let apiKey = 'mLp0QAqdVGdXZxVAru5MAGOfSKlzsIgS';
    const params = {
        apikey: apiKey,
        city: query,
        sort: 'date,asc',
        size: '20'
    };
    let queryString = formatQueryParams(params)
    let url = eventSearch + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject({message: 'Not a valid City'});
        })
        .then(responseJson => {
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


function showHome() {
    $('#current, #current-event, #projected-weather, #nav-container, #event-title-container' ).removeClass('hide');
}

function showNav() {
    $('#nav-container').fadeIn();
}

function hideNav() {
    $('#nav-contianer').hide();
}

function navAnimate() {
    $(".nav-links").on("click", function(e) {
        
        e.preventDefault();

        $("body, html").animate({ 
            scrollTop: $( $(this).attr('href') ).offset().top 
        }, 600);
        
    });
}


function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const city = $('#js-city').val();
    showNav();
    navAnimate();
    hideEvent();
    showEvent();
    removeWeather();
    showWeather();
    getEvents(city);
    getCurrentCity(city);
    getForecastCity(city);
    showHome();
  });
}

$(watchForm);