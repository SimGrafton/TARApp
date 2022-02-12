// Get Stocks from Yahoo data directory
async function GetSecuritiesFromDataDir(dir)
{
	return new Promise(resolve => {

		let stocks = []; 

		fs.readdir(dir, 'utf8', function (err, files) {
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

async function ShowHeldData(symbol, interval)
{
	// Get cache dates held for the security submitted
	await GetCachedData(symbol).then(function(cachedData){

		let datesHeld = [];

		// Convert each entry to date time
		for(let i of cachedData[interval]){
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

async function GetCachedData(symbol)
{
	return new Promise(resolve => {

		// Open cache
		fs.readFile(`data/cache.json`, 'utf8', function (error, cachedData) {
			if (error) { 
				
				console.log(`Error Opening cache file:  ${error}`);
				
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
async function ReCache(symbol, interval)
{
	// Run through the JSON file and get the days held under the symbol and put into a long json string under each year
	console.log(`Shared Process - Opening JSON data file for ${symbol} to prepare cache`); 

	// Open file
	let location;
	let arrayHeader; 
	if (interval == "1m"){
		location = "yfinanceData";
		arrayHeader = "1m";
	}
	else if (interval == "1d")
	{
		location = "yahooData"; 
		arrayHeader = "prices";
	}

	fs.readFile(`data/${location}/${symbol}.json`, 'utf8', function (error, mainJsonFile) {
		if (error) { 
			
			console.log(`Error Opening file:  ${error}`);
			
		}
		else {

			// Parse the json returned
			let parsedMainJsonFile = JSON.parse(mainJsonFile); 

			let datesHeld = []; 

			for(let i of parsedMainJsonFile[symbol][arrayHeader])
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
					parsedCache[symbol][interval] = datesHeld; 

					// Save to file
					fs.writeFile(`data/cache.json`, JSON.stringify(parsedCache), function writeJSON(err) {
						if (err) 
						{
							console.log( `Error updating Cache: ${err}`);
							return ; 
						}
						else{
							console.log("Shared Process - Cache updated")
						}
					})
				}
			}
			)
		}
	})
} 
