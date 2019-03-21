/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
document.addEventListener('DOMContentLoaded',function() {
	var optionText = ["Pick a Publisher", "Pick a Author", "Pick a Genre"];
	var mySelections = document.getElementsByClassName("mySelections");
	for(var i = 0; i < mySelections.length; i++){
		var option = document.createElement("option");
		option.text = optionText[i]; // assign text to the publishers, authors, and genre select options
		option.selected = true;
		option.value = 0;
		mySelections[i].add(option, mySelections[i][0]); // add the option to the beginning of the current select tag
	}
});
function checkOutBook(isbn){
	var myObj = {};
	myObj.isbn = isbn;
	myObj.patron_id = document.getElementById(isbn).value;
    $.ajax({
        url: '/books',
        type: 'post',
        dataType: "text",
        data: JSON.stringify(myObj),
        contentType: "application/json",
        async:false,
    	success: function(result){
            window.location.reload(true);
        }
    });
}
function deleteFromDB(isbn){
	var myObj = {};
	myObj.isbn = isbn;
    $.ajax({
        url: '/books',
        type: 'delete',
        dataType: "text",
 		data: JSON.stringify(myObj),
        contentType: "application/json",
        async:false,
        success: function(result){
            window.location.reload(true);
        }
    });
}
function showPopup(event) {
	var popup = event.children[0];
    popup.classList.toggle("show");
}