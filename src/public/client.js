let store = {
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    currentView: 'apod',
    selectedRover: {
      manifest: {},
      photos: [],
      selectedDate: ''
    }
}

const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const App = (state) => {
    let { rovers, currentView } = state

    return `
        <header>
            <h1>Mars Dashboard</h1>
        </header>
        <main>
        ${ViewDropdown(rovers,currentView)}
        <section>
                ${CurrentView(state)}
            </section>
        </main>
        <footer>
        <a href='https://www.freepik.com/photos/background'>Background photo by kjpargeter</a> | 
        All data provided by <a href='https://api.nasa.gov/'>NASA Open API</a></footer>
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

const ViewDropdown = (rovers, currentView) => {
  const options = rovers.map(rover => `<option 
                                        value="${rover.toLowerCase()}" 
                                        ${currentView===rover.toLowerCase() ? 'selected' : ''}
                                        >${rover}
                                        </option>`).join();
  return `
    <div class="view-select">
      <select onchange="updateCurrentView(this.value)">
        <option value="apod">Picture of the Day</option>
        ${options}
      </select>
    </div>
  `
}

const updateCurrentView = (option) => {
  updateStore(store, { currentView: option })
}

const updateRoverSelectedDate = (option) => {
  updateStore(store, { selectedRover: {manifest: store.selectedRover.manifest, selectedDate: option, photos: {...store.selectedRover.photos} }})
  if(store.selectedRover.selectedDate && store.selectedRover.photos && !store.selectedRover.photos[option]){
    getRoverPhotos(store.selectedRover.manifest.name.toLowerCase(), store.selectedRover.selectedDate);
  }
}

const updateRoverManifest = (manifest) => {
  updateStore(store, { selectedRover: { manifest }})
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
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        if(apod.image) {
          return `
            <div class="apod">
            <p>${apod.image.explanation}</p>
            <img src="${apod.image.url}"/>
            </div>
          `
        }
        return `Loading Picture of the Day...`
    }
}

const RoverView = (rover, selectedRover) => {
  if(!selectedRover.manifest || selectedRover.manifest.name!=capitalize(rover)) {
    getRoverData(rover)
  }

  if(selectedRover.manifest) {
    return `
    <div class="rover-view">
      <div class="rover-manifest">
        <ul>
          <li><span>Launch Date</span><span>${selectedRover.manifest.launch_date}</span></li>
          <li><span>Landing Data</span><span>${selectedRover.manifest.landing_date}</span></li>
          <li><span>Mission status</span><span>${selectedRover.manifest.status}</span></li>
          <li><span>Latest photos taken</span><span>${selectedRover.manifest.max_date}</span></li>
          <li><span>Total Photos Taken</span><span>${selectedRover.manifest.total_photos}</span></li>
        </ul>
        ${selectedRover.manifest.photos && RoverDateSelect(selectedRover)}
        </div>
      ${selectedRover.manifest.photos && RoverPhotoGallery(selectedRover)}
    </div>
    `
  }

  return `
  <div class="rover-view">
  <h3>${capitalize(rover)}</h3>
    <p>Loading rover data...</p>
  </div>
  `
}

const RoverDateSelect = (rover) => {
  return `
    <div class="view-select">
      <select onchange="updateRoverSelectedDate(this.value)">
      ${rover.manifest.photos.map(photoBlock => {
        const earth_date = photoBlock.earth_date;
        return `<option 
                ${rover.selectedDate===earth_date ? 'selected' : ''}
                value="${earth_date}">${earth_date}
                </option>`;
      }).reverse()}
    </select>
    </div>
  `
}

const RoverPhotoGallery = (rover) => {
  if(rover.photos && rover.selectedDate && rover.photos[rover.selectedDate]) {
    return  `
    <div class="rover-photo-gallery">
      <div class="rover-photos">
        <ul>
        ${rover.photos[rover.selectedDate].map(photo => `<li><img src="${photo.img_src}"></li>`).join('')}
        </ul>
      </div>
    </div>
  `    
  }
  return `Loading photos...`
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
        updateRoverManifest(data)
        return data.photos[data.photos.length-1].earth_date
      })
      .then(data => {
        updateRoverSelectedDate(data)
      })
}

const getRoverPhotos = (rover, earth_date) => {
  fetch(`http://localhost:3000/rover-photos?rover=${rover}&earth_date=${earth_date}`)
      .then(res => res.json())
      .then(data => {
        updateStore(store, { selectedRover: {manifest: store.selectedRover.manifest, selectedDate: store.selectedRover.selectedDate, photos: { ...store.selectedRover.photos, [earth_date]: data } } })
      })
}
