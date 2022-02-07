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
Number commits and plan from start to finish of branch. Gone off piste a bit as the improvement added required a
complete restructure. Need to have each task planned and list what I've done.

4-Improvement-timeliness
Changed system so that you now only seek 1m data. This data can then be used to fill 3 min, 1 hour, 1 day etc... data

Commit 1 - Update updateDataYahoo to cache held data
Commit 2 - Update updateDataYahoo to display cached data in calendar
Commit 3 - Update so that yahoo data will appear in show data table. Need to be able to select time period.
Commit 4 - Update updateDataPython to cache held data
Commit 5 - Update updateDataPython to display cached data in calendar
Commit 6 - Update so that python minute data will appear in show data. Need to able to select a day to show that data
Commit 7 - Cache all dates that are not trading days, have a way to input non trading days
Commit 8 - Delete Data for selection. Needs to show data, then allow selection for delete. Needs to then rerun cache. 





5-Feature. Graphs. Implement graphs button
6-Feature. Add ability to see the days of data held. Add the ability to add a weeks worth of data. So that you only have to redo the script once per week.
7-Feature. Create Home Page which shows the bots and other, last updated, data held etc...
8-Feature. Notes Section. Will want this to easily track trading history, patterns, recent thoughts etc...
9-Feature. Data stored on user devices needs to be encrypted. Encrypt the data received. Encrypt the users notes etc...
10-Feature. Status symbol. Have a log of action taken in this section. So that instead of looking to console log can look there.
Could have a light system to show when a process was successful or if there was an issue with the last process. Could 
also be where the loading symbol could be shown with a loading call, then when finished a loading stopped call. 
Could be at bottom of sidebar

Future thoughts:
1. Yahoo finance historical daily data gets the last 254 days ish. So will only need to run the script once
every 250 days for each stock to have updated data. Could create a button to update all stocks.

-- End of To do --

