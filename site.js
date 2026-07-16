(function () {
  // Skip link
  if (!document.querySelector(".skip-link")) {
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#main";
    skip.textContent = "Skip to content";
    document.body.prepend(skip);
  }

  // Main landmark
  const main = document.querySelector("main");
  if (main && !main.id) main.id = "main";

  // Active nav by path
  const path = (location.pathname.replace(/\/$/, "") || "/").toLowerCase();
  const page =
    path.endsWith(".html") ? path.split("/").pop() : path === "/" ? "index.html" : path;
  document.querySelectorAll(".nav-desktop a, .mobile-menu a").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/^\//, "").toLowerCase();
    const isHome = (href === "" || href === "/" || href === "index.html") && (page === "index.html" || page === "/");
    const isMatch = href && page === href;
    if (isHome || isMatch) a.classList.add("is-active");
  });

  // Header scroll state
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu — premium full-screen drawer
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  if (menuBtn && mobileMenu) {
    // Animated hamburger icon
    if (!menuBtn.querySelector(".menu-icon")) {
      menuBtn.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
    }

    // Upgrade structure once: kicker + numbered links + footer note
    const shell = mobileMenu.querySelector(".container");
    if (shell && !shell.querySelector(".mobile-menu-links")) {
      const links = Array.from(shell.querySelectorAll("a"));
      shell.innerHTML = "";

      const top = document.createElement("div");
      const kicker = document.createElement("div");
      kicker.className = "mobile-menu-kicker";
      kicker.textContent = "Navigate";
      const list = document.createElement("div");
      list.className = "mobile-menu-links";

      links.forEach((a, i) => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        const isCta = href.includes("access");
        if (isCta) {
          a.classList.add("mobile-cta-link");
          a.textContent = "Request Private Access";
        } else {
          const num = document.createElement("span");
          num.className = "nav-num";
          num.textContent = String(i + 1).padStart(2, "0");
          const label = document.createElement("span");
          label.textContent = a.textContent.trim();
          a.textContent = "";
          a.appendChild(label);
          a.appendChild(num);
        }
        list.appendChild(a);
      });

      top.appendChild(kicker);
      top.appendChild(list);

      const foot = document.createElement("div");
      foot.className = "mobile-menu-foot";
      foot.innerHTML = "<strong>Private Capital</strong>By invitation · Direct relationships · Not a marketplace";

      shell.appendChild(top);
      shell.appendChild(foot);
    }

    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-controls", "mobileMenu");
    menuBtn.addEventListener("click", () => {
      setMenu(!mobileMenu.classList.contains("open"));
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // Sticky mobile access CTA (all pages except access)
  const isAccess = /access\.html$/i.test(location.pathname);
  if (!isAccess && !document.querySelector(".mobile-cta")) {
    const bar = document.createElement("div");
    bar.className = "mobile-cta";
    bar.innerHTML = '<a class="btn btn-gold" href="/access.html">Request Private Access</a>';
    document.body.appendChild(bar);
    document.body.classList.add("has-mobile-cta");

    const updateCta = () => {
      const show = window.innerWidth < 1024 && window.scrollY > 420;
      bar.classList.toggle("is-visible", show);
    };
    updateCta();
    window.addEventListener("scroll", updateCta, { passive: true });
    window.addEventListener("resize", updateCta);
  }

  // Year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Reveal on scroll (stagger siblings in grids)
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".grid-2, .grid-3, .grid-4, .stats, .trust-strip").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        if (!child.classList.contains("reveal")) return;
        if (child.classList.contains("reveal-delay-1") || child.classList.contains("reveal-delay-2") || child.classList.contains("reveal-delay-3")) return;
        if (i === 1) child.classList.add("reveal-delay-1");
        if (i === 2) child.classList.add("reveal-delay-2");
        if (i >= 3) child.classList.add("reveal-delay-3");
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // Subtle cinematic hero parallax
  const heroStage = document.querySelector(".hero-stage img");
  if (heroStage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const onHeroScroll = () => {
      const y = Math.min(window.scrollY, 520);
      heroStage.style.transform = `scale(1.06) translate3d(0, ${y * 0.12}px, 0)`;
    };
    onHeroScroll();
    window.addEventListener("scroll", onHeroScroll, { passive: true });
  }

  // Access form UX
  const form = document.getElementById("accessForm");
  if (!form) return;

  const success = document.getElementById("formSuccess");
  const errorEl = document.getElementById("formError");
  const submitBtn = document.getElementById("submitBtn");
  const successPanel = document.getElementById("formSuccessPanel");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (success) success.classList.add("hidden");
    if (errorEl) errorEl.classList.add("hidden");
    if (successPanel) successPanel.classList.add("hidden");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("bad status");
      if (successPanel) {
        successPanel.classList.remove("hidden");
        form.classList.add("hidden");
        successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (success) {
        success.classList.remove("hidden");
      }
      form.reset();
    } catch (err) {
      if (errorEl) errorEl.classList.remove("hidden");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
      }
    }
  });
})();
