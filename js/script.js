/**
 * script.js - She Can Foundation Main Website Logic
 * Handles: Navbar, Scroll animations, Contact form, Appwrite integration
 */

/* =========================================================
   INITIALIZE BACKEND API
   ========================================================= */
const API_BASE = API_CONFIG.BASE_URL;

/* =========================================================
   NAVBAR: SCROLL EFFECT & ACTIVE LINKS
   ========================================================= */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

/**
 * Handle navbar scroll effect — adds glass background when page is scrolled
 */
function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/**
 * Update active nav link based on current scroll position
 */
function updateActiveNavLink() {
  let currentSectionId = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
}

// Attach scroll listeners
window.addEventListener('scroll', () => {
  handleNavbarScroll();
  updateActiveNavLink();
}, { passive: true });

// Run once on load
handleNavbarScroll();

/* =========================================================
   MOBILE HAMBURGER MENU
   ========================================================= */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileLinks = document.querySelectorAll('.mobile-link');

/**
 * Toggle the mobile navigation drawer
 */
function toggleMobileNav() {
  const isOpen = hamburgerBtn.classList.toggle('open');
  mobileNav.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
  // Prevent body scroll when nav is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileNav() {
  hamburgerBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', toggleMobileNav);

// Close menu when a mobile link is clicked
mobileLinks.forEach((link) => {
  link.addEventListener('click', closeMobileNav);
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
    closeMobileNav();
  }
});

/* =========================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================= */
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

/**
 * IntersectionObserver to trigger reveal animations on scroll
 * Supports .reveal, .reveal-left, .reveal-right classes
 */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation for card grids
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

// Also observe reveal-left and reveal-right elements
document.querySelectorAll('.reveal-left, .reveal-right').forEach((el) => {
  revealObserver.observe(el);
});

/* =========================================================
   FOOTER: CURRENT YEAR
   ========================================================= */
const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* =========================================================
   CONTACT / VOLUNTEER FORM
   ========================================================= */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');

  // Form fields
  const nameInput = document.getElementById('formName');
  const emailInput = document.getElementById('formEmail');
  const messageInput = document.getElementById('formMessage');

  // Error elements
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  /**
   * Validate email format using regex
   * @param {string} email - The email string to validate
   * @returns {boolean} - True if valid email format
   */
  const isValidEmail = function(email) {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  /**
   * Show or clear error for a given field
   * @param {HTMLElement} input - The input element
   * @param {HTMLElement} errorEl - The error message element
   * @param {boolean} hasError - Whether to show or hide error
   */
  const setFieldError = function(input, errorEl, hasError) {
    if (hasError) {
      input.classList.add('error');
      errorEl.classList.add('visible');
    } else {
      input.classList.remove('error');
      errorEl.classList.remove('visible');
    }
  };

  /**
   * Validate the entire form
   * @returns {boolean} - True if all fields are valid
   */
  const validateForm = function() {
    let isValid = true;

    // Validate name
    const nameVal = nameInput.value.trim();
    if (!nameVal || nameVal.length < 2) {
      setFieldError(nameInput, nameError, true);
      isValid = false;
    } else {
      setFieldError(nameInput, nameError, false);
    }

    // Validate email
    const emailVal = emailInput.value.trim();
    if (!emailVal || !isValidEmail(emailVal)) {
      setFieldError(emailInput, emailError, true);
      isValid = false;
    } else {
      setFieldError(emailInput, emailError, false);
    }

    // Validate message
    const messageVal = messageInput.value.trim();
    if (!messageVal || messageVal.length < 10) {
      setFieldError(messageInput, messageError, true);
      isValid = false;
    } else {
      setFieldError(messageInput, messageError, false);
    }

    return isValid;
  };

  // Real-time validation on blur
  nameInput.addEventListener('blur', () => {
    const val = nameInput.value.trim();
    setFieldError(nameInput, nameError, !val || val.length < 2);
  });

  emailInput.addEventListener('blur', () => {
    const val = emailInput.value.trim();
    setFieldError(emailInput, emailError, !val || !isValidEmail(val));
  });

  messageInput.addEventListener('blur', () => {
    const val = messageInput.value.trim();
    setFieldError(messageInput, messageError, !val || val.length < 10);
  });

  /**
   * Set the submit button into loading state
   * @param {boolean} loading - Whether loading is active
   */
  const setLoadingState = function(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      submitText.innerHTML = '<span class="spinner"></span> Sending...';
    } else {
      submitText.innerHTML = 'Send Message 💜';
    }
  };

  /**
   * Submit the form data to MongoDB Database via Express Server
   */
  const handleFormSubmit = async function(e) {
    e.preventDefault();

    // Run validation
    if (!validateForm()) return;

    setLoadingState(true);

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit message to the server.');
      }

      // Reset form fields
      contactForm.reset();

      // Show success popup
      showSuccessPopup();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Oops! Something went wrong. Please try again or email us directly.');
    } finally {
      setLoadingState(false);
    }
  };

  contactForm.addEventListener('submit', handleFormSubmit);
}

/* =========================================================
   SUCCESS POPUP
   ========================================================= */
const successPopup = document.getElementById('successPopup');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const popupOkBtn = document.getElementById('popupOkBtn');

/**
 * Show the success popup overlay
 */
function showSuccessPopup() {
  successPopup.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide the success popup overlay
 */
function hideSuccessPopup() {
  successPopup.classList.remove('active');
  document.body.style.overflow = '';
}

popupCloseBtn.addEventListener('click', hideSuccessPopup);
popupOkBtn.addEventListener('click', hideSuccessPopup);

// Close popup when clicking overlay background
successPopup.addEventListener('click', (e) => {
  if (e.target === successPopup) {
    hideSuccessPopup();
  }
});

// Close popup on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && successPopup.classList.contains('active')) {
    hideSuccessPopup();
  }
});

/* =========================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      const offset = 80; // account for fixed navbar
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});

console.log('She Can Foundation | script.js loaded ✅');
