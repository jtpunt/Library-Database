/*******************************************
* Author: Jonathan Perry
* Date: 12/03/17
* Assignment: CS 340 - Project
*******************************************/
function updateBook(isbn){
    $.ajax({
        url: '/books/' + isbn,
        type: 'PUT',
        data: $('#update-book').serialize(), // #update-book: this is our form. 
        // serialize() encodes a set of form elements as a string
        success: function(result){ 
            window.location.replace("./"); // navigate back to the previous page
        }
    })
};