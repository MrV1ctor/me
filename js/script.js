document.addEventListener("DOMContentLoaded", function () {

  /* ---------- mobile file-tree toggle ---------- */
  var navToggle = document.querySelector(".explorer__toggle");
  var tree = document.querySelector(".tree");

  if (navToggle && tree) {
    navToggle.addEventListener("click", function () {
      var isOpen = tree.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    tree.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        tree.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- dark mode toggle ---------- */
  var themeBtn = document.getElementById("themeToggle");
  var themeValue = document.getElementById("themeToggleValue");

  function reflectTheme(theme) {
    if (themeValue) themeValue.textContent = theme === "dark" ? "true" : "false";
    if (themeBtn) themeBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  // theme is already applied by the inline head script; just sync the label
  reflectTheme(document.documentElement.getAttribute("data-theme") || "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      reflectTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode etc — theme just won't persist */ }
    });
  }

  /* ---------- animated project details (progressive enhancement over native <details>) ---------- */
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function Accordion(details) {
    this.details = details;
    this.summary = details.querySelector("summary");
    this.content = details.querySelector(".project-card__more");
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    if (!this.summary || !this.content || !details.animate) return;
    this.summary.addEventListener("click", this.onClick.bind(this));
  }

  Accordion.prototype.onClick = function (e) {
    e.preventDefault();
    if (prefersReducedMotion) {
      this.details.open = !this.details.open;
      return;
    }
    this.details.style.overflow = "hidden";
    if (this.isClosing || !this.details.open) {
      this.open();
    } else if (this.isExpanding || this.details.open) {
      this.shrink();
    }
  };

  Accordion.prototype.shrink = function () {
    this.isClosing = true;
    var startHeight = this.details.offsetHeight + "px";
    var endHeight = this.summary.offsetHeight + "px";
    if (this.animation) this.animation.cancel();
    this.animation = this.details.animate(
      { height: [startHeight, endHeight] },
      { duration: 220, easing: "ease-out" }
    );
    this.animation.onfinish = this.onFinish.bind(this, false);
    this.animation.oncancel = function () { this.isClosing = false; }.bind(this);
  };

  Accordion.prototype.open = function () {
    this.details.style.height = this.details.offsetHeight + "px";
    this.details.open = true;
    window.requestAnimationFrame(this.expand.bind(this));
  };

  Accordion.prototype.expand = function () {
    this.isExpanding = true;
    var startHeight = this.details.offsetHeight + "px";
    var endHeight = (this.summary.offsetHeight + this.content.offsetHeight) + "px";
    if (this.animation) this.animation.cancel();
    this.animation = this.details.animate(
      { height: [startHeight, endHeight] },
      { duration: 240, easing: "ease-out" }
    );
    this.animation.onfinish = this.onFinish.bind(this, true);
    this.animation.oncancel = function () { this.isExpanding = false; }.bind(this);
  };

  Accordion.prototype.onFinish = function (open) {
    this.details.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.details.style.height = "";
    this.details.style.overflow = "";
  };

  document.querySelectorAll(".project-card details").forEach(function (el) {
    new Accordion(el);
  });

  /* ---------- project thumbnail carousels ---------- */
  function Carousel(root) {
    this.root = root;
    this.track = root.querySelector(".carousel__track");
    this.slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
    this.dots = Array.prototype.slice.call(root.querySelectorAll(".carousel__dot"));
    this.prevBtn = root.querySelector(".carousel__btn--prev");
    this.nextBtn = root.querySelector(".carousel__btn--next");
    this.index = 0;

    var self = this;
    if (this.prevBtn) this.prevBtn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      self.go(-1);
    });
    if (this.nextBtn) this.nextBtn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      self.go(1);
    });
    this.dots.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        self.set(i);
      });
    });
  }

  Carousel.prototype.go = function (dir) {
    var count = this.slides.length;
    this.set((this.index + dir + count) % count);
  };

  Carousel.prototype.set = function (i) {
    this.index = i;
    this.track.style.transform = "translateX(-" + (i * 100) + "%)";
    this.dots.forEach(function (dot, idx) {
      dot.classList.toggle("is-active", idx === i);
    });
  };

  document.querySelectorAll(".carousel").forEach(function (el) {
    new Carousel(el);
  });

});
