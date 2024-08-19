// Back button
if (window.history.back()) {
    // Show the button (you can hide it initially with CSS)
    $('.back_btn').show();
    // Set the button's href to the previous page
    var previous_page = window.history.back(-1);
    $('.back_btn').attr('href', previous_page);
}

// Forward button (similar logic)
if (window.history.forward()) {
    $('.forward_btn').show();
    // Set the button's href to the next page
    // ...
}
