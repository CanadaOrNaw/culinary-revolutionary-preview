(() => {
  const navToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");
  const inquiryForm = document.getElementById("inquiry-form");
  const formStatus = document.getElementById("form-status");

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

  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim() || "Guest";
    formStatus.hidden = false;
    formStatus.textContent = `${name}, your inquiry is captured locally. This is a demo form and does not submit externally.`;
    inquiryForm.reset();
  });
})();
