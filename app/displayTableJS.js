function RefreshIndexData()
{
	$('.innerContent').html(''); 
	$('.data').html('');
	$('.data2').html("");
	$('.data3').html("");
}

$('.btnShow').click(async function() {

	RefreshIndexData();
	
	$('.innerContent').html('<div class="p-1 text-center">' +
								'<h5 class="mb-1">Select Data to Display in Table</h5>' + 
							'</div>'); 

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
		$('.data3').html("<button id='btnLoadTableSubmit' class='btn btn-primary mt-2 '>Update</button>");

		// Sumbit Button Event Listener
		$("#btnLoadTableSubmit").click(LoadTable);
	})

});

// Show data button
function LoadTable() {

	let stock = document.getElementById("stockSelector").value;

	RefreshIndexData(); 
	
	$('.innerContent').html('Loading data into table...');
	$('.data').html('<div class="spinner-border text-info" role="status"><span class="sr-only">Loading...</span></div>'); // Loading spinner

	console.log("Opening Json file");

	fs.readFile('app/json.json', 'utf8', function (err, mainJsonFile) {
		if (err) {
			console.log(err);
			alert("An error has occurred opening json storage file.");
		}
		else {
			console.log("Json file opened");
			if(parsedMainJsonFile = JSON.parse(mainJsonFile)){
				console.log("Json parsed, loading into table");
				$('.innerContent').html(stock);
				DrawTable(); 
				//alert(JSON.stringify(parsedMainJsonFile.stocks[stock])); 
				AddDataToTable(parsedMainJsonFile.stocks[stock], stock);
				
			}
			else{         
				console.log("Unable to parse json file to display data");
			}

		}

	})
}; 

function DrawTable(){
	// Set headers for table
	$('.data').html('<table id="table" data-height="400" data-virtual-scroll="true"><thead><tr>'+
							'<th data-field="unixDate" data-width="300" data-sortable="true">Unix Date</th>'+
							'<th data-field="date" data-width="300">Date</th>'+
							'<th data-field="time">Time</th>'+
							'<th data-field="open">Open</th>'+
							'<th data-field="high">High</th>'+
							'<th data-field="low">Low</th>'+
							'<th data-field="close">Close</th>'+
							'<th data-field="volume">Volume</th>'+
					'</tr></thead></table>');
	
	// Initialise bootstrap table
	let $table = $('#table'); 
	$table.bootstrapTable(); 

}; 

function AddDataToTable(parsedMainJsonFile, stock){
	let $table = $('#table'); 

	// Get length of data array
	let pricesNum = Object.keys(parsedMainJsonFile.prices).length; 

	for(i = 0; i < pricesNum; i++){
		// Add rows
		$table.bootstrapTable('insertRow', {
			index: 1,
			row: {
			unixDate: parsedMainJsonFile.prices[i].date, 
			date: DateConverter(JSON.stringify(parsedMainJsonFile.prices[i].date)),
			time: TimeConverter(JSON.stringify(parsedMainJsonFile.prices[i].date)), 
			open: Round(Number(JSON.stringify(parsedMainJsonFile.prices[i].open))),
			high: Round(Number(JSON.stringify(parsedMainJsonFile.prices[i].high))),
			low: Round(Number(JSON.stringify(parsedMainJsonFile.prices[i].low))),
			close: Round(Number(JSON.stringify(parsedMainJsonFile.prices[i].close))),
			volume: JSON.stringify(parsedMainJsonFile.prices[i].volume)
			}
		})
	}

	// Sort the table after entering data
	$("th[data-field='unixDate'] .sortable").click();

}

// convert unix time to date
function DateConverter(UNIX_timestamp){
	let a = new Date(UNIX_timestamp * 1000);
	//let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	let year = a.getFullYear();
	//let month = months[a.getMonth()];
	let month = a.getMonth() + 1; 
	let date = a.getDate();
	let day = date + '/' + month + '/' + year;
	return day;
}

function TimeConverter(UNIX_timestamp){
	let a = new Date(UNIX_timestamp * 1000);
	let hour = a.getHours();
	let min = a.getMinutes();
	let sec = a.getSeconds();
	let time = hour + ':' + min + ':' + sec ;
	return time;
}

function Round(num){
	return Math.round((num + Number.EPSILON) * 100) / 100; 
};