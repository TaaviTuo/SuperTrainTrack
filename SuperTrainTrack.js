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

  if (userInput === 'Tampere') {

    userInput = 'Tampere asema'
  } else if (userInput === 'Tikkurila'){

    userInput = 'Tikkurila asema'
  } else if (userInput === 'Helsinki') {

    userInput = 'Helsinki asema'
  } else {

  }
  swapStationName(userInput)
}

// Translates the station to the shortened id that can be used when searching for the schedules
function swapStationName(station) {
  
  fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
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

            const element = data[key]

            if(element.stationName == station) {

              station = element.stationShortCode
            }
            
          }
        }
        fetchData(station)     
      })
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err)
  })
}

// The actual fetching from the API happens here
function fetchData(station) {

  fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + station)
  .then(
    function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status)
        return
      }

      // Examine the text in the response
      response.json().then(function(data) {
        
        let trains = document.getElementById('trains')
        let i = 0

        for (const key in data) {
          if (data.hasOwnProperty(key)) {

            const element = data[key]

            let found = false

            for(let i = 0; i < element.timeTableRows.length; i++) {
              if (element.timeTableRows[i].stationShortCode == station) {

                  found = true
                  break  
              }
            }
            if (found === true) {

              console.log(element)
              trains.innerText = '' + trains.innerText + ' ' + element.trainType + element.trainNumber + ', ' + element.trainCategory + '\n'
            }
          }
        }
        
      })
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err)
  })
}
