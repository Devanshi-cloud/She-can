/**
 * certificates.js - She Can Foundation
 * Handles interactive client-side category filtering, dynamic text search,
 * and high-end lightbox modal zoom for registration documents.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     CATEGORY FILTERING LOGIC
     ========================================================= */
  const filterPills = document.querySelectorAll('.filter-pill');
  const complianceCards = document.querySelectorAll('.compliance-card');
  const searchInput = document.getElementById('certSearchInput');
  
  let activeCategory = 'all';
  let searchQuery = '';

  /**
   * Filter cards based on activeCategory AND searchQuery
   */
  function filterCertificates() {
    complianceCards.forEach((card) => {
      const cardCategory = card.getAttribute('data-category');
      
      // Get text contents for search match
      const cardTitle = card.querySelector('.card-main-title').textContent.toLowerCase();
      const cardSubtitle = card.querySelector('.card-subtitle').textContent.toLowerCase();
      
      // Also match table fields like ID code or authority name
      const tableSpans = Array.from(card.querySelectorAll('.table-field span'))
        .map(span => span.textContent.toLowerCase())
        .join(' ');
      
      const searchMatch = cardTitle.includes(searchQuery) || 
                          cardSubtitle.includes(searchQuery) || 
                          tableSpans.includes(searchQuery);

      // Check category match
      let categoryMatch = false;
      if (activeCategory === 'all') {
        categoryMatch = true;
      } else if (activeCategory === 'registrations' && cardCategory === 'registrations') {
        categoryMatch = true;
      } else if (activeCategory === 'tax' && cardCategory === 'tax') {
        categoryMatch = true;
      } else if (activeCategory === 'approvals' && cardCategory === 'approvals') {
        categoryMatch = true;
      }

      // Show/Hide card with transitions
      if (categoryMatch && searchMatch) {
        card.classList.remove('hide');
        // Gentle micro-animation fade-in
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(() => {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
      } else {
        card.classList.add('hide');
      }
    });
  }

  // Attach Category Pill Click Event Listeners
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      // Manage active states
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Update active category and trigger filter
      activeCategory = pill.getAttribute('data-category');
      filterCertificates();
    });
  });

  // Attach Search Event Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterCertificates();
    });
  }


  /* =========================================================
     LIGHTBOX / ZOOM MODAL LOGIC
     ========================================================= */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  
  const imgFrame = document.getElementById('featuredImgFrame');
  const btnZoomFeatured = document.getElementById('btnZoomFeatured');
  const viewSocietyLink = document.getElementById('viewSocietyCertLink');

  const featuredImg = document.getElementById('certificationAvif');
  const featuredTitleText = document.querySelector('.featured-title');

  /**
   * Open lightbox with the featured certificate content
   */
  function openLightbox() {
    if (!lightboxModal || !featuredImg) return;
    
    lightboxImg.src = featuredImg.src;
    lightboxTitle.textContent = featuredTitleText ? featuredTitleText.textContent : 'Official Registration Certificate';
    
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scrolling underneath
  }

  /**
   * Close lightbox
   */
  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Trigger Open Lightbox
  if (imgFrame) imgFrame.addEventListener('click', openLightbox);
  if (btnZoomFeatured) btnZoomFeatured.addEventListener('click', openLightbox);
  
  if (viewSocietyLink) {
    viewSocietyLink.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox();
    });
  }

  // Trigger Close Lightbox
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);

  // Close lightbox by clicking backdrop overlay
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  console.log('She Can Foundation | certificates.js loaded ✅');
});
