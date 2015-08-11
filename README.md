## Evil Evaluator

Live demo: <http://theanam.github.io/evileval>

====
A small and **highly experimental** project for live code demonstration in JavaScript during presentations or public speeches.

### How to use

If you're using the web version available on: <a href="http://theanam.github.io/evileval">http://theanam.github.io/evileval</a>, then it's simple. Write code in the top part, the bottom part acts like the console output. every `console.log` will output there.

To run the code press the run button or press <kbd>Ctrl</kbd>+<kbd>Enter</kbd>

### Setting Up Locally

* With NodeJS

```
npm i -g bower # install bower
bower install # install the components
npm install # install express and others
npm start # start the express server
```
This should launch a local server ready for using. 

* Without NodeJS

If you would like to deploy it somewhere where NodeJS is not an option (eg. Github pages), you can deploy it without NodeJS. However, you need to install the dependencies using bower and include the `bower_components` directory with it. 

```
npm i -g bower
bower install
```

>> Don't forget to update `baseUrl` variable in the `assets/script.js` file for embed to work properly

### Contributing

Any good patches are always appreiated


### Tools Used

Code mirror - <http://codemirror.net>
