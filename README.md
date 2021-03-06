# GraphWiz - HackUMass VIII Project
## [Best Web App Winner + Grand Prize Runner-up](https://dashboard.hackumass.com/projects/31)

### Hosted on Domain.com https://graphwiz.online/ 
### Hosted on Firebase https://graph-wiz.web.app/

<img src="https://i.imgur.com/NnLQCiW.png" width="100%" border="0" />

## Description
Ever wanted to test your knowledge and compete with others on linear, quadratic, polynomial, exponential, nth root, trigonometric, (and many more) equations? Well, now you can in the online single-player and real-time multiplayer game GraphWiz.

## Inspiration:
With the toll of virtual classes and inspiration from learning resources such as Kahoot, TypeRacer, and GeoGuessr, I wanted to make my own single-player and real-time multiplayer competitive/educational online game. I decided to base it off on how well one can identify graphs on a 2d coordinate plane.

## What it does:
The project is an educational game in which the user is given a graphed equation, and their goal is to come as close to the right equation as possible. The lower the score, the better. In real-time multiplayer, players have 20 seconds to guess the correct equation. The lowest score wins. Ties are broken by seconds taken to answer. Users see their personal statistics and can see their individual rank in the leaderboard table. Users can practice their ability to identify different types of equations and have competitive fun at the same time!

## How I built it:
For front-end, I used HTML/CSS, Javascript, and React. I used Firebase and Domain.com for backend and hosting. I used Visual Studio Code as my main code editor. Overall, I spent the first hour planning the layout (Homepage, Multiplayer page, Singleplayer page and its necessary components), a couple of hours implementing single player, several hours on implementing real-time multiplayer with firebase, and several hours on testing, debugging, and making the UI look as clean and elegant as possible.

## Technologies I used:
- HTML/CSS
- Javascript
- Node.js
- React

## Challenges I ran into:
Not having a lot of experience with Firebase, incorporating Firebase backend with real-time multiplayer was difficult. Issues such as players joining and leaving, updating leaderboards, setting states (idle state, ongoing game state, cooldown state) were difficult to find good solutions to. Reading and quickly understanding documentation for the several libraries I used was also mind-numbing but worth it once everything worked out.

## Accomplishments I am proud of:
I'm proud of making a real-time online multiplayer game similar to the likes of Kahoot! and TypeRacer. It brought me much insight in the complexities of synchronizing players within a session/room. Also, I am proud of improving my front-end and UI skills further, discovering new libraries to play with and explore, and building a functioning full-stack web application. Finally, I am proud of my ability to get a lot done in a short amount of time, constantly applying the KISS principle throughout.

## What I've learned:
I learned the basics of Firebase and how to use its "real-time" database to build the "real-time" multiplayer game. Furthermore, I learned how to host a website using Domain.com and Firebase. Finally, I strengthened my overall skills in React and front-end web development.

## What's next:
I would like to rethink, replan, and recode the real-time multiplayer section of the application, and make it more clean and robust (Timers are tricky!). I would also like to shift around the UI for the multiplayer section of the app to make it look more clean and appealing. I would love to make the web application mobile compatible and also add different game modes. Finally, I would like to add more crazy equations for users to guess to make the game more fun.

## Built with:
I built the application using the front-end framework React, Javascript Libraries including JSXGraph (Visual graph), Material-Table (Leaderboards), Material-UI (Main component library for UI), and Expr-Eval (Expression Evaluator), and Firebase and Domain.com for backend and hosting.
- https://reactjs.org/
- https://firebase.google.com/
- https://www.domain.com/
- https://jsxgraph.uni-bayreuth.de/wp/index.html
- https://material-ui.com/
- https://github.com/silentmatt/expr-eval
- https://material-table.com/

## Prizes we're going for:
- Best Documentation
- Best Web Hack
- Best Domain Name
- Best Venture Pitch
- Best Beginner Software Hack
- Best Beginner Web Hack

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
