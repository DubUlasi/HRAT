document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle Logic ---
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // --- Active Navigation Item Handler ---
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Prevent link reload for mock dashboard
      e.preventDefault();

      // Ignore click if user clicked the plus button inside nav-item
      if (e.target.classList.contains('plus-btn')) {
        e.stopPropagation();
        alert(`Add action clicked for item: ${item.querySelector('span').innerText}`);
        return;
      }

      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
    });
  });

  // --- Profile dropup menu handler ---
  const profileCard = document.getElementById('profileCard');
  const footerSettingsBtn = document.getElementById('footerSettingsBtn');
  const profileMenu = document.getElementById('profileMenu');

  function toggleProfileMenu(e) {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
  }

  profileCard.addEventListener('click', toggleProfileMenu);
  footerSettingsBtn.addEventListener('click', toggleProfileMenu);

  // Close profile menu if clicked outside
  document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target) && e.target !== profileCard && e.target !== footerSettingsBtn) {
      profileMenu.classList.remove('show');
    }
  });

});
