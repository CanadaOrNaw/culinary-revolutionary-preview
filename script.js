(() => {
  const navToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const inquiryForm = document.getElementById("inquiry-form");
  const formStatus = document.getElementById("form-status");
  const submitButton = document.getElementById("inquiry-submit");

  /* ---------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------- */

  const closeNav = () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  /* ---------------------------------------------------------------
     Inquiry form

     This is progressive enhancement only. The real HTML form action
     remains the delivery path, so the inquiry works without JavaScript.
     FormSubmit handles spam verification, email delivery, and redirecting
     to thank-you.html after a successful submission.
     --------------------------------------------------------------- */

  if (!inquiryForm) return;

  inquiryForm.addEventListener("submit", () => {
    formStatus.hidden = false;
    formStatus.textContent = "Sending your inquiry securely…";
    formStatus.classList.add("is-pending");
    submitButton.disabled = true;
  });

  // Browsers may restore the page from their back/forward cache.
  // Never leave the submit button disabled when the visitor returns.
  window.addEventListener("pageshow", () => {
    submitButton.disabled = false;
    formStatus.hidden = true;
    formStatus.classList.remove("is-pending", "is-error");
  });
})();
