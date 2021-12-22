// Stocks Supports

function RefreshIndexData()
{
	$('.innerContent').html(''); 
	$('.data').html('');
	$('.data2').html("");
	$('.data3').html("");
}

let stockSymbol = [
	'RR.L'
]

	//  'BARC.L',
//     'BKG.L',
//     'BA.L',
//     'BP.L',
//     'DGE.L',
//     'GLEN.L',
//     'HL.L',
//     'HSBA.L',
//     'IAG.L',
//     'LGEN.L',
//     'LLOY.L',
//     'MRW.L',
//     'RDSA.L',
//     'SSE.L'];

// Get Stocks from JSON file
async function GetSecuritiesFromJSON()
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

		// Fix until added extra add security feature
		text +='<option value="Gold">Gold</option>';


		text += '</select>';

		$('.data').html(text);

		// Load box to input key to use for ajax yahoo finance Request
		$('.data2').html("<input id='yahooKey' type='text' placeholder='Enter Yahoo Finance Key'>");

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

	let settings = SetYahooFinanceAPIRequestSettings(symbol, key);

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
function SetYahooFinanceAPIRequestSettings(symbol, key)
{
	// Check key is valid
	if(key.length<30)
	{
		alert("Key is incorrect");
		console.log("Key is incorrect");
		return 1;
	}

	// Check symbol is valid
	if(symbol != "RR.L"&& symbol != "Gold")
	{
		alert("Security selection is invalid");
		console.log("Security selection is invalid");
		return 1; 
	}

	console.log("Updating " + symbol + " Data"); 

	// Set the region code of the stocks sought
	let regionCode = "GB";

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
async function OpenFileAndWrite(response, symbol) {
	fs.readFile('app/json.json', 'utf8', function (err2, mainJsonFile) {
		if (err2) {
			console.log("An error has occurred opening json storage file: " + err2);
		}
		else {

			// Read file stats to use to check that file has size
			fs.stat('app/json.json', (err, stats) => {
				if (err) {
					console.log(`File doesn't exist.`);
				} 
				else {
					if (stats.size == 0)
					{
						// Create json object
						let text = '{ "stocks" : {}}';

						fs.writeFile('app/json.json', text, function writeJSON(err) {
							if (err) return console.log(err);

							return true; 
						});
					}
					else
					{
						// Check if has stock code object - if it's there then update, else append
							// parse json
						if(!(parsedMainJsonFile = JSON.parse(mainJsonFile)))
						{
							console.log("Failed to Parse Json");
							return;
						};

							// Check if there
						if (parsedMainJsonFile.stocks.hasOwnProperty(symbol)) {
								//Update parsed json
							parsedMainJsonFile.stocks[symbol] = response;

								// Write updated json to file
							fs.writeFile('app/json.json', JSON.stringify(parsedMainJsonFile), function writeJSON(err3) {
								if (err3) return console.log(err);
								console.log("Updated existing data for " + symbol); 
								return true; 
							});

						}
						else {
							// Add entry to parsed json
							parsedMainJsonFile.stocks[symbol] = response;

							// write updated json to file
							fs.writeFile('app/json.json', JSON.stringify(parsedMainJsonFile), function writeJSON(err) {
								if (err) return console.log(err);
								console.log("New Data Added for " + symbol); 
								return true; 
							});
						}

					}

				}
			});

		}
	})
};

$( ".btnDelete" ).click(LoadDeleteHTML);

// Load Index html for delete options
async function LoadDeleteHTML() {

	RefreshIndexData();
  
	$('.innerContent').html('<div class="p-1 text-center">' +
								'<h5 class="mb-1">Select Data to Delete</h5>' + 
							'</div>'); 

	// Load select box to select data symbol

	await GetSecuritiesFromJSON().then(function(response) {
		
		// Load select box with securites found within json file for user to to select security symbol

		let text = '<select name="stockSymbolSelect" id="stockSelector" ><option value="" disabled selected>Select Security</option>'; 

		for (let i in response)
		{
			text +='<option value="' + response[i] + '">' + response[i] + '</option>'; 
		}

		text += '</select>';

		$('.data').html(text);



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



