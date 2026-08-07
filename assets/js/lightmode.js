let lightmode = localStorage.getItem('lightmode');
const themeSwitch = document.querySelector('.theme-switch');

const enableLightmode = () => {
    document.body.classList.add('lightmode');
    localStorage.setItem('lightmode', 'active');
}

const disableLightmode = () => {
    document.body.classList.remove('lightmode');
    localStorage.removeItem('lightmode');
}

if (lightmode === 'active') {
    enableLightmode();
}

if (themeSwitch) {
    themeSwitch.addEventListener('click', () => {
        lightmode = localStorage.getItem('lightmode');
        lightmode !== 'active' ? enableLightmode() : disableLightmode();
    });
}