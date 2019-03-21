/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
document.addEventListener('DOMContentLoaded',function() {
	var optionText = ["Pick a Author", "Pick a Publisher", "Pick a Genre"];
	var addOptionText = ["Add New Author", "Add New Publisher", "Add New Genre"];
	var mySelections = document.getElementsByClassName("mySelections");
	for(var i = 0; i < mySelections.length; i++){
		var option = document.createElement('option');
		var addOption = document.createElement('option');
		var children = mySelections[i].children;
		option.text = optionText[i]; // assign text to the publishers, authors, and genre select options
		option.selected = true;
		option.disabled = true;
		addOption.text = addOptionText[i];
		addOption.value = addOptionText[i];
		addOptionText.selected = false;
		mySelections[i].add(option, mySelections[i][0]); // add the option to the beginning of the current select tag
		mySelections[i].add(addOption, mySelections[i][children]) // Add the 'add' option at the end of the current select tag
	}
});
// This event listener reveals 'hidden' form input to allow the user to enter in new authors/publishers/genres when adding a new book
document.addEventListener('DOMContentLoaded',function() {
   var mySelections = document.getElementsByClassName("mySelections");
   for(var i = 0; i < mySelections.length; i++){
   		mySelections[i].addEventListener('change', changeEventHandler);
   }
}, false);
// This event listener makes sure that the user doesn't enter in more than 10 digits for the books ISBN
document.addEventListener('DOMContentLoaded',function() {
	var maxLength = 10;
	var isbnInput = document.getElementById("isbn");
	var isbnErrorSpan = document.getElementById("isbnError");
	var isbnCheckSpan = document.getElementById("isbnCheck");
	isbnInput.addEventListener('input', function(event){
		if(event.target.value.length < maxLength){
   			isbnErrorSpan.removeAttribute("hidden", true);
   			isbnCheckSpan.setAttribute("hidden", true);
   		}
   		else if (event.target.value.length > maxLength){
   			event.target.value = event.target.value.slice(0, maxLength); // cuts off extra input after 10 digits have been entered
   		}
		else if(event.target.value.length == maxLength){
			isbnErrorSpan.setAttribute("hidden", true);
			isbnCheckSpan.removeAttribute("hidden", true);
			//isbnCheckSpan.setAttribute("hidden", false); // show check mark
		}
   			
   });
}, false);

function changeEventHandler(event) {
	if(event.target.name === "publisher"){
		if(event.target.value === "Add New Publisher")
			document.getElementById("newPublisher").removeAttribute("hidden", false);
		else
			document.getElementById("newPublisher").setAttribute("hidden", true);
	}
	else if(event.target.name === "author"){
		if(event.target.value === "Add New Author")
			document.getElementById("newAuthor").removeAttribute("hidden", false);
		else
			document.getElementById("newAuthor").setAttribute("hidden", true);
	}
	else if(event.target.name === "genre"){
		if(event.target.value === "Add New Genre")
			document.getElementById("newGenre").removeAttribute("hidden", false);
		else
			document.getElementById("newGenre").setAttribute("hidden", true);
	}
}