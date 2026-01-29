
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ADMIN_MATRIX] Kernel v5.9.1 Handshake Complete.');
    
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', async () => {
            const pageId = item.getAttribute('data-page');
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const routeMap = {
                'dashboard': 'svid-settings',
                'workshop': 'workshop-settings',
                'judy': 'judy-settings',
                'orchestrator': 'orchestrator-settings'
            };

            loadPage(routeMap[pageId] || pageId);
        });
    });
});

async function loadPage(slug) {
    const contentArea = document.getElementById('content-area');
    try {
        const response = await fetch(`./pages/${slug}.html`);
        if (response.ok) {
            const html = await response.text();
            contentArea.innerHTML = `<div class="animate-in">${html}</div>`;
        } else {
            contentArea.innerHTML = `<div style="padding: 100px; text-align: center; opacity: 0.2; font-family: 'JetBrains Mono'">MODUL_PART_NOT_FOUND: ${slug}</div>`;
        }
    } catch (e) {
        console.error("Page Load Fail", e);
    }
}

function systemRollback() {
    if (confirm("KRITICKÁ OPERACE: Opravdu chcete provést rollback Jádra na verzi v5.9.0?")) {
        parent.postMessage('system:rollback', '*');
    }
}
