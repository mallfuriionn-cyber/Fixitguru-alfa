
document.addEventListener('DOMContentLoaded', () => {
    console.log('[MODULE:TERMINAL] Operational.');
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousedown', () => {
            if (window.navigator.vibrate) window.navigator.vibrate(5);
        });
    });
});
