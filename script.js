(() => {
  "use strict";

  /* ===============================================================
     CONFIGURATION

     There is nothing to configure here. The form endpoint and access
     key are read from index.html, so the key lives in exactly one
     place. Until a real key is pasted there, the form degrades to a
     mailto: draft — the button is never dead.
     =============================================================== */
  const KEY_PLACEHOLDER = "PASTE_WEB3FORMS_ACCESS_KEY_HERE";
  const FALLBACK_EMAIL = "chef.jbmartin67@gmail.com";
  const THANK_YOU_URL = "thank-you.html";

  /* ---------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------- */

  const navToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("primary-nav");

  if (navToggle && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    // Escape closes the menu and returns focus to the button that opened it.
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });

    // A tap anywhere outside the open menu dismisses it.
    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------------------------------------------------------------
     Inquiry form
     --------------------------------------------------------------- */

  const inquiryForm = document.getElementById("inquiry-form");
  if (!inquiryForm) return;

  const accessKeyInput = inquiryForm.querySelector('input[name="access_key"]');
  const accessKey = accessKeyInput ? accessKeyInput.value.trim() : "";
  const formEndpoint = inquiryForm.getAttribute("action") || "";
  const isConfigured = Boolean(accessKey) && accessKey !== KEY_PLACEHOLDER;

  const formStatus = document.getElementById("form-status");
  const submitButton = document.getElementById("inquiry-submit");
  const menuField = document.getElementById("menu-interest");

  const clean = (value) => String(value == null ? "" : value).trim();

  const setStatus = (message, kind) => {
    if (!formStatus) return;
    formStatus.hidden = false;
    formStatus.textContent = message;
    formStatus.classList.toggle("is-pending", kind === "pending");
    formStatus.classList.toggle("is-error", kind === "error");
  };

  const clearStatus = () => {
    if (!formStatus) return;
    formStatus.hidden = true;
    formStatus.textContent = "";
    formStatus.classList.remove("is-pending", "is-error");
  };

  /* Preselect the menu when the visitor arrived from a "Request this
     menu" link, e.g. index.html?menu=italian-feast#inquiry */
  if (menuField) {
    const wanted = new URLSearchParams(window.location.search).get("menu");
    if (wanted) {
      const match = Array.from(menuField.options).find(
        (option) => option.value.toLowerCase() === wanted.toLowerCase()
      );
      if (match) menuField.value = match.value;
    }
  }

  /* mailto: fallback. encodeURIComponent — NOT URLSearchParams, which
     encodes spaces as "+" and renders literal plus signs in the body. */
  const buildMailto = (fields) => {
    const subject = `Website inquiry from ${fields.name || "a prospective client"}`;
    const body = [
      "Hello Chef JB Martin,",
      "",
      "I would like to inquire about Culinary Revolutionary services.",
      "",
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone || "Not provided"}`,
      `Service: ${fields.service || "Not specified"}`,
      `Event location: ${fields.location || "Not specified"}`,
      `Menu of interest: ${fields.menu || "Not specified"}`,
      `Guest count: ${fields.guests || "Not specified"}`,
      `Preferred date: ${fields.date || "Not specified"}`,
      "",
      "Project notes:",
      fields.notes || "None provided",
      "",
      "Thank you."
    ].join("\n");

    return (
      `mailto:${FALLBACK_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
    );
  };

  inquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;

    const data = new FormData(inquiryForm);

    // Honeypot: a hidden control only an automated script would set.
    // Silently drop rather than redirect — a false positive then leaves a
    // real visitor on the form instead of on a "thanks" page for a message
    // that was never sent.
    if (data.get("botcheck")) return;

    const fields = {
      name: clean(data.get("name")),
      email: clean(data.get("email")),
      phone: clean(data.get("phone")),
      service: clean(data.get("service")),
      location: clean(data.get("location")),
      menu: clean(data.get("menu")),
      guests: clean(data.get("guests")),
      date: clean(data.get("date")),
      notes: clean(data.get("notes"))
    };

    // No access key pasted yet — open an email draft instead of
    // silently losing the inquiry.
    if (!isConfigured) {
      setStatus("Opening a pre-filled message in your email app…", "pending");
      window.location.href = buildMailto(fields);

      // If no mail handler is registered the page never unloads, so give the
      // visitor a route that does not depend on one.
      window.setTimeout(() => {
        setStatus(
          "If your email app did not open, call or text (239) 507-3175, or " +
            "email " + FALLBACK_EMAIL + " directly.",
          "error"
        );
      }, 2000);
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setStatus("Sending your inquiry…", "pending");

    const payload = {
      subject: `New website inquiry — ${fields.name || "prospective client"}`,
      from_name: "Culinary Revolutionary website",
      name: fields.name,
      email: fields.email,
      phone: fields.phone || "Not provided",
      service: fields.service || "Not specified",
      event_location: fields.location || "Not specified",
      menu_of_interest: fields.menu || "Not specified",
      guest_count: fields.guests || "Not specified",
      preferred_date: fields.date || "Not specified",
      notes: fields.notes || "None provided"
    };
    payload.access_key = accessKey;

    try {
      const response = await fetch(formEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);

      // Web3Forms reports failures in the body with HTTP 200.
      const result = await response.json().catch(() => ({ success: true }));
      if (result.success === false) throw new Error(result.message || "Submission rejected");

      window.location.href = THANK_YOU_URL;
    } catch (error) {
      if (submitButton) submitButton.disabled = false;
      setStatus(
        "That did not send. Please call or text (239) 507-3175, or email " +
          FALLBACK_EMAIL + " directly.",
        "error"
      );
      if (window.console) console.error("Inquiry submission failed:", error);
    }
  });

  // Restore the form when the visitor navigates back to a cached page.
  window.addEventListener("pageshow", () => {
    if (submitButton) submitButton.disabled = false;
    clearStatus();
  });
})();
