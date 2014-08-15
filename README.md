# Mobile Scratch Player Frontend

This project is the Scott Logic intern's web front-end for the Scratch player. 

This contains a Node.js server to supply the files for projects, generate manifests, and scrape the Scratch website. These are located in the *.js files in the root directory. It also contains an Angular.js app to power the web front-end, which is located in /app/.

## Getting Started

To get the player working on your computer:
  1. Clone the scratch-app repository, and install the dependencies (`npm install`).
  2. Clone the scratch-html5 repository [here](), rename it to `scratch-player`, and place it in the root of this repository. (So the folders in the repository are `app`, `node_modules`, `scrach-player`, `soundbank` and `test`)
  3. Start the server with `npm start`.

You can also see the commands below to install correctly.

### Prerequisites

You need git to clone the repositories. You can get it from [http://git-scm.com/](http://git-scm.com/).

This repository needs Node.js, since there's a Node server running to generate manifests and scrape the Scratch website.

### Cloning the repositories

Clone this repository using [git][git]:

```
git clone https://github.com/WPFerg/scratch-app.git
cd scratch-app
```

Clone the player repository:
```
git clone https://github.com/WPFerg/scratch-html.git scratch-player
```

### Install Dependencies

Run `npm install`. This will call the requisite installations on sub-repositories, such as Bower for the Angular.js app.

### Run the Application

Run `npm start`

Now browse to the app at `http://localhost:3000/`.

## Directory Layout

    app/                --> the Angular.js web app.
      css/              --> the app's CSS files
      fonts/            --> the required Bootstrap fonts for glyphs
      img/              --> the image dependencies (Scratch logo, etc)
      js/               --> the Angular.js app's core files for controllers, directives, services, etc.
      media             --> same as img/
      partials          --> the views for the Angular.js app
    scratch-player/     --> the Scratch player, manually added by following the instructions above
      img/              --> the image dependencies (green flag, etc)
      js/               --> the core javascript files for the player
      soundbank/        --> the soundbank wavs for drums/instruments
      test/             --> Scratch player tests
    test/               --> Angular unit tests


## Testing

There are three separate tests in this project: the web front-end tests, the server tests, and the unit tests for the Scratch player.

To run the unit tests for the web front end: `npm test`

To run the tests for the server:

    Ensure Jasmine v2's installed by
    $ npm install jasmine-node@2.0
    then ensure the node server's up with
    $ npm start
    in another terminal, run
    $ jasmine-node --verbose test/node-server-test.js  --matchAll

To run the unit tests for the Scratch player:
```
cd scratch-player
npm test
```

## Contact

[Scott Logic]: http://www.scottlogic.com
[LLK's Scratch]: http://github.com/LLK/scratch-html5
[Angular]: http://angularjs.org/
[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[karma]: http://karma-runner.github.io
[travis]: https://travis-ci.org/
[http-server]: https://github.com/nodeapps/http-server