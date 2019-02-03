'use strict'

let searchURL = 'https://api.openweathermap.org/data/2.5/weather';
let forecastSearchURL ='https://api.openweathermap.org/data/2.5/forecast'

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayCurrentResults(responseJson) {
    $('#js-error-message').empty();
    $('.current-weather').empty();
    $('.current-weather').append(`
    <h2>${responseJson.name}</h2>
    <h3>${responseJson.main.temp} °F</h3>
    <p>High: ${responseJson.main.temp_max} °F</p>
    <p>Low: ${responseJson.main.temp_min} °F</p>
    <p>${responseJson.weather[0].description}</p>
    `)
    
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
            throw new Error(response.statusText);
        })
        .then(responseJson => displayCurrentResults(responseJson))
        .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
};

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const city = $('#js-city').val();
    getCurrentCity(city);

  });
}

$(watchForm);