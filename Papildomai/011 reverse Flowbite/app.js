

const toggle = document.getElementById('navbar-toggle');
const menu = document.getElementById('navbar-default');

toggle.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', !isOpen);
});