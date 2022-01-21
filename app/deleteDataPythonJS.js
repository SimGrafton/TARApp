// Covers the delete data

// Load Index html for delete options
async function PythonDeletePage() {

	RefreshIndexData();
  
	FillDataHTML(1,`<div class="p-1 text-center">
								<h5 class="mb-1">Select Data to Delete</h5>
					</div>`); 

	// Load select box to select data symbol

	await x().then(function(response) {
		
	})
};
