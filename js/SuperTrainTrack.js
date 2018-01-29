'use strict'

window.addEventListener('load', ready)
window.addEventListener('load', activateAutocomplete)

let stationsArray = []

// The script starts working only after the whole html page has loaded
function ready() {
  
  createAutocomplete()

  document.getElementById('untilDeparture').onkeydown = function(event) {
    if (event.keyCode == 13) {
      readInput()
    }
}
  let searchButton = document.getElementById('startSearch')

  searchButton.addEventListener('click', readInput)
  
}

//Enables the autocomplete on station search
function activateAutocomplete() {

  $( function() {

    $( "#station" ).autocomplete({
      source: stationsArray
    })
  } )
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
          console.log('Looks like there was a problem in handleInput(). Status Code: ' +
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

// The actual fetching of the trains from the API happens here
function fetchData(station, untilDep) {

  let depTrains = document.getElementById('departures')
  let arrTrains = document.getElementById('arrivals')

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

          //Create the top row of the departing table
          let infoRow = depTrains.insertRow(0)
          let cell1 = infoRow.insertCell(0)
          cell1.innerHTML = 'Time'
          let cell2 = infoRow.insertCell(1)
          cell2.innerHTML = 'Train id'
          let cell3 = infoRow.insertCell(2)
          cell3.innerHTML = 'Train type'
          let cell4 = infoRow.insertCell(3)
          cell4.innerHTML = 'Destination'
          let cell5 = infoRow.insertCell(4)
          cell5.innerHTML = 'Track'

          //Create the top row of the arrivals table
          let arrInfoRow = arrTrains.insertRow(0)
          let arrCell1 = arrInfoRow.insertCell(0)
          arrCell1.innerHTML = 'Time'
          let arrCell2 = arrInfoRow.insertCell(1)
          arrCell2.innerHTML = 'Train id'
          let arrCell3 = arrInfoRow.insertCell(2)
          arrCell3.innerHTML = 'Train type'
          let arrCell4 = arrInfoRow.insertCell(3)
          arrCell4.innerHTML = 'Destination'
          let arrCell5 = arrInfoRow.insertCell(4)
          arrCell5.innerHTML = 'Track'

          let i = 1

          for (const key in data) {
            if (data.hasOwnProperty(key)) {

              let row = depTrains.insertRow(i)
              let arrRow = arrTrains.insertRow(i)
              let track

              const element = data[key]

              let found = false
              let stationTime

              // Get the info of departing trains
              for(let j = 0; j < element.timeTableRows.length; j++) {              

                if (element.timeTableRows[j].stationShortCode == station && element.timeTableRows[j].type == 'DEPARTURE' && (element.trainCategory === 'Commuter' || element.trainCategory === 'Long-distance')) {
                  
                  let schedule = new Date(element.timeTableRows[j].scheduledTime)
                  schedule.setHours(schedule.getHours() + 2)
                  stationTime = schedule.toUTCString().substring(16, 22)
                  track = element.timeTableRows[j].commercialTrack
                  found = true
                  break  
                }
              }
              if (found === true) {

                console.log(element)

                //Create the table from the info
                let cell1 = row.insertCell(0)
                cell1.innerHTML = stationTime
                let cell2 = row.insertCell(1)
                cell2.innerHTML = element.trainType + element.trainNumber
                let cell3 = row.insertCell(2)
                cell3.innerHTML = element.trainCategory
                let cell4 = row.insertCell(3)
                let destination = element.timeTableRows.length - 1
                cell4.innerHTML = element.timeTableRows[destination].stationShortCode 
                let cell5 = row.insertCell(4)
                cell5.innerHTML = track 
              }

              // Get the info of arriving trains
              for(let j = 0; j < element.timeTableRows.length; j++) {              

                if (element.timeTableRows[j].stationShortCode == station && element.timeTableRows[j].type == 'ARRIVAL' && (element.trainCategory === 'Commuter' || element.trainCategory === 'Long-distance')) {
                  
                  let schedule = new Date(element.timeTableRows[j].scheduledTime)
                  schedule.setHours(schedule.getHours() + 2)
                  stationTime = schedule.toUTCString().substring(16, 22)
                  track = element.timeTableRows[j].commercialTrack
                  found = true
                  break  
                }
              }

              if (found === true) {

                //Create the table from the info
                let arrCell1 = arrRow.insertCell(0)
                arrCell1.innerHTML = stationTime
                let arrCell2 = arrRow.insertCell(1)
                arrCell2.innerHTML = element.trainType + element.trainNumber
                let arrCell3 = arrRow.insertCell(2)
                arrCell3.innerHTML = element.trainCategory
                let arrCell4 = arrRow.insertCell(3)
                let destination = element.timeTableRows.length - 1
                arrCell4.innerHTML = element.timeTableRows[destination].stationShortCode      
                let arrCell5 = arrRow.insertCell(4)
                arrCell5.innerHTML = track
              }
              i++
            }
          }
        })
        //Resets the table between searches
        depTrains.innerText = ''
        arrTrains.innerText = ''
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

  stationsArray.push(stationName)
}
