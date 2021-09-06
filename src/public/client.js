let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    currentView: ''
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
    let { rovers, apod, currentView } = state

    return `
        <header>
          <h1>Mars Dashboard</h1>
          ${Dropdown(rovers,currentView)}
        </header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Picture of the Day</h3>
                ${ImageOfTheDay(apod)}
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
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <div class="apod">
            <img src="${apod.image.url}"/>
            <p>${apod.image.explanation}</p>
            </div>
        `)
    }
}

// ------------------------------------------------------  API CALLS

// Get image of the day
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}
