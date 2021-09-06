let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentView: 'apod',
    selectedRover: {}
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {
    let { rovers, apod, currentView, selectedRover } = state

    return `
        <header>
          <h1>Mars Dashboard</h1>
          ${Dropdown(rovers,currentView)}
        </header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                ${currentView==='apod' && ImageOfTheDay(apod)}
                ${rovers.includes(capitalize(currentView)) && RoverView(currentView, selectedRover)}
            </section>
        </main>
        <footer><a href='https://www.freepik.com/photos/background'>Background photo by kjpargeter</a></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

const Dropdown = (rovers, currentView) => {
  return `
    <select name="views" id="views" onchange="updateCurrentView(this.value)">
      <option value="apod">Picture of the Day</option>
      ${rovers.map(rover => `<option 
                                value="${rover.toLowerCase()}" 
                                ${currentView===rover.toLowerCase() ? 'selected' : ''}
                                >${rover}</option>`)}
    </select>
  `
}

const updateCurrentView = (option) => {
  updateStore(store, { currentView: option })
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || apod.date === today.getDate() ) {
        getImageOfTheDay(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <h3>Picture of the Day</h3>
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <h3>Picture of the Day</h3>
            <div class="apod">
            <img src="${apod.image.url}"/>
            <p>${apod.image.explanation}</p>
            </div>
        `)
    }
}

const RoverView = (rover, selectedRover) => {
  if(!selectedRover.manifest || selectedRover.manifest.name!=capitalize(rover)) {
    getRoverData(rover)
  }

  return `
    <div class="rover-view">
      <h3>${capitalize(rover)}</h3>
      <ul>
        <li>Launch Date: ${selectedRover.manifest.launch_date}</li>
        <li>Landing Data: ${selectedRover.manifest.landing_date}</li>
        <li>Mission status: ${selectedRover.manifest.status}</li>
        <li>Latest Martian sol: ${selectedRover.manifest.max_sol}</li>
        <li>Latest Earth date: ${selectedRover.manifest.max_date}</li>
        <li>Total Photos Taken: ${selectedRover.manifest.total_photos}</li>
      </ul>
    </div>
    `
}

// ------------------------------------------------------  HELPERS

const capitalize = (str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1)

// ------------------------------------------------------  API CALLS

// Get image of the day
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}

const getRoverData = (rover) => {
  fetch(`http://localhost:3000/rover-mission?rover=${rover}`)
      .then(res => res.json())
      .then(data => {
        updateStore(store, { selectedRover: { manifest: data }})
        console.log(store)
      })
}
