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

4-Improvement-timeliness
Changed system so that you now only seek 1m data. This data can then be used to fill 3 min, 1 hour, 1 day etc... data

Update rest of code within update code
Change so that when you seek data you only have to fill in one date search box. 
Update so that 1m and all timeliness data will display in charts. 
Update so that data needed is cached, for example recording the data held should not have to run through all data everytime, but cache what is there.
Might be a good time to work out how to cache data in appdata - I need to specify what will be cached, need a list that is held in a json file with option
to reload cache. Maybe just a master reload caches button? Or reload caches on data download only?
Cached items:
- Dates that are non trading days for each region
- Dates for which data is held (as when the files get larger I don't want it to read the entire file each time you want to add new data)

5-Feature. Graphs. Implement graphs button
6-Feature. Add ability to see the days of data held. Add the ability to add a weeks worth of data. So that you only have to redo the script once per week.
7-Feature. Create Home Page which shows the bots and other, last updated, data held etc...

-- End of To do --

