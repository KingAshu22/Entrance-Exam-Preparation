function filterQuestions(evt, subject) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="question" and hide them
  tabcontent = document.getElementsByClassName("question");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the specific tabs content
  tabcontent = document.querySelectorAll(
    `.question[data-subject='${subject}']`
  );
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "block";
  }

  // Add the "active" class to the button that opened the tab
  evt.currentTarget.className += " active";
}

// Optionally: Automatically click on the first tab to display upon page load
document.addEventListener("DOMContentLoaded", function () {
  // Trigger a click on the first tablink to make it active and display its content
  document.querySelector(".tablinks").click();
});
