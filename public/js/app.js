$(".menu").on("click", (event) => {
    $("nav ul").slideToggle();
});

$('#update-book').hide();

$('#btn-update').click(function () {
    $('#update-book').toggle();
})