// Covers the delete data

// Load Index html for delete options
async function YahooDeletePage() {

	RefreshIndexData();
  
	FillDataHTML(1,`<div class="p-1 text-center">
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
