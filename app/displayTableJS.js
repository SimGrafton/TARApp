// Show data button
$('.btnShow').click(function() {

    // Stock selector
    LoadSelectorPage(); 
	
});

async function LoadSelectorPage() {

	RefreshIndexData();

	// Read Json file and get the existing stocks held
	await GetSecuritiesFromYahooDir().then(function(response) {

		// Set update or add data boxes
		// Load select box with securites found within json file for user to to select security symbol

		AddDataHTML("<h5>Select Security to view data for</h5>");

		let text = '<input type="text" name="stockSymbolSelect" id="stockSelector" list="options" placeholder="Select Security"><datalist id="options">'; 

		for (let i in response)
		{
			text +='<option value="' + response[i] + '">' + response[i] + '</option>'; 
		}

		text += '</datalist>';
		AddDataHTML(text);

        AddDataHTML('<select id="interval"><option value="1d">Daily</option><option value="1m">Minute</option></select>'); 

		// Load Submit Button
		AddDataHTML("<button id='btnViewStockSubmit' class='btn btn-primary mt-2 '>View</button>");

		// Sumbit Button Event Listener
		$("#btnViewStockSubmit").click(LoadDateSelectorPage);

	})
	
}

function LoadDateSelectorPage(){

    // Get the data from file
    let symbol = document.getElementById("stockSelector").value;
    let interval = document.getElementById("interval").value;
    
    RefreshIndexData();

    // Show held data
	AddDataHTML(`<h5>Calendar</h5>`);
	AddDataHTML(`Held Data is Highlighted`);
    AddDataHTML(`<div id="symbol" >${symbol}</div>`); 
    AddDataHTML(`<div id="interval">${interval}</div>`)
	AddDataHTML('<div id="calendar" > </div> ');
    
	ShowHeldData(symbol); 

    AddDataHTML('<label for="startDate" class="m-2">Start Date: </label><input type="date" id="startDate">');
    AddDataHTML('<label for="endDate" class="m-2">End Date: </label><input type="date" id="endDate">');

    // Load Submit Button
    AddDataHTML("<button id='btnViewStockSubmit' class='btn btn-primary mt-2 '>View</button>");

    // Sumbit Button Event Listener
    $("#btnViewStockSubmit").click(DisplayData);

}

async function DisplayData(){

    let symbol = document.getElementById("symbol").innerHTML;
    let interval = document.getElementById("interval").innerHTML;

    // Get the dates
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if(startDate == "" || endDate == ""){
        console.log("Dates not entered");
        alert("Dates not entered"); 
        return LoadSelectorPage(); 
    }

    RefreshIndexData();

    await GetData(symbol, interval).then(function(data){

        let parsedJson = JSON.parse(data);

        let array = []; 

        let unixStartDate = Math.floor(new Date(startDate).getTime() / 1000); 
        let unixEndDate = (Math.floor(new Date(endDate).getTime() / 1000)) + 57600;

        for(let i of parsedJson[symbol]["prices"]){

            // If between times, add to array
            if(i.date > unixStartDate && i.date < unixEndDate){
                array.push(i); 
            }
        }; 

        parsedJson[symbol]["prices"] = array; 

        AddDataHTML(`${symbol}`);
        DrawTable(parsedJson, symbol);

    }); 

}; 

async function GetData(symbol, interval){

    return new Promise(resolve => {

        if(interval == "1d"){
            fs.readFile(`data/yahooData/${symbol}.json`, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    alert("Yahoo Show Data Process - An error has occurred opening json storage file.");
                }
                else {
                    console.log("Yahoo Show Data Process - Json file opened");
                    resolve(data); 
        
                    
                }
            })	
        }
        else if (interval == "1m"){
            fs.readFile(`data/pythonData/${symbol}.json`, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    alert("Python Show Data Process - An error has occurred opening json storage file.");
                }
                else {
                    console.log("Python Show Data Process - Json file opened");
                    resolve(data); 
        
                    
                }
            })
        }

        
	})
}

function DrawTable(parsedJson, symbol){
	// Set headers for table
	AddDataHTML(`<table id="table" data-height="400" data-virtual-scroll="true"><thead><tr>
							<th data-field="unixDate" data-width="300" data-sortable="true">Unix Date</th>
							<th data-field="date" data-width="300">Date</th>
							<th data-field="time">Time</th>							
                            <th data-field="open">Open</th>
							<th data-field="high">High</th>
							<th data-field="low">Low</th>
							<th data-field="close">Close</th>
							<th data-field="volume">Volume</th>
					</tr></thead></table>`);
	
	// Initialise bootstrap table
	let $table = $('#table'); 
	$table.bootstrapTable(); 

    AddDataToTable(parsedJson, symbol); 

}; 

function AddDataToTable(parsedJson, symbol){
	let $table = $('#table'); 

	for(let i of parsedJson[symbol]["prices"]){
		// Add rows
		$table.bootstrapTable('insertRow', {
			index: 1,
			row: {
			unixDate: i.date, 
			date: DateConverter(JSON.stringify(i.date)),
			time: TimeConverter(JSON.stringify(i.date)), 
			open: Round(Number(JSON.stringify(i.open))),
			high: Round(Number(JSON.stringify(i.high))),
			low: Round(Number(JSON.stringify(i.low))),
			close: Round(Number(JSON.stringify(i.close))),
			volume: JSON.stringify(i.volume)
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