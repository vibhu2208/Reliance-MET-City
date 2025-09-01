// Location Bubbles Interaction
(function initLocationBubbles(){
  const bubbleItems = document.querySelectorAll('.bubble-item');
  if (!bubbleItems.length) return;

  let activeItem = null;

  bubbleItems.forEach(item => {
    const bubble = item.querySelector('.bubble');
    
    // Click interaction
    bubble.addEventListener('click', () => {
      // Remove active from previous
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove('active');
      }
      
      // Toggle current
      const isActive = item.classList.contains('active');
      item.classList.toggle('active', !isActive);
      activeItem = isActive ? null : item;
    });

    // Touch/mobile interaction
    item.addEventListener('touchstart', (e) => {
      e.preventDefault();
      bubble.click();
    }, {passive: false});
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.bubble-item') && activeItem) {
      activeItem.classList.remove('active');
      activeItem = null;
    }
  });
})();
