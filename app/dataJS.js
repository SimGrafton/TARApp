// Covers the drop down selections under Data Tab on the sidebar

// Update Button EventListener. Loads Index html for updating stock data. 
$(".btnUpdate").click(async function () {

	RefreshIndexData(); 

	AddDataHTML('<div class="p-1 text-center">' +
								'<h5 class="mb-1">Update Python or Yahoo Data?</h5>' + 
					'</div>'
	); 

	AddDataHTML("<div class='p-1 text-center'>Yahoo data is currently for daily or monthly data, while Python is for minute data only.</div>"); 

	AddDataHTML("<button id='btnYahooUpdatePage' class='btn btn-primary mt-2 m-2 '>Yahoo</button>"); 

	AfterDataHTML("btnYahooUpdatePage","<button id='btnPythonUpdatePage' class='btn btn-primary mt-2 m-2 '>Python</button>"); 

	// Add event listeners to buttons
	$("#btnYahooUpdatePage").click(function(e) {
		YahooUpdatePage();
	 });

	 $("#btnPythonUpdatePage").click(function(e) {
		PythonUpdatePage();
	 });

})

// Load Index html for delete options
$(".btnDelete").click(async function () {

	RefreshIndexData();
  
	AddDataHTML(`<div class="p-1 text-center"><h5 class="mb-1">Delete Python or Yahoo Data?</h5></div>`); 

	AddDataHTML("<div class='p-1 text-center'>Yahoo data is currently for daily or monthly data, while Python is for minute data only.</div>"); 

	AddDataHTML("<button id='btnYahooDeletePage' class='btn btn-primary mt-2 m-2 '>Yahoo</button>"); 

	AfterDataHTML("btnYahooDeletePage", "<button id='btnPythonDeletePage' class='btn btn-primary mt-2 m-2 '>Python</button>"); 

	// Add event listeners to buttons
	$("#btnYahooUpdatePage").click(function(e) {
		YahooDeletePage();
	 });

	 $("#btnPythonUpdatePage").click(function(e) {
		PythonDeletePage();
	 });
	
});
