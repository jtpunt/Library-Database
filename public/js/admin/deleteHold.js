function deleteHold(isbn, copy_number, patron_id){
    $.ajax({
        url: `/book/${isbn}/copy_number/${copy_number}/patron_id/${patron_id}/hold`,
        type: 'delete',
        async:false,
        success: function(response){
            window.location = "/admin/hold";
        },
        failure: function (response){
            console.log(response.d);
        }
    });
}