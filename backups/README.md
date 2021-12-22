-- Files set up --
To get working from : https://www.google.com/search?q=electron+with+bootstrap&oq=electr&aqs=chrome.0.69i59l3j69i60l3j69i65l2.1040j0j7&sourceid=chrome&ie=UTF-8
main.js add file path of index.html "app/index.js"

To get Jquery working, needed to copy in the following into the bottom of html inside body tags:
<!-- Insert this line above script imports  -->
<script>if (typeof module === 'object') { window.module = module; module = undefined; }</script>

<!-- normal script imports etc  -->
<script src="../node_modules/jquery/dist/jquery.min.js"></script>
<script src="renderer.js"></script>
<script src="js.js"></script>

<!-- Insert this line after script imports -->
<script>if (window.mondule) module = window.module;</script>

-- End of Files Set Up -- 


-- Full Set up -- 

Clone repo
Install Node.js - https://nodejs.org/en/download/ - Windows Installer (This will also install chocolatey, python, npm)
Restart
Then, install the packages below with NPM

Installs:
npm i electron
npm i jquery
npm i bootstrap
npm i tether
npm i popper.js
npm i @popperjs/core
npm i bootstrap-table

run app with npm start

-- End of full set up --


-- App Use --

To reload electron app after code updates:
ctrl + r from within app or view -> reload

-- End of App Use --


-- To do --

Currently the program gets the data of the requested stock. I currently only want this to be 1 stock but may 
expand this to a list of more of the ftse 100. Only getting 1 stock massively reduces the amount of requests
I will need to make and implementing the calculations and bots will be much easier targeting 1 stock than
attempted ot implement it on confusing data. 

- Removed border, added close, min buttons, sidebar, sidebar dropdowns, 

- Change Update Data to load into the html a select box and an Update Data Button, with key box within
- Implement loading symbol when clicking Show Table "Loading Data"
- Update so you can select what stock to seek, for now, only seek Gold and RR.L stock
- Update so that you can seek the timeliness of data, perhaps expanding the json file so that data is split by timelinesses
- Update removing the login key so that repo can be made public, make sure the data isn't in any previous commits
- Implement graphs button
- Implement authentication?

-- End of To do --

