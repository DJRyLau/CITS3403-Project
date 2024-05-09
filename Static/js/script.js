$(document).ready(function () {
  $("#login-form").submit(function (e) {
    e.preventDefault();
    $.post("/login", $(this).serialize(), function () {
      window.location.href = "/dashboard";
    }).fail(function () {
      alert("Login Failed");
    });
  });

  $("#create-form").submit(function (e) {
    e.preventDefault();
    $.post("/register", $(this).serialize(), function () {
      window.location.href = "/dashboard";
    }).fail(function () {
      alert("Registration Failed");
    });
  });

  $(".close-btn").click(function () {
    $(".auth-container").hide();
    $(".about-section").show();
  });

  $("#show-create, #show-signin").click(function (e) {
    e.preventDefault();
    let target =
      $(this).attr("id") === "show-create"
        ? "#create-section"
        : "#login-section";
    $(".form-container").hide();
    $(target).show();
  });
});
