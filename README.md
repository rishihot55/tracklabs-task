# tracklabs-task
Frontend Task for Tracklabs

## Installation instructions
This app is Express 4 based and relies on hbs (Handlebars.js) and as such, requires the standard dependencies required. To install the modules, run `npm install` or `sudo npm install` depending on the operating system used. All the dependencies are automatically installed.

To start the server, run `npm start`. It will run on port 3000 by default.

Routes:
/ - Corresponds to the homepace. Will show a landing page when logged out and the map find interface when logged in
/find/{place_id} - Finds the place shared by a user and displays the locator on a google map
/login - a login page
/place - A URL which returns a JSON containing the list of places. This JSON is fetched from the /places route
/places - Shows the list of places added by the user. Can share or delete places in the page.
/register - Shows a registration form which allows a user to register.