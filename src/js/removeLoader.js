export const removeLoader = () => {
    const loader = document.getElementById('loader');
    document.body.classList.remove('loading');

    setTimeout(() => {
        document.body.removeChild(loader);
    }, 1000)
}