# Durak Game

1) Before running the application it's necessary to install **node.js** (version **6.5** and above)

2) Run **npm install** command in the directory of the application to install all the necessary packages.

3) Make a project bundle for development or production by running the commands below:

    - Development: **npm run build-dev** or **NODE_ENV=development gulp build**

    - Production **npm run build-dist**  **NODE_ENV=production gulp build**

4) For running the Node.js-server use the command in the project directory:

  **npm start**

5) For running the client part use the adress **localhost:3333** in different tabs of the browser

6) For executing e2e-tests follow the description below:
    - run the command **webdriver-manager start** or in case of error **sudo webdriver-manager start**
    - run the command **npm start** in new terminal window
    - run the command **protractor protractor.conf.js** in new terminal window


Testing issues:
- each page of the app contains the **reset storage** button. It's necessary to press it before restarting the application for any tab of the browser.

It's temporary solution for clearing the local storage while testing.
