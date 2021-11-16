function deleteBookReservation(isbn){
    var myObj = {};
    myObj.isbn = isbn;
    $.ajax({
        url: `/book/${isbn}/reserve`,
        type: 'delete',
        async:false,
        success: function(result){
            window.location.reload(true);
        }
    }); 
}