'use strict'

window.addEventListener('load', ready)

// the script starts working only after the whole html page has loaded
function ready() {

  let searchButton = document.getElementById('startSearch')

  searchButton.addEventListener('click', readStation)
}

// reads the station user entered
function readStation() {

  let userInput = document.forms.search.station.value

  console.log(userInput)
  fetchData(userInput)
}

// The actual fetching from the API happens here
function fetchData(station) {

  if (station == 'Viiala') {

    station = 'VIA'
  } else if (station == 'Helsinki') {

    station = 'HKI'
  } else {

    station = 'TPE'
  }

  fetch('https://rata.digitraffic.fi/api/v1/live-trains?station=' + station)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status)
        return
      }

      // Examine the text in the response
      response.json().then(function(data) {

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const element = data[key];
            console.log(element)
          }
        }
        
        let trains = document.getElementById('trains')
        let i = 0

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const element = data[key];

            trains.innerText= '' + trains.innerText + element.trainNumber + '\n'
            
          }
        }
        
      })
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err)
  })
}
