/**
 * volunteer.js - She Can Foundation
 * Handles interactive client-side form validation, blur listeners,
 * and secure database submissions to Appwrite for Volunteer applicants.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     INITIALIZE BACKEND API
     ========================================================= */
  const API_BASE = API_CONFIG.BASE_URL;

  /* =========================================================
     VOLUNTEER FORM VALIDATIONS
     ========================================================= */
  const volForm = document.getElementById('volunteerForm');
  const volSubmitBtn = document.getElementById('volSubmitBtn');
  const volSubmitText = document.getElementById('volSubmitText');

  // Input Fields
  const nameInput = document.getElementById('volName');
  const emailInput = document.getElementById('volEmail');
  const phoneInput = document.getElementById('volPhone');
  const skillSelect = document.getElementById('volSkill');
  const messageInput = document.getElementById('volMessage');

  // Error Message Containers
  const nameError = document.getElementById('volNameError');
  const emailError = document.getElementById('volEmailError');
  const phoneError = document.getElementById('volPhoneError');
  const skillError = document.getElementById('volSkillError');
  const messageError = document.getElementById('volMessageError');

  /**
   * Validate email format using standard regex
   */
  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Toggle error visual states on fields
   */
  function setFieldError(input, errorEl, hasError) {
    if (hasError) {
      input.classList.add('error');
      errorEl.classList.add('visible');
    } else {
      input.classList.remove('error');
      errorEl.classList.remove('visible');
    }
  }

  /**
   * Perform comprehensive validation on all fields
   * @returns {boolean} - True if form is valid
   */
  function validateVolunteerForm() {
    let isValid = true;

    // Validate Name
    const nameVal = nameInput.value.trim();
    if (!nameVal || nameVal.length < 2) {
      setFieldError(nameInput, nameError, true);
      isValid = false;
    } else {
      setFieldError(nameInput, nameError, false);
    }

    // Validate Email
    const emailVal = emailInput.value.trim();
    if (!emailVal || !isValidEmail(emailVal)) {
      setFieldError(emailInput, emailError, true);
      isValid = false;
    } else {
      setFieldError(emailInput, emailError, false);
    }

    // Validate Phone (digits and plus sign allowed, min 10 digits)
    const phoneVal = phoneInput.value.trim().replace(/[^0-9]/g, '');
    if (!phoneVal || phoneVal.length < 10) {
      setFieldError(phoneInput, phoneError, true);
      isValid = false;
    } else {
      setFieldError(phoneInput, phoneError, false);
    }

    // Validate Skill Select
    const skillVal = skillSelect.value;
    if (!skillVal) {
      setFieldError(skillSelect, skillError, true);
      isValid = false;
    } else {
      setFieldError(skillSelect, skillError, false);
    }

    // Validate Motivation Message (Statement of purpose - min 20 characters)
    const messageVal = messageInput.value.trim();
    if (!messageVal || messageVal.length < 20) {
      setFieldError(messageInput, messageError, true);
      isValid = false;
    } else {
      setFieldError(messageInput, messageError, false);
    }

    return isValid;
  }

  // Real-time on-blur validation listeners
  if (nameInput) {
    nameInput.addEventListener('blur', () => {
      const val = nameInput.value.trim();
      setFieldError(nameInput, nameError, !val || val.length < 2);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      setFieldError(emailInput, emailError, !val || !isValidEmail(val));
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      const val = phoneInput.value.trim().replace(/[^0-9]/g, '');
      setFieldError(phoneInput, phoneError, !val || val.length < 10);
    });
  }

  if (skillSelect) {
    skillSelect.addEventListener('change', () => {
      setFieldError(skillSelect, skillError, !skillSelect.value);
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', () => {
      const val = messageInput.value.trim();
      setFieldError(messageInput, messageError, !val || val.length < 20);
    });
  }

  /**
   * Toggle submit button loading state
   */
  function setVolLoadingState(loading) {
    if (!volSubmitBtn || !volSubmitText) return;
    
    volSubmitBtn.disabled = loading;
    if (loading) {
      volSubmitText.innerHTML = '<span class="spinner-vol"></span> Submitting...';
    } else {
      volSubmitText.innerHTML = 'Submit Application';
    }
  }

  /**
   * Handle Volunteer Form Async Submission to Appwrite
   */
  async function handleVolFormSubmit(e) {
    e.preventDefault();

    // Run validations
    if (!validateVolunteerForm()) return;

    setVolLoadingState(true);

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const phoneVal = phoneInput.value.trim();
    const skillVal = skillSelect.value;
    const personalStatement = messageInput.value.trim();

    // To ensure compatibility with potential strict collection schemas, 
    // we pack skills and phone details neatly inside the 'message' field as a fallback,
    // while also adding them as individual fields in the payload.
    const packedMessage = `[VOLUNTEER APPLICATION]\nPhone: ${phoneVal}\nArea of Interest: ${skillVal}\n\nStatement of Purpose:\n${personalStatement}`;

    const payload = {
      name: nameVal,
      email: emailVal,
      message: packedMessage,
      phone: phoneVal,     // included directly in case schema is extended
      skills: skillVal,    // included directly in case schema is extended
      createdAt: new Date().toISOString()
    };

    try {
      const fallbackPayload = {
        name: nameVal,
        email: emailVal,
        message: packedMessage,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fallbackPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit application to the server.');
      }

      // Reset form
      volForm.reset();

      // Launch Success dialog
      showVolSuccessPopup();
    } catch (error) {
      console.error('Volunteer submission error:', error);
      alert('An unexpected error occurred. Please verify your connection or email us directly.');
    } finally {
      setVolLoadingState(false);
    }
  }

  if (volForm) {
    volForm.addEventListener('submit', handleVolFormSubmit);
  }


  /* =========================================================
     SUCCESS POPUP MODAL CONTROL
     ========================================================= */
  const successOverlay = document.getElementById('volSuccessPopup');
  const popupCloseBtn = document.getElementById('volPopupCloseBtn');
  const popupOkBtn = document.getElementById('volPopupOkBtn');

  function showVolSuccessPopup() {
    if (!successOverlay) return;
    successOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function hideVolSuccessPopup() {
    if (!successOverlay) return;
    successOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (popupCloseBtn) popupCloseBtn.addEventListener('click', hideVolSuccessPopup);
  if (popupOkBtn) popupOkBtn.addEventListener('click', hideVolSuccessPopup);

  if (successOverlay) {
    successOverlay.addEventListener('click', (e) => {
      if (e.target === successOverlay) {
        hideVolSuccessPopup();
      }
    });
  }

  // Close Success dialog on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successOverlay && successOverlay.classList.contains('active')) {
      hideVolSuccessPopup();
    }
  });

  console.log('She Can Foundation | volunteer.js loaded ✅');
});
