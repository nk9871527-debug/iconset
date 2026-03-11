document.addEventListener('DOMContentLoaded', () => {
    // Event Delegation for Download Buttons
    document.body.addEventListener('click', (e) => {
        // Traverse up to find the anchor tag with download attribute or class .download-btn
        const downloadBtn = e.target.closest('a[download], .download-btn');

        if (downloadBtn) {
            handleDownloadClick(downloadBtn);
        }
    });

    function handleDownloadClick(btn) {
        // Attempt to find the card container
        const card = btn.closest('.icon-card');

        let iconName = 'Unknown Icon';
        let iconSrc = btn.getAttribute('href');

        if (card) {
            // Try to find name within the card
            const nameEl = card.querySelector('.icon-name');
            if (nameEl) {
                iconName = nameEl.textContent.trim();
            } else {
                // Fallback: try image alt text
                const img = card.querySelector('img');
                if (img) iconName = img.alt;
            }
        } else {
            // Fallback for non-card downloads (if any)
            iconName = btn.getAttribute('download') || iconSrc.split('/').pop();
        }

        saveDownload(iconName, iconSrc);
    }

    function saveDownload(name, src) {
        // 1. Get existing downloads
        let downloads = JSON.parse(localStorage.getItem('iconscopeDownloads') || '[]');

        // 2. Check if already exists (avoid duplicates in list, or move to top?)
        // Let's move to top if exists, or add new.
        const existingIndex = downloads.findIndex(item => item.src === src);

        if (existingIndex > -1) {
            downloads.splice(existingIndex, 1); // Remove it
        }

        // 3. Add to beginning
        const newDownload = {
            name: name,
            src: src,
            date: new Date().toISOString()
        };
        downloads.unshift(newDownload);

        // Limit history if needed (e.g. 50 items)
        if (downloads.length > 50) {
            downloads.pop();
        }

        // 4. Save back
        localStorage.setItem('iconscopeDownloads', JSON.stringify(downloads));

        // 5. Update User Stats (increment total count)
        updateUserDownloadCount(1);
    }

    function updateUserDownloadCount(increment) {
        // Update the 'Downloads' stat in existing user object if it tracks it
        // Or just track a simple counter separately if the user object structure is rigid
        // The profile.html uses 'iconscopeUser' which has name/email. Let's add 'downloads' to it.

        let currentUser = JSON.parse(localStorage.getItem('iconscopeUser') || '{}');

        if (!currentUser.downloads) currentUser.downloads = 0;
        currentUser.downloads += increment;

        localStorage.setItem('iconscopeUser', JSON.stringify(currentUser));

        // Dispatch storage event for other tabs to update immediately if needed
        window.dispatchEvent(new Event('storage'));
    }
});
