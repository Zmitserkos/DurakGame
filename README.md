# game

1) Before running the application it's necessary to install node.js

2) For running the Node.js-server use the command in the project directory:

  **npm start**
  
3) For running the client part use the adress **localhost:3333** in different tabs of the browser

4) Before compiling typescript-files:

  **npm install -g typescript** 
  
5) For compiling typescript-files use the command (in the directory with the files): 

  **tsc** 

The structure of the app was created by 'generator-ng-fullstack' package.

Testing issues:
- each page of the app contains the **reset storage** button. It's necessery to press it before restarting the application for any tab of the browser.

It's temporary solution for clearing the local storage while testing.
