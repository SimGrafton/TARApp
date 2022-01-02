-- Full Set up -- 

Clone repo
Install Node.js - https://nodejs.org/en/download/ - Windows Installer (This will also install chocolatey, python, npm)
Restart
"npm install" from within main folder
run app with "npm start" from within main folder

-- End of full set up --


-- App Use --

To reload electron app after code updates:
ctrl + r from within app or view -> reload

-- End of App Use --


-- To do --

4-Improvement-timeliness. Update so that you can seek the timeliness of data, perhaps expanding the 
json file so that data is split by timelinesses. Need to change update data to allow selection of timelinesses and to
store correctly. Then need to update show data so that you can select by timeliness (or so you click expand then it gets
the intraday data?

This is a bigger issue than I thought, in order to reliably get historical data on a minute timestamp, I therefore have
2 options:
1. Start a new record collection for each stock. This would be a script that would run each minute during the trading day
and would record the price into a json file.
2. Write code to get this data from charts online




5-Feature-graphs. Implement graphs button

-- End of To do --

