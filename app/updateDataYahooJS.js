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

	})
	
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

		// Set calendar with highlighted dates for which daily data is held
		AddDataHTML(`<h5>View held data and update or add daily data from Yahoo Finance${symbol}</h5>`);
		AddDataHTML(`<h5 id="security">${symbol}</h5>`);

		// Show held data
		AddDataHTML(`<h5>Calendar</h5>`);
		AddDataHTML(`Held Data is Highlighted`);
		AddDataHTML('<input id="date" data-provide="datepicker" name="date_from" >');
		ShowHeldData(symbol); 

		// Spaces
		AddDataHTML('<h5></h5>');
		AddDataHTML('<h5></h5>');

		// Load box to input key to use for ajax yahoo finance Request
		AddDataHTML("<input id='yahooKey' class = 'm-1' type='text' placeholder='Enter Yahoo Finance Key' >");

		// Load Region Box
		AddDataHTML("<select id='securityRegion'><option value='GB'>GB</option> <option value='US'>US</option></select>"); 

		// Load Submit Button and back button
		AddDataHTML("<button id='btnUpdateStockSubmit' class='btn btn-primary mt-2 '>Update</button><button id='btnBackYahooUpdatePage' class='btn mt-2 '>Back</button>");

		// Sumbit Button Event Listener
		$("#btnUpdateStockSubmit").click(SendAPIHttpRequest);

		// Back Button Event Listener
		$("#btnBackYahooUpdatePage").click(YahooUpdatePage);
}

async function ShowHeldData(symbol)
{

	// Need to get cache dates held for the security submitted


	// Need to get cached dates that are excluded


	let datesForDisable = ["2022-01-01", "2022-01-02"]; 
	let dataForHighlight = ["2022-01-04"];

	$('#date').datepicker({ 
	//startDate: date,
	multidate: true,
	format: 'yyyy-mm-dd',
	todayHighlight: true,
	datesDisabled: datesForDisable,
	multidateSeparator: ',  ',
	daysOfWeekDisabled: "0,6",
	beforeShowDay: function(date) {
		for(let i of dataForHighlight){
			let thisDate = new Date(date).toISOString().split('T')[0]; 
			 
			if(i == thisDate){
				return {classes: 'highlighted', tooltip: 'Data for this date is held'};
			}
		}
		
	 },
	templates : {
	}
	});

	$(`highlighted`).css('background-color: blue;')

}


// Gets the Selected Stock and Inputted Yahoo Finance Key and then calls YahooFinanceRequest() with settings set from SetYahooFinanceAPIRequestSettings()
async function SendAPIHttpRequest(){

	let symbol = document.getElementById("security").innerHTML;
	let key = document.getElementById("yahooKey").value;
	let region = document.getElementById("securityRegion").value;

	console.log(`Updating ${symbol} data`); 
	AddDataHTML(`Updating ${symbol} data`);

	let settings = SetYahooFinanceAPIRequestSettings(symbol, key, region);

	if (settings != 1)
	{
		// Fake send
		let response = [{
			"Gold": [{
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
				}]
			}]
		}]
		OpenYahooFileAndWrite(response, symbol);

		// // Actual send
		// await MakeAjaxRequest(settings).then(async function (response) {
		// 	console.log("Ajax request made, calling open file and write"); 

		// 	// Append or update it to json file (works up to 100mb file), if it's there then update, else append
		// 	OpenYahooFileAndWrite(response, symbol);
	
		// })
	}
	
}

// Validates symbol and key and returns settings object
function SetYahooFinanceAPIRequestSettings(symbol, key, regionCode)
{

	console.log("- Defining settings for Yahoo Request"); 
	AddDataHTML("- Defining settings for Yahoo Request");

	// Check key is valid
	if(key.length<30)
	{
		alert("Key is incorrect");
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

	console.log("- Making Ajax request to Yahoo Finance API"); 
	AddDataHTML("- Making Ajax request to Yahoo Finance API");
	
	return $.ajax(settings); 
	
}

// Opens file, gets stats of file and check file has size, if so, if file has the stock, updates the values, otherwise it appends.
async function OpenYahooFileAndWrite(data, symbol) {

	// ALSO NEEDS TO CHECK WHAT DATA IS HELD

	console.log("- Writing new data to json files"); 
	AddDataHTML("- Writing new data to json files");

	fs.readFile(`data/yahooData/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
		if (error) { 
			if(error = `Error:  ENOENT: no such file or directory, open 'D:\\projects\\TARWeb\\data\\yahooData\\${symbol}.json'`)
			{
				AddDataHTML('Existing File not found. Creating new file...' );  

				// Set new object and write
				let jsonToAdd = {[`${symbol}`]: {}}; 
				jsonToAdd[`${symbol}`] = [data]; 

				fs.writeFile(`data/yahooData/${symbol}.json`, JSON.stringify(jsonToAdd), function writeJSON(err) {
					if (err) 
					{
						AddDataHTML(err);
						return console.log(err);
					}
					else{ 
						AddDataHTML('New file created and data added' );
						console.log('New file created and data added'); 
						ReCache(symbol); 
						return; 
					}
				})

			}
			else{
				console.log(`Error Opening file:  ${error}`);
				AddDataHTML('Error Opening file' );
			}
		}
		else {

			// Data is there and file is opened as mainJsonFile, need to parse the json into a js object, and check each entry against the first and last dates of the new data obtained. 

			// Parse the json returned
			let parsedMainJsonFile = JSON.parse(mainJsonFile); 
			if(!parsedMainJsonFile)
			{
				console.log("Failed to Parse Json");
				AddDataHTML( "Failed to Parse Json"); 
				return;
			} 

			console.log(parsedMainJsonFile[symbol][0]); 
		
				// Add json
				parsedMainJsonFile[`${symbol}`].push(data);

				fs.writeFile(`app/json.json`, JSON.stringify(parsedMainJsonFile), function writeJSON(err) {
					if (err) 
					{
						console.log(err);
						AddDataHTML( `Error writing data to file: ${err}`); 
						return ; 
					}
					else{
						AddDataHTML( `Data updated`);
						console.log("Data updated")
						ReCache(symbol); 
					}
				})
			}
		}
		)
};

// After the new data has been entered into the database, the cache files are recached
function ReCache(symbol)
{
	// Need to first make the caches then make showdata highlight the stored dates on the calendar

	console.log('Caching')
	// Run through the JSON file and get the days held under the symbol and put into a long json string under each year

} 