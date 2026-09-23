(function () {
  var ENDPOINT = "https://afxlvjnbwojjdszzrajj.supabase.co/functions/v1/submit-waitlist";

  document.querySelectorAll("[data-waitlist-form]").forEach(function (form) {
    var status = form.closest("section").querySelector("[data-waitlist-status]");
    var button = form.querySelector("button");
    var input = form.querySelector("input[name=email]");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = input.value.trim();
      if (!email) return;

      button.disabled = true;
      var originalLabel = button.textContent;
      button.textContent = "Sending…";
      if (status) {
        status.textContent = "";
        status.removeAttribute("data-state");
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.error || "Something went wrong");
            return data;
          });
        })
        .then(function () {
          form.hidden = true;
          if (status) {
            status.textContent = "You're on the list — we'll be in touch.";
            status.setAttribute("data-state", "ok");
          }
        })
        .catch(function (error) {
          button.disabled = false;
          button.textContent = originalLabel;
          if (status) {
            status.textContent = error.message || "Something went wrong — try again.";
            status.setAttribute("data-state", "error");
          }
        });
    });
  });
})();
