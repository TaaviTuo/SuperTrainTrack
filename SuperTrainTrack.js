'use strict'

window.addEventListener('load', ready)

function ready() {

    let searchButton = document.getElementById('startSearch')

    searchButton.addEventListener('click', readStation)
}

function readStation() {

    let userInput = document.forms.search.station.value

    console.log(userInput)
}
