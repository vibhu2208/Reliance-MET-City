// Mobile menu
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function closeNav() {
    nav.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '☰';
  }

  function openNav() {
    nav.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '✕';
  }

  if (toggle && nav) {
    // Toggle menu on button click
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (nav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close menu when clicking on overlay
    overlay.addEventListener('click', closeNav);

    // Close menu when clicking on a nav link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Handle window resize
    function handleResize() {
      if (window.innerWidth > 991) {
        // Reset styles on desktop
        closeNav();
        nav.style.display = 'flex';
      } else {
        nav.style.display = nav.classList.contains('open') ? 'flex' : 'none';
      }
    }

    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      nav?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Modal: open on "Click to View"
const modal = document.getElementById('enquiry-modal');

function openModal() {
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  // focus first input
  const first = modal.querySelector('input[name="name"]');
  first?.focus();
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.unlock-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    openModal();
  });
});

// Also open modal from Feature Spotlight CTA
document.querySelectorAll('.enquire-open').forEach(btn => {
  btn.addEventListener('click', () => openModal());
});

// Close on backdrop or X
modal?.addEventListener('click', (e) => {
  if ((e.target instanceof Element) && e.target.hasAttribute('data-close')) {
    closeModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Global variable to track pending download
let pendingDownload = null;

// Handle both popup and footer forms
function handleFormSubmission(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    try {
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      const formData = new FormData(form);
      const userName = formData.get('name')?.trim();
      const userMobile = formData.get('mobile')?.trim();
      
      if (!userName || !userMobile) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Submit form data to Vercel Serverless Function
      const payload = {
        name: userName,
        email: (formData.get('email') || '').toString().trim(),
        mobile: userMobile,
        project: (formData.get('project') || 'Emaar India Business Centre').toString()
      };

      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.text();
      
      // Check if submission was successful
      if (response.ok && result.includes('Thank You')) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success';
        successMessage.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Thank you! We'll contact you shortly.</span>
        `;
        
        form.innerHTML = '';
        form.appendChild(successMessage);
        
        // No downloads for general enquiry forms
        
        // Unlock all floor plans and site plans (for popup form)
        if (form.id === 'enquiry-form') {
          document.querySelectorAll('.floor-plan-card, .site-plan-card').forEach(card => {
            card.classList.add('unlocked');
          });
          
          // Store unlock state in localStorage
          localStorage.setItem('twintower_unlocked', 'true');
          
          // Close modal after 3 seconds without reloading
          setTimeout(() => {
            closeModal();
            // Reset form without reloading page
            form.innerHTML = `
              <input type="hidden" name="project" value="Emaar India Business Centre">
              <div class="form-row">
                <input type="text" name="name" placeholder="Full Name" required />
              </div>
              <div class="form-row">
                <input type="email" name="email" placeholder="Email Address (Optional)" />
              </div>
              <div class="form-row">
                <input type="tel" name="mobile" placeholder="Mobile Number" required />
              </div>
              <button class="btn" type="submit">Get Details Now</button>
              <noscript>
                <p class="no-js-notice">Note: JavaScript is disabled. The form will submit directly to our server.</p>
              </noscript>
            `;
            // Re-attach event listener to the new form
            handleFormSubmission(form);
          }, 3000);
        } else {
          // For footer form, just show success and reset after delay
          setTimeout(() => {
            form.innerHTML = `
              <input type="hidden" name="project" value="Emaar India Business Centre">
              <div class="form-grid">
                <input type="text" name="name" placeholder="Full Name" required />
                <input type="email" name="email" placeholder="Email (Optional)" />
                <input type="tel" name="mobile" placeholder="Mobile Number" required />
                <button class="btn" type="submit">Get Details</button>
              </div>
              <noscript>
                <p class="no-js-notice">Note: JavaScript is disabled. The form will submit directly to our server.</p>
              </noscript>
            `;
            // Re-attach event listener to the new form
            handleFormSubmission(form);
          }, 3000);
        }
      } else {
        throw new Error(result || 'Failed to send message');
      }
      
    } catch (error) {
      console.error('Error:', error);
      // Show specific error message from server if available
      const errorMsg = error.message.includes('Error:') ? error.message : 'There was an error sending your message. Please try again or contact us directly.';
      alert(errorMsg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText; 
    }
  });
}

// Check if photos should be unlocked on page load
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('twintower_unlocked') === 'true') {
    document.querySelectorAll('.floor-plan-card, .site-plan-card').forEach(card => {
      card.classList.add('unlocked');
    });
  }
});

// Initialize both forms
const enquiryForm = document.getElementById('enquiry-form');
const footerForm = document.getElementById('footer-form');

if (enquiryForm) handleFormSubmission(enquiryForm);
if (footerForm) handleFormSubmission(footerForm);

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Gallery Carousel (vanilla JS)
(function initCarousel(){
  const root = document.querySelector('.carousel');
  if (!root) return;

  const track = root.querySelector('.carousel-track');
  const slides = Array.from(track.querySelectorAll('.slide'));
  const prev = root.querySelector('.carousel-arrow.prev');
  const next = root.querySelector('.carousel-arrow.next');
  const dotsWrap = root.querySelector('.carousel-dots');
  const thumbs = Array.from(root.querySelectorAll('.carousel-thumbs .thumb'));
  const autoplay = root.getAttribute('data-autoplay') === 'true';
  const intervalMs = Number(root.getAttribute('data-interval')) || 4500;

  // Build dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Go to slide ${i+1}`);
    if (i === 0) b.classList.add('is-active');
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  let index = 0;
  let timer = null;

  function setActive(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === index));
    dots.forEach((d, j) => d.classList.toggle('is-active', j === index));
    thumbs.forEach((t, j) => t.classList.toggle('is-active', j === index));
  }

  function nextSlide(){ setActive(index + 1); }
  function prevSlide(){ setActive(index - 1); }

  next?.addEventListener('click', nextSlide);
  prev?.addEventListener('click', prevSlide);
  dots.forEach((d, i) => d.addEventListener('click', () => setActive(i)));
  thumbs.forEach((t, i) => t.addEventListener('click', () => setActive(i)));

  // Autoplay with pause on hover
  function start(){ if (!autoplay) return; stop(); timer = setInterval(nextSlide, intervalMs); }
  function stop(){ if (timer) clearInterval(timer); timer = null; }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();

  // Swipe support
  let startX = 0, dx = 0, isDown = false;
  const vp = root.querySelector('.carousel-viewport');
  vp.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDown = true; stop(); }, {passive: true});
  vp.addEventListener('touchmove', (e) => { if (!isDown) return; dx = e.touches[0].clientX - startX; }, {passive: true});
  vp.addEventListener('touchend', () => {
    if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); }
    isDown = false; dx = 0; start();
  });
})();

// Download functionality
function createZipFromImages(imageFiles, zipName) {
  // Using JSZip library for creating ZIP files
  // Note: This requires including JSZip library in the HTML
  if (typeof JSZip === 'undefined') {
    // Fallback: download images individually
    imageFiles.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = file;
        link.download = file.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });
    return;
  }

  const zip = new JSZip();
  const promises = [];

  imageFiles.forEach(file => {
    promises.push(
      fetch(file)
        .then(response => response.blob())
        .then(blob => {
          const fileName = file.split('/').pop();
          zip.file(fileName, blob);
        })
    );
  });

  Promise.all(promises).then(() => {
    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
  });
}

function downloadSingleFile(filePath, fileName) {
  const link = document.createElement('a');
  link.href = filePath;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function triggerDownload(downloadType) {
  if (downloadType === 'floor-plans') {
    // Create array of floor plan files (f1.webp to f14.webp)
    const floorPlanFiles = [];
    for (let i = 1; i <= 14; i++) {
      floorPlanFiles.push(`images/f${i}.webp`);
    }
    createZipFromImages(floorPlanFiles, 'Emaar_India_Business_Centre_Floor_Plans.zip');
  } else if (downloadType === 'master-plan') {
    downloadSingleFile('images/master-plan.webp', 'Emaar_India_Business_Centre_Master_Plan.webp');
  }
}

// Add event listeners for download buttons
document.addEventListener('DOMContentLoaded', function() {
  // Handle download button clicks
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const downloadType = btn.getAttribute('data-download');
      
      // Set pending download and open modal
      pendingDownload = downloadType;
      openModal();
      
      // Update modal title to indicate download purpose
      const modalTitle = document.querySelector('#enq-title');
      const modalSubtitle = document.querySelector('.modal-subtitle');
      
      if (modalTitle && modalSubtitle) {
        if (downloadType === 'floor-plans') {
          modalTitle.textContent = 'Download Floor Plans';
          modalSubtitle.textContent = 'Fill the form below to download all floor plans';
        } else if (downloadType === 'master-plan') {
          modalTitle.textContent = 'Download Master Plan';
          modalSubtitle.textContent = 'Fill the form below to download the master plan';
        }
      }
    });
  });
});

