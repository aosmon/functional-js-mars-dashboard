# Functional Programming with Javascript 

### Project Overview

A Mars rover dashboard that consumes the NASA API. Dashboard that allows the user to select which rover's information they want to view. Once they have selected a rover, they will be able to see the most recent images taken by that rover, as well as important information about the rover and its mission. Goal of this project is to create an app that will make use of all the functional concepts and practices learned in this course, and to become comfortable using pure functions and iterating over, reshaping, and accessing information from complex API responses. 

<img width="375" alt="NASAapi01" src="https://user-images.githubusercontent.com/26148396/133545114-5def9b66-d2cf-4cdc-a74d-3b790cc21669.png">
<img width="750" alt="NASAapp02" src="https://user-images.githubusercontent.com/26148396/133545117-4419b1cd-c252-4c27-a9bc-3514efb1a1f0.png">
<img width="750" alt="NASAapp03" src="https://user-images.githubusercontent.com/26148396/133545120-ec04ec50-7f0a-473b-b434-d75a8230ef41.png">

### How to run

1. Clone repo and install the dependencies

 - To install depencies run:

```yarn install``` 

**If you don’t have yarn installed globally, follow their installation documentation here according to your operating system: https://yarnpkg.com/lang/en/docs/install

2. Obtain a NASA developer API key in order to access the API endpoints. To do that, go here: https://api.nasa.gov/.

3. Create file called `.env` and enter NASA API key: API_KEY=xxxxxx

5. Run `yarn start` in your terminal and go to `http:localhost:3000`.

6. Remember to commit frequently, use branches, and leave good commit messages! You'll thank yourself later.

### Project Requirements

To complete this project, UI must show the following:

- [ ] A gallery of the most recent images sent from each mars rover
- [ ] The launch date, landing date, name and status along with any other information about the rover
- [ ] A selection bar for the user to choose which rover's information they want to see

To complete this project, UI must do the following:

- [ ] Be responsive. Needs to look good(aka not broken) on phones(max width 768px) and desktop(min-width 991px, max-width 1824px). Tablet view is optional.
- [ ] Provide a way to dynamically switch the UI to view one of the three rovers 
**This can be done using tabs, buttons, or any other UI control

To complete this project, frontend code must:

- [ ] Use only pure functions
- [ ] Use at least one Higher Order Function
- [ ] Use the array method `map`
- [ ] Use the ImmutableJS library

To complete this project, backend code must:

- [ ] Be built with Node/Express
- [ ] Make successful calls to the NASA API
- [ ] Use pure functions to do any logic necessary
- [ ] Hide any sensetive information from public view (In other words, use your dotenv file)

Design

- [ ] Create the visual design of this UI 



