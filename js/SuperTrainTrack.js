'use strict'

window.addEventListener('load', ready)
window.addEventListener('load', activateAutocomplete)

let array = []

// The script starts working only after the whole html page has loaded
function ready() {
  
  createAutocomplete()

  let searchButton = document.getElementById('startSearch')

  searchButton.addEventListener('click', readInput)
  
}

//Enables the autocomplete on station search
function activateAutocomplete() {

  $( function() {
    var availableTags = array
    $( "#station" ).autocomplete({
      source: availableTags
    });
  } );
}

// Reads the station user entered
function readInput() {

  let userStation = document.forms.search.station.value
  let userUntilDeparture = 0
  userUntilDeparture = document.forms.search.untilDeparture.value

  console.log(userStation)

  handleInput(userStation, userUntilDeparture)
}

// Translates the station to the shortened id that can be used when searching for the schedules
function handleInput(station, userUntilDeparture) {
  
  fetch('https://rata.digitraffic.fi/api/v1/metadata/stations')
  .then(
    function(response) {
      
      if (response.status !== 200) {
        console.log('Testingss')
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
        fetchData(station, userUntilDeparture)     
      })
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err)
  })
}

// The actual fetching from the API happens here
function fetchData(station, untilDep) {
  
  let header = document.getElementById('header')
  header.innerText = 'Trains going trough the station searched for'

  fetch('https://rata.digitraffic.fi/api/v1/live-trains/station/' + station + '?minutes_before_departure=' + untilDep + '&minutes_after_departure=0&minutes_before_arrival=0&minutes_after_arrival=0')
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
            let stationTime
            // Checks the info of the trains for mentions of the station searched for
            for(let i = 0; i < element.timeTableRows.length; i++) {              

              if (element.timeTableRows[i].stationShortCode == station && element.timeTableRows[i].type == 'DEPARTURE') {

                
                let schedule = new Date(element.timeTableRows[i].scheduledTime)
                schedule.setHours(schedule.getHours() + 2)
                stationTime = schedule.toUTCString().substring(16, 22)
                found = true
                break  
              }
            }
            if (found === true) {

              console.log(element)
              trains.innerText = '' + trains.innerText + ' ' + stationTime + ' | ' + element.trainType + element.trainNumber + ' | ' + element.trainCategory + '\n'
            }
          }
        }
      })
      trains.innerText = ''
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err)
  })
}

function createAutocomplete() {
  
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

            let element = data[key]
            if(element.passengerTraffic === true) {
             
              turnIntoArray(element.stationName)
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

function turnIntoArray(stationName) {

  array.push(stationName)
}
