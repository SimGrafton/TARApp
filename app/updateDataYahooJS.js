// Covers both updating existing data and adding new data to selections

// Update Button EventListener
// Load Index html for updating stock data
async function YahooUpdatePage() {

	RefreshIndexData();

	// Read Json file and get the existing stocks held
	await GetSecuritiesFromYahooDir().then(function(response) {

		// Set update or add data boxes
		// Load select box with securites found within json file for user to to select security symbol

		AddDataHTML("<h5>Select Security to update or enter new security</h5>");

		let text = '<input type="text" name="stockSymbolSelect" id="stockSelector" list="options" placeholder="Select or type new"><datalist id="options">'; 

		for (let i in response)
		{
			text +='<option value="' + response[i] + '">' + response[i] + '</option>'; 
		}

		text += '</datalist>';
		AddDataHTML(text);

		// Load Submit Button
		AddDataHTML("<button id='btnUpdateStockSubmit' class='btn btn-primary mt-2 '>View</button>");

		// Sumbit Button Event Listener
		$("#btnUpdateStockSubmit").click(YahooUpdateAfterSelectedPage);

		// Load redo Cache button
		AddDataHTML("<button id='btnReloadCacheSubmit' class='btn btn-primary mt-2 '>Reload Cache</button>");

		// Reload Cache Button Event Listener
		$("#btnReloadCacheSubmit").click(ReloadCacheButton);

	})
	
}

async function ReloadCacheButton(){

	let symbol = document.getElementById("stockSelector").value;

	await ReCache(symbol).then(function(){
		AddDataHTML(`Cache for ${symbol} updated`);
	}); 

}

// Get Stocks from JSON file
async function GetSecuritiesFromYahooDir()
{
	return new Promise(resolve => {

		let stocks = []; 

		fs.readdir('data/yahooData', 'utf8', function (err, files) {
			if (err) {
				console.log("An error has occurred opening json storage file: " + err);
			}
			else {
				// Iterate through file names, remove .json and store in object
				for(let k in files)
				{
					let stock = files[k].substr(0, files[k].indexOf('.json'));
					stocks.push(stock);
				}

				resolve (stocks); 
			} 
		})
	})
};

function YahooUpdateAfterSelectedPage()
{
		let symbol = document.getElementById("stockSelector").value;
		RefreshIndexData();

		// Make space at top otherwise the calendar dropbox open upwards

		// Set calendar with highlighted dates for which daily data is held
		AddDataHTML(`<h5 >View held data and update or add daily data from Yahoo Finance</h5>`);
		AddDataHTML(`<h5 id="security">${symbol}</h5>`);

		// Show held data
		AddDataHTML(`<h5>Calendar</h5>`);
		AddDataHTML(`Held Data is Highlighted`);
		AddDataHTML('<div id="calendar" > </div> ');
		ShowHeldData(symbol); 

		// Spaces
		AddDataHTML('<h5></h5>');
		AddDataHTML('<h5></h5>');

		// Load box to input key to use for ajax yahoo finance Request
		AddDataHTML("<input id='yahooKey' type='text' placeholder='Enter Yahoo Finance Key' >");

		// Load Region Box
		AddDataHTML("<select id='securityRegion'><option value='GB'>GB</option> <option value='US'>US</option></select>"); 

		// Load Submit Button and back button
		AddDataHTML("<button id='btnUpdateStockSubmit' class='btn btn-primary mt-2 '>Update</button><button id='btnBackYahooUpdatePage' class='btn mt-2 '>Back</button>");

		// Load fake send request tickbox
		AddDataHTML(`<div class="form-check">
		<input class="form-check-input" type="checkbox" id="fakeTickbox" value="checked">
		<label class="form-check-label" for="fakeTickbox">
		  Fake Request?
		</label>
	  </div>`)

		// Sumbit Button Event Listener
		$("#btnUpdateStockSubmit").click(SendAPIHttpRequest);

		// Back Button Event Listener
		$("#btnBackYahooUpdatePage").click(YahooUpdatePage);
}

async function ShowHeldData(symbol)
{
	// Get cache dates held for the security submitted
	await GetCachedData(symbol).then(function(cachedData){

		let datesHeld = [];

		// Convert each entry to date time
		for(let i of cachedData){
			let date = new Date(i*1000);
			let dateToAdd = `${("0" + (date.getMonth() + 1)).slice(-2)}/${("0" + date.getDate()).slice(-2)}/${date.getFullYear()}`
			datesHeld[ new Date( dateToAdd )] = new Date( dateToAdd).toString();
		} 
		
		// Datepicker

		let datesForDisable = ["2022-01-01", "2022-01-02"]; 

		jQuery('#calendar').datepicker({
			dateFormat: 'yyyy-mm-dd',
			todayHighlight: true,
			datesDisabled: datesForDisable,
			daysOfWeekDisabled: "0,6",
			beforeShowDay: function( date ) {
				var highlight = datesHeld[date];
				if( highlight ) {
					return [true, "event", "Data for this date is held"]; 
				} else {
					return [true, '', ''];
				}
			}
		});
	})

}


// Gets the Selected Stock and Inputted Yahoo Finance Key and then calls YahooFinanceRequest() with settings set from SetYahooFinanceAPIRequestSettings()
async function SendAPIHttpRequest(){

	let symbol = document.getElementById("security").innerHTML;
	let key = document.getElementById("yahooKey").value;
	let region = document.getElementById("securityRegion").value;

	console.log(`Yahoo Process - Updating ${symbol} data`); 

	let settings = SetYahooFinanceAPIRequestSettings(symbol, key, region);

	// Fake Test or send real ajax request if both key is entered and fake test isnt clicked
	if (settings == 1)
	{
		if($("#fakeTickbox").is(":checked"))
		{
			console.log("Yahoo Test Process - Running program with fake data");

			// Set fake data
			let fakeData = {
					"prices": [{
						"date": 1642602600,
						"open": 18.809999465942383,
						"high": 20.239999771118164,
						"low": 18.760000228881836,
						"close": 20.170000076293945,
						"volume": 36128300,
						"adjclose": 20.170000076293945
					}, {
						"date": 1642516200,
						"open": 18.559999465942383,
						"high": 18.850000381469727,
						"low": 18.469999313354492,
						"close": 18.559999465942383,
						"volume": 13184400,
						"adjclose": 18.559999465942383
					}, {
						"date": 1642170600,
						"open": 18.860000610351562,
						"high": 18.90999984741211,
						"low": 18.520000457763672,
						"close": 18.68000030517578,
						"volume": 12802000,
						"adjclose": 18.68000030517578
					}],
					"isPending": false,
					"firstTradeDate": 477153000,
					"id": "",
					"timeZone": {
						"gmtOffset": -18000
					},
					"eventsData": [{
						"amount": 0.23,
						"date": 1638196200,
						"type": "DIVIDEND",
						"data": 0.23
					}, {
						"amount": 0.23,
						"date": 1630330200,
						"type": "DIVIDEND",
						"data": 0.23
					}, {
						"amount": 0.23,
						"date": 1622122200,
						"type": "DIVIDEND",
						"data": 0.23
					}, {
						"amount": 0.09,
						"date": 1614349800,
						"type": "DIVIDEND",
						"data": 0.09
					}]
				
			}; 

			console.log("Yahoo Test Process - Test run using existing data")

			OpenYahooFileAndWrite(fakeData, symbol);
		}
		else
		{
			return; 
		}
	}
	else
	{
		// Actual send
		await MakeAjaxRequest(settings).then(async function (response) {
			console.log("Yahoo Finance - Ajax request made, calling open file and write"); 

			// Append or update it to json file (works up to 100mb file), if it's there then update, else append
			OpenYahooFileAndWrite(response, symbol);
	
		})
	}
	
}

// Validates symbol and key and returns settings object
function SetYahooFinanceAPIRequestSettings(symbol, key, regionCode)
{

	console.log("Yahoo Process - Defining settings for Yahoo Request"); 

	// Check key is valid
	if(key.length<30)
	{
		OutputError("Key is incorrect. Please input a correct User Key for Yahoo Finance")
		console.log("Key is incorrect");
		return 1;
	}

	// Set the region code of the stocks sought
	if(regionCode.length < 1)
	{
		regionCode = "GB";
	}
	
	// Set the settings for API request to Yahoo Finance API
	const settings = {
			"async": true,
			"crossDomain": true,
			"url": "https://yh-finance.p.rapidapi.com/stock/v3/get-historical-data?symbol=" + symbol + "&region=" + regionCode,
			"method": "GET",
			"headers": {
				"x-rapidapi-host": "yh-finance.p.rapidapi.com",
				"x-rapidapi-key": key
			},
			"success": function () {
				//console.log("Successfully made Get Request");
			},
			"error": function (err) {
				return console.log("Get request failed - " + err);
			}
	};

	return settings; 
}

// Makes the ajax request taking settings variable
async function MakeAjaxRequest(settings) {

	console.log("Yahoo Process - Making Ajax request to Yahoo Finance API"); 
	
	return $.ajax(settings); 
	
}

// Opens file, gets stats of file and check file has size, if so, if file has the stock, updates the values, otherwise it appends.
async function OpenYahooFileAndWrite(data, symbol) {

	console.log("Yahoo Process - Writing new data to json files"); 

	// Get cached Data// Add new data
	await GetCachedData(symbol).then(function(response){

		fs.readFile(`data/yahooData/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
			if (error) { 
				if(error = `Error:  ENOENT: no such file or directory, open 'D:\\projects\\TARWeb\\data\\yahooData\\${symbol}.json'`)
				{
					console.log('Yahoo Process - Existing File not found. Creating new file...' );  
	
					// Set new object and write
					let jsonToAdd = {[`${symbol}`]: {}}; 
					jsonToAdd[`${symbol}`] = data; 
	
					fs.writeFile(`data/yahooData/${symbol}.json`, JSON.stringify(jsonToAdd), function writeJSON(err) {
						if (err) 
						{
							return console.log(err);
						}
						else{ 
							console.log('Yahoo Process - New file created and data added'); 
							ReCache(symbol); 
							return; 
						}
					})
	
				}
				else{
					console.log(`Error Opening file:  ${error}`);
				}
			}
			else {
	
				// Data is there and file is opened as mainJsonFile
	
				// Parse the json returned
				let parsedMainJsonFile = JSON.parse(mainJsonFile); 
				if(!parsedMainJsonFile)
				{
					console.log("Failed to Parse Json");
					return;
				} 

				// Create an array of dates that will not be entered
				let datesNotAdded = []; 
				let datesAdded = []; 

				for(let q of data['prices'])
				{
					// For each new entry, check if in array of cache, if not then add it, if so then put in an array and output not added data
					// if q in response then do not add 
					if (response.includes(q[`date`]))
					{
						datesNotAdded.push(q[`date`]); 
					}
					else{
						// Put data into into array
						parsedMainJsonFile[`${symbol}`]['prices'].push(q); 
						datesAdded.push(q[`date`]);

					}

				}

				// Output dates not added
				alert(`Some data for dates sought is held and has not been added. The following dates have been added: ${datesAdded}`);
				console.log(`Data for the following dates is held and has not been added: ${datesNotAdded}`);
				console.log(`Data for the following dates has been added ${datesAdded}`)
					
	
				fs.writeFile(`data/yahooData/${symbol}.json`, JSON.stringify(parsedMainJsonFile), function writeJSON(err) {
					if (err) 
					{
						console.log(`Error writing data to file: ${err}`);
						return ; 
					}
					else{
						console.log( `Yahoo Process - Data updated`);
						ReCache(symbol); 
					}
				})
			}
		}
	)
	}); 
};

async function GetCachedData(symbol)
{
	return new Promise(resolve => {

		// Open cache
		fs.readFile(`data/cache.json`, 'utf8', function (error, cachedData) {
			if (error) { 
				
				console.log(`Error Opening file:  ${error}`);
				
			}
			else {
				// Parse data
				let parsedCache = JSON.parse(cachedData); 
				resolve(parsedCache[symbol]); 
			}
		})
	})
	
}

// After the new data has been entered into the database, the cache files are recached
async function ReCache(symbol)
{
	// Need to first make the caches then make showdata highlight the stored dates on the calendar

	// Run through the JSON file and get the days held under the symbol and put into a long json string under each year
	console.log(`Yahoo Process - Opening JSON data file for ${symbol} to prepare cache`); 

	// Open file
	fs.readFile(`data/yahooData/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
		if (error) { 
			
			console.log(`Error Opening file:  ${error}`);
			
		}
		else {

			// Parse the json returned
			let parsedMainJsonFile = JSON.parse(mainJsonFile); 

			let datesHeld = []; 

			for(let i of parsedMainJsonFile[symbol]['prices'])
			{
				datesHeld.push(i.date); 
			}

			// Open cache, find the array for the symbol and store
			fs.readFile(`data/cache.json`, 'utf8', function (error2, cache) {
				if (error) { 
					console.log(`Error Opening Cache:  ${error2}`);			
				}
				else{

					// Parse the json returned
					let parsedCache = JSON.parse(cache);
					parsedCache[symbol] = datesHeld; 

					// Save to file
					fs.writeFile(`data/cache.json`, JSON.stringify(parsedCache), function writeJSON(err) {
						if (err) 
						{
							console.log( `Error updating Cache: ${err}`);
							return ; 
						}
						else{
							console.log("Yahoo Process - Cache updated")
						}
					})

				}

			}

			)


		}
	})

} 

