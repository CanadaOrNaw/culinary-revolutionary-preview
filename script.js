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

     The site has no server-side runtime. Build a clean mailto draft from
     the visitor's fields instead of relying on a third-party form endpoint.
     The visitor reviews the draft and explicitly presses Send in their own
     email app.
     --------------------------------------------------------------- */

  if (!inquiryForm) return;

  const clean = (value) => String(value || "").trim();

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!inquiryForm.reportValidity()) return;

    const data = new FormData(inquiryForm);
    const name = clean(data.get("Name"));
    const email = clean(data.get("email"));
    const subject = `Website inquiry from ${name || "a prospective client"}`;
    const body = [
      "Hello Chef JB Martin,",
      "",
      "I would like to inquire about Culinary Revolutionary services.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${clean(data.get("Phone")) || "Not provided"}`,
      `Service: ${clean(data.get("Service")) || "Not specified"}`,
      `Guest count: ${clean(data.get("Guests")) || "Not specified"}`,
      `Preferred date: ${clean(data.get("Preferred date")) || "Not specified"}`,
      "",
      "Project notes:",
      clean(data.get("Notes")) || "None provided",
      "",
      "Thank you."
    ].join("\n");

    formStatus.hidden = false;
    formStatus.textContent = "Opening a pre-filled message in your email app…";
    formStatus.classList.add("is-pending");

    const mailto = new URL("mailto:chef.jbmartin67@gmail.com");
    mailto.searchParams.set("subject", subject);
    mailto.searchParams.set("body", body);
    window.location.href = mailto.toString();
  });

  window.addEventListener("pageshow", () => {
    submitButton.disabled = false;
    formStatus.hidden = true;
    formStatus.classList.remove("is-pending", "is-error");
  });
})();
