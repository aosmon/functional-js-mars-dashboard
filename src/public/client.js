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
  const { rovers, apod, currentView, selectedRover } = state

    return `
        <header>
            <h1>Mars Dashboard</h1>
        </header>
        <main>
        ${ViewSelect(rovers,currentView)}
        ${CurrentView(state)}        
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
  const { rovers, apod, currentView, selectedRover } = state

  if(rovers.includes(capitalize(currentView))) {
    return Section(RoverView(selectedRover), getRoverData(currentView))
  }

  return Section(ImageOfTheDay(apod), getImageOfTheDay(apod))
}

const ViewSelect = (rovers, currentView) => {
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

const RoverView = (rover) => {
  if(rover.manifest) {
    return `
    <div class="rover-view">
      <div class="rover-manifest">
        ${RoverManifest(rover)}
        ${RoverDateSelect(rover)}
        </div>
      ${RoverPhotoGallery(rover)}
    </div>
    `
  }

  return `
  <div class="rover-view">
    <p>Loading rover data...</p>
  </div>
  `
}

const RoverManifest = (rover) => {
    return `
      <ul>
        <li><span>Launch Date</span><span>${rover.manifest.launch_date}</span></li>
        <li><span>Landing Data</span><span>${rover.manifest.landing_date}</span></li>
        <li><span>Mission status</span><span>${rover.manifest.status}</span></li>
        <li><span>Latest photos taken</span><span>${rover.manifest.max_date}</span></li>
        <li><span>Total Photos Taken</span><span>${rover.manifest.total_photos}</span></li>
      </ul>
    `
}

const RoverDateSelect = (rover) => {
  if(rover.manifest.photos) {
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
}

const RoverPhotoGallery = (rover) => {
  if(rover.photos && rover.selectedDate && rover.photos[rover.selectedDate]) {
    return  `
    <div class="rover-photo-gallery">
      <div class="rover-photos">
        ${UnorderedList(rover.photos[rover.selectedDate], RoverPhotoImage)}
      </div>
    </div>
  `    
  }
  return `Loading photos...`
}

const RoverPhotoImage = (image) => `<img src="${image.img_src}" title="${image.rover.name + ': ' + image.earth_date}">`

// ------------------------------------------------------  HELPERS

const capitalize = (str) => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);

const Section = (component, getDataFn) => {
  getDataFn

  return `
    <section>
    ${component}
    </section>
  `
}

const UnorderedList = (array, cb) => {
  return `
    <ul>
      ${array.map(item =>  `<li>${cb(item)}</li>`).join('')}
    </ul>
  `
};

// ------------------------------------------------------  API CALLS

// Get image of the day
const getImageOfTheDay = (apod) => {

  // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)

    if (!apod || apod.date === today.getDate() ) {
      fetch(`http://localhost:3000/apod`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then(apod => updateStore(store, { apod }))
      .catch(error => console.log(error));        
    }
}

const getRoverData = (rover) => {

  const { selectedRover } = store

  if(!selectedRover.manifest || selectedRover.manifest.name!=capitalize(rover)) {
    fetch(`http://localhost:3000/rover-mission?rover=${rover}`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Something went wrong');
      }
    })
    .then(data => {
      updateRoverManifest(data)
      return data.photos[data.photos.length-1].earth_date
    })
    .then(data => {
      updateRoverSelectedDate(data)
    })
    .catch(error => console.log(error));
  }
}

const getRoverPhotos = (rover, earth_date) => {
  fetch(`http://localhost:3000/rover-photos?rover=${rover}&earth_date=${earth_date}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then(data => {
        updateStore(store, { selectedRover: {manifest: store.selectedRover.manifest, selectedDate: store.selectedRover.selectedDate, photos: { ...store.selectedRover.photos, [earth_date]: data } } })
      })
      .catch(error => console.log(error));
}
