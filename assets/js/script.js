const navbarNav = document.querySelector('.navbar-nav');
const hamburger = document.querySelector('#hamburger-menu');

// Toggle menu hamburger
hamburger.onclick = (e) => {
    navbarNav.classList.toggle('active');
    e.preventDefault();
};

// klik di luar lngsung nutup
document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
});

// opsional we ey
const navLinks = document.querySelectorAll('.navbar-nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbarNav.classList.remove('active');
    });
});