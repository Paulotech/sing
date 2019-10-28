window.onscroll = function() {
    scroll();
};

// Flip card
$(".card").flip();


// Accordion
$( function() {
    $( "#accordion" ).accordion({
        heightStyle: "content"
    });
} );

// Scroll Bar
function scroll() {
    var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = (winScroll / height) * 100;

    document.getElementById("myBar").style.width = scrolled + "%";
}