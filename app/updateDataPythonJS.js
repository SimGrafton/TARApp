//For Running Python Script
'use strict';
const { rejects } = require('assert');
const { spawn } = require( 'child_process' );
const { Console } = require('console');

// Update Button EventListener
// Load Index html for updating stock data
function PythonUpdatePage() {

	RefreshIndexData();

	// Load Title
	AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Add Security Data</h5></div>'); 

	// Load Security Search Box
	AddDataHTML('<input id="stockSelector" type="text" placeholder="Enter Security Identifier.." default="RR.L"></input>'); 

	// Load Region box (no longer requred) 
	AddDataHTML('<input id="securityRegion" type="text" placeholder="Enter Security Region.."></input>'); 
	
	// Load Timeliness Selection box with options
	AddDataHTML(`<select name="timelinessSelect" id="intervalSelector" ><option value="" disabled selected>Select Timeliness</option>
						<option value="1m" selected="selected">1 Minute</option>
					</select>`);

	// Create Date Picker with start // no longer need enddate '<input type="date" id="endDate" name="trip-start"value="2022-01-05">'
	AddDataHTML('<input type="date" id="startDate" name="trip-start"value="2022-01-04">');

	// Create Date Picker with start and end dates
	//AddDataHTML('<h5>Select Dates and Update Data</h5>');
	//AddDataHTML('<div class="input-group input-daterange"><input type="text" id="startDate" class="form-control m-1" value="2022-01-04"><div class="input-group-addon">to</div><input type="text" id="endDate" class="form-control m-1" value="2022-01-05"></div>');

	// Load Submit Button
	AddDataHTML("<button id='btnAddStockSubmit' class='btn btn-primary mt-2 '>Add</button>");

	// Submit button event listener
	$("#btnAddStockSubmit").click(AddDataProcess);
	
}; 

function AddDataProcess()
{

	AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Adding Data</h5></div>' ); 

	// Get Security Selected
	let securitySelected = document.getElementById("stockSelector").value.toUpperCase();

	// Get Interval Selected
	let interval = document.getElementById("intervalSelector").value;

	// Get Start Date
	let startDate = document.getElementById("startDate").value;

	// Get End Date
	//let endDate = document.getElementById("endDate").value;

	try
	{
		RunYfinanceScript(securitySelected, interval, startDate)
		
		// Below function can be used instead of above to skip the api call script for testing
		//CleanseReturnedData(securitySelected, interval, startDate, endDate ); 
	}
	catch(err)
	{
		console.log("Caught Error: " + err);
		return;
	}
	
}

// Runs python script to make yfinance api call, if successful, a file with the new data will be created in the python folder. Then runs Cleanse data function.
async function RunYfinanceScript(securitySelected, interval, startDate)
{
	AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Running YFinance Script</h5></div>' ); 

	// Split up the startdate
	let startYear = startDate.slice(0, 4);
	let startMonth = Has0(startDate.slice(5,7));
	let startDay = Has0(startDate.slice(8,10)); 
 
	// Split up the enddate
	let endDate = addDay(startDate);
	
	//let endYear = endDate.slice(0, 4);
	//let endMonth = Has0(endDate.slice(5,7));
	//let endDay = Has0(endDate.slice(8,10)); 

	let endMonth = endDate.getUTCMonth() + 1;
	let endDay = endDate.getUTCDate();
	let endYear = endDate.getUTCFullYear();

	// Execute cmd instructions
	
	const dir = spawn( 'cmd', [ '/c', `cd python & py startpy.py ${securitySelected} ${startYear} ${startMonth} ${startDay} ${endYear} ${endMonth} ${endDay} ${interval}` ] );

	// Output cmd responses if successful
	let result = true; 

	dir.stdout.on( 'data', function(data){
		//console.log( `stdout: ${ data }` ) 
		result = data.includes("Failed download"); 
		if(result){
			console.log( `stdout: ${ data }` ); 
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

async function CleanseReturnedData(securitySelected, interval, startDate, endDate )
{

	AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Formatting New Data</h5></div>' );  

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

			setTimeout(function(){
				// Load Submit Button
				AddDataHTML("<button id='btnAddStockSubmit' class='btn btn-primary mt-2 '>Add</button>")

				// Submit button event listener
				$("#btnAddStockSubmit").click(AddDataProcess);
			},5000)
				
		})
		
	}
}

// Opens file within Python folder created by the python script and returns it.
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

// Opens file, gets stats of file and check file has size, if so, if file has the stock, updates the values, otherwise it appends.
async function OpenFileAndWrite(data, symbol, interval, date) {

	fs.readFile(`data/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
		if (error) { 
			if(error = `Error:  ENOENT: no such file or directory, open 'D:\\projects\\TARWeb\\data\\${symbol}.json'`)
			{
				AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Existing File not found. Creating new file...</h5></div>' );  

				// Set new object and write
				let jsonToAdd = {[`${symbol}`]: {}}; 
				jsonToAdd[`${symbol}`][`${interval}`] = [data]; 

				fs.writeFile(`data/${symbol}.json`, JSON.stringify(jsonToAdd), function writeJSON(err) {
					if (err) 
					{
						return console.log(err);
					}
					else{
						AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">New file created and data added</h5></div>' );
					}
				})

			}
			else{
				console.log(`Error Opening file:  ${error}`);
				AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Error</h5></div>' );
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
						AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Data for date exists already. Data not added</h5></div>' );
						return;
					}
				}
				
				AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Data for date not found. Adding Data</h5></div>' );
				
				// Add json
				parsedMainJsonFile[`${symbol}`][`${interval}`].push(data);

				fs.writeFile(`data/${symbol}.json`, JSON.stringify(parsedMainJsonFile), function writeJSON(err) {
					if (err) 
					{
						AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Error</h5></div>' );
						return;

					}
					else{
						AddDataHTML('<div class="p-1 text-center"><h5 class="mb-1">Data updated</h5></div>' );
					}
				})
			}
		}
	})
};

// -------------------- HELPER FUNCTIONS --------------------
// Helper function. Checks whether the first element is 0 and if so it removes it. Required as the cmd arguments and yfinance python script fails if 01 represents jan rather than just 1, whereas the html date selector outputs as 01
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

// Add one day to date
function addDay(date) {

	const dateOld = new Date(date);
	dateOld.setDate(dateOld.getDate() + 1);
	return dateOld; 
};
