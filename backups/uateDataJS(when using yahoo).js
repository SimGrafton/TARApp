// For Running Python Script
'use strict';
const { rejects } = require('assert');
const { spawn } = require( 'child_process' );
const { Console } = require('console');

// Get Stocks from JSON file
async function GetSecuritiesFromJSON(security)
{
	return new Promise(resolve => {

		let stocks = []

		fs.readFile('app/json.json', 'utf8', function (err, mainJsonFile) {
			if (err) {
				console.log("An error has occurred opening json storage file: " + err);
			}
			else {
				// Parse json
				let parsedMainJsonFile = JSON.parse(mainJsonFile);

				// Iterate through keys within stocks and store in object
				for(var k in parsedMainJsonFile['stocks'])
				{
					stocks.push(k);
				}

				resolve (stocks); 
			} 
		})
	})
};

// Update Button EventListener
// Load Index html for updating stock data
$(".btnUpdate").click(async function () {

	RefreshIndexData();

	$('.innerContent').html('<div class="p-1 text-center">' +
								'<h5 class="mb-1">Select Data to Update</h5>' + 
							'</div>'); 

	await GetSecuritiesFromJSON().then(function(response) {
		
		// Load select box with securites found within json file for user to to select security symbol

		let text = '<select name="stockSymbolSelect" id="stockSelector" ><option value="" disabled selected>Select Security</option>'; 

		for (let i in response)
		{
			text +='<option value="' + response[i] + '">' + response[i] + '</option>'; 
		}

		text += '</select>';

		$('.data1').html(text);

		// Load box to input key to use for ajax yahoo finance Request
		$('.data2').html("<input id='yahooKey' type='text' placeholder='Enter Yahoo Finance Key' ><input id='securityRegion' type='text' placeholder='Enter Security Region..'></input>");

		// Load Submit Button
		$('.data3').html("<button id='btnUpdateStockSubmit' class='btn btn-primary mt-2 '>Update</button>");

		// Sumbit Button Event Listener
		$("#btnUpdateStockSubmit").click(SendAPIHttpRequest);

	})
	
})


// Gets the Selected Stock and Inputted Yahoo Finance Key and then calls YahooFinanceRequest() with settings set from SetYahooFinanceAPIRequestSettings()
async function SendAPIHttpRequest(){
	
	
	let symbol = document.getElementById("stockSelector").value;
	let key = document.getElementById("yahooKey").value;
	let region = document.getElementById("securityRegion").value; 

	let settings = SetYahooFinanceAPIRequestSettings(symbol, key, region);

	if (settings != 1)
	{
		await MakeAjaxRequest(settings).then(async function (response) {
			var json = JSON.stringify(response);
			//console.log("Faking call openfileandwrite()"); 

			// Append or update it to json file (works up to 100mb file), if it's there then update, else append
			OpenFileAndWrite(response, symbol);
	
		})
	}
	
}

// Validates symbol and key and returns settings object
function SetYahooFinanceAPIRequestSettings(symbol, key, regionCode)
{
	// Check key is valid
	if(key.length<30)
	{
		alert("Key is incorrect");
		console.log("Key is incorrect");
		return 1;
	}

	console.log("Updating " + symbol + " Data"); 

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
	
	//console.log("Faking making ajax request")
	
	return $.ajax(settings); 
	
}

// Opens file, gets stats of file and check file has size, if so, if file has the stock, updates the values, otherwise it appends.
async function OpenFileAndWrite(data, symbol, interval, date) {

	fs.readFile(`data/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
		if (error) { 
			if(error = `Error:  ENOENT: no such file or directory, open 'D:\\projects\\TARWeb\\data\\${symbol}.json'`)
			{
				console.log("File not found. Creating file"); 

				// Set new object and write
				let jsonToAdd = {[`${symbol}`]: {}}; 
				jsonToAdd[`${symbol}`][`${interval}`] = [data]; 

				fs.writeFile(`data/${symbol}.json`, JSON.stringify(jsonToAdd), function writeJSON(err) {
					if (err) 
					{
						return console.log(err);
					}
					else{
						console.log("New file created and data added")
					}
				})

			}
			else{
				console.log(`Error Opening file:  ${error}`);
			}
		}
		else {

			// Parse the json returned
			let parsedMainJsonFile = JSON.parse(mainJsonFile); 
			if(!parsedMainJsonFile)
				{
					console.log("Failed to Parse Json");
					return;
				} 

			if(interval == "1m")
			{
				// Check if there
				for(let i of parsedMainJsonFile[`${symbol}`][`${interval}`])
				{
					if(i.date == date)
					{
						console.log("Data for date exists already. Data not added");
						return;
					}
				}

				console.log("Data for date not found. Adding Data");

				// Add json
				parsedMainJsonFile[`${symbol}`][`${interval}`].push(data);

				fs.writeFile(`data/${symbol}.json`, JSON.stringify(parsedMainJsonFile), function writeJSON(err) {
					if (err) 
					{
						return console.log(err);
					}
					else{
						console.log("Data updated")
					}
				})
			}
		}
	})
};

$( ".btnDelete" ).click(LoadDeleteHTML);

// Load Index html for delete options
async function LoadDeleteHTML() {

	RefreshIndexData();
  
	$('.innerContent').html(`<div class="p-1 text-center">
								<h5 class="mb-1">Select Data to Delete</h5>
							</div>`); 

	// Load select box to select data symbol

	await GetSecuritiesFromJSON().then(function(response) {
		
		// Load select box with securites found within json file for user to to select security symbol

		let text = '<select name="stockSymbolSelect" id="stockSelector" ><option value="" disabled selected>Select Security</option>'; 

		for (let i in response)
		{
			text +=`<option value="${response[i]}">${response[i]}</option>`; 
		}

		text += '</select>';

		$('.data1').html(text);



		// Load Submit Button
		$('.data3').html("<button id='btnDeleteStockSubmit' class='btn btn-primary mt-2 '>Delete</button>");

		// Sumbit Button Event Listener
		$("#btnDeleteStockSubmit").click(DeleteData);
	})
};

// Delete JSON stock data
function DeleteData()
{
	let symbol = document.getElementById("stockSelector").value;

	let file = "app/json.json";

	fs.readFile(file, 'utf8', function readFileCallback(err, mainJsonFile){
		if (err){
			console.log(err);
			alert("An error has occurred opening main json file to delete object.");
		} else {
		let obj = JSON.parse(mainJsonFile);
		delete obj.stocks[symbol];
		fs.writeFile(file, JSON.stringify(obj), 'utf8', function(err){
			if(err)
			{
				console.log(err)
			}
			else
			{
				console.log(symbol + ' data deleted'); 
				LoadDeleteHTML(); 
			}; 
			
		});
		}
	}); 
}

// Event Listener for add securities data button
$( ".btnAdd" ).click(LoadAddHTML);

// Load html for add 

function LoadAddHTML()
{
	RefreshIndexData();

	// Load Title
	$('.innerContent').html('<div class="p-1 text-center"><h5 class="mb-1">Add Security Data</h5></div>'); 

	// Load Security Search Box
	// Load Region box (no longer requred) <input id="securityRegion" type="text" placeholder="Enter Security Region.."></input>
	$('.data1').html('<input id="stockSelector" type="text" placeholder="Enter Security Identifier.." default="RR.L"></input>'); 

	// Load Timeliness Selection box with options
	$('.data2').html(`<select name="timelinessSelect" id="intervalSelector" ><option value="" disabled selected>Select Timeliness</option>
						<option value="1m" selected="selected">1 Minute</option>
					</select>`);


					// <option value="2m">2 Minutes</option>
					// 	<option value="5m">5 Minutes</option>
					// 	<option value="15m">15 Minutes</option>
					// 	<option value="30m">30 Minutes</option>
					// 	<option value="1h">1 Hour</option>
					// 	<option value="1d">1 Day</option>
					// 	<option value="5d">5 Days</option>
					// 	<option value="1wk">1 Week</option>
					// 	<option value="1mo">1 Month</option>
					// 	<option value="3mo">3 Months</option>

	// Create Date Picker with start and end dates
	$('.data3').html('<input type="date" id="startDate" name="trip-start"value="2022-01-04"><input type="date" id="endDate" name="trip-start"value="2022-01-05">');
	
	// Load box to input key to use for ajax yahoo finance Request (No longer required)
	//$('.data3').html("<input id='yahooKey' type='text' placeholder='Enter Yahoo Finance Key'>");

	// Load Submit Button
	$('.data4').html("<button id='btnAddStockSubmit' class='btn btn-primary mt-2 '>Add</button>");

	// Submit button
	$("#btnAddStockSubmit").click(AddDataProcess);
}

async function AddDataProcess()
{

	// Get Security Selected
	let securitySelected = document.getElementById("stockSelector").value.toUpperCase();

	// Get Interval Selected
	let interval = document.getElementById("intervalSelector").value;

	// Get Start Date
	let startDate = document.getElementById("startDate").value;

	// Get End Date
	let endDate = document.getElementById("endDate").value;

	try
	{
		RunYfinanceScript(securitySelected, interval, startDate, endDate)
		//CleanseReturnedData(securitySelected, interval, startDate, endDate ); 
	}
	catch(err)
	{
		console.log("Caught Error: " + err);
		return;
	}
	
}

async function RunYfinanceScript(securitySelected, interval, startDate, endDate)
{
	// TO DO Check whether data has been entered else don't submit "break myFunction;"

	// Split up the startdate
	let startYear = startDate.slice(0, 4);
	let startMonth = Has0(startDate.slice(5,7));
	let startDay = Has0(startDate.slice(8,10)); 
 
	// Split up the enddate
	let endYear = endDate.slice(0, 4);
	let endMonth = Has0(endDate.slice(5,7));
	let endDay = Has0(endDate.slice(8,10)); 


	// Execute cmd instructions
	
	const dir = spawn( 'cmd', [ '/c', `cd python & py startpy.py ${securitySelected} ${startYear} ${startMonth} ${startDay} ${endYear} ${endMonth} ${endDay} ${interval}` ] );

	// Output cmd responses if successful
	let result = true; 

	dir.stdout.on( 'data', function(data){
		console.log( `stdout: ${ data }` ) 
		result = data.includes("Failed download"); 
		if(result){
			return;
		}		
	})

	// if unsuccessful
	dir.stderr.on( 'data', function(data){
		console.log( `stderr: ${ data }` );
		console.log("Error in YFinance Call"); 
	}); 

	// On close of child process
	dir.on( 'close', function(close){
		if(!result){
			CleanseReturnedData(securitySelected, interval, startDate, endDate); 
		}	
	})

}

// Checks whether the first element is 0 and if so it removes it. Required as the cmd arguments and yfinance python script fails if 01 represents jan rather than just 1, whereas the html date selector outputs as 01
function Has0(num)
{
	if(num[0] == 0)
	{
		return num.slice(1);
	}
	else
	{
		return num;  
	}
	
}

async function CleanseReturnedData(securitySelected, interval, startDate, endDate )
{

	AppendDataHTML(5, " - Clensing Data"); 

	// Set the date to 8am (market open time UK)
	let originalDate = (new Date(startDate).getTime() / 1000) + 28800;

	if (interval == "1m")
	{
		// Open the new file using the securitySelected which will be the file name + .txt and use the interval to get the right data, and the timeframe to get the right period
		await GetNewJSONData(securitySelected).then(function(response) {
	
			let data = JSON.parse(`[${response}]`);
			let date = originalDate; 
			let jsonNewData = {
							"date": date,
							"prices": []
						};
	
			for(let i of data){

				let object = {
					"time" : date,
					"price" : i.Open,
					"volume" : i.Volume
				}
				
				jsonNewData.prices.push(object); 
				date += 60; // Increment unix time by 1 minute each iteration
	
			}

			// Add data to file
			OpenFileAndWrite(jsonNewData, securitySelected, interval, originalDate); 
	
		}); 
	}
}

async function GetNewJSONData(securitySelected)
{
	return new Promise(resolve => {

		fs.readFile(`python/${securitySelected}.txt`, 'utf8', function (err, data) {
			if (err) {
				console.log(`An error has occurred opening newly sought json data: ${err}`);
			}
			else {
				// Return data
				resolve(data); 
			} 
		})
	})
};
