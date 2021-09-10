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
    let { rovers, currentView } = state

    return `
        <header>
            <h1>Mars Dashboard</h1>
            ${Dropdown(rovers,currentView)}
        </header>
        <main>
            <section>
                ${CurrentView(state)}
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

const CurrentView = (state) => {
  let { rovers, apod, currentView, selectedRover } = state

  if(rovers.includes(capitalize(currentView))) {
    return RoverView(currentView, selectedRover)
  }

  return ImageOfTheDay(apod)
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

  if(selectedRover.manifest && !selectedRover.photos) {
    getRoverPhotos(rover, selectedRover.manifest.max_date)
  }

  if(selectedRover.manifest) {
    return `
    <div class="rover-view">
      <ul>
        <li>Launch Date: ${selectedRover.manifest.launch_date}</li>
        <li>Landing Data: ${selectedRover.manifest.landing_date}</li>
        <li>Mission status: ${selectedRover.manifest.status}</li>
        <li>Date the most recent photos were taken: ${selectedRover.manifest.max_date}</li>
        <li>Total Photos Taken: ${selectedRover.manifest.total_photos}</li>
      </ul>
      ${selectedRover.photos && RoverPhotoGallery(selectedRover.photos)}
    </div>
    `
  }

  return `
  <div class="rover-view">
  <h3>${capitalize(rover)}</h3>
    <p>Unable to retrieve rover data.</p>
  </div>
  `
}

const RoverPhotoGallery = (photos) => {
  return  `
  <div class="rover-photos">
    <ul>
    ${photos.map(photo => `<li><img src="${photo.img_src}"></li>`).join('')}
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
      })
}

const getRoverPhotos = (rover, earth_date) => {
  fetch(`http://localhost:3000/rover-photos?rover=${rover}&earth_date=${earth_date}`)
      .then(res => res.json())
      .then(data => {
        updateStore(store, { selectedRover: {manifest: store.selectedRover.manifest, photos: data } })
        console.log(store.selectedRover)
      })
}
