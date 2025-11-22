console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.style.marginRight = '8px';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.gap = '6px';
    button.style.backgroundColor = '#5f5dddff';  
    button.style.padding = '4px 10px';
    button.style.borderRadius = '20px';
    button.style.cursor = 'pointer';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');


    // SVG ICON BUTTON
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="18" height="18" viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" stroke-width="2" 
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 18V5"/>
            <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/>
            <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/>
            <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/>
            <path d="M18 18a4 4 0 0 0 2-7.464"/>
            <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/>
            <path d="M6 18a4 4 0 0 1-2-7.464"/>
            <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>
        </svg>
        <span style="font-size: 13px; padding-left:3px; font-weight: 500;">
            AI Reply
        </span>
    `;
    return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button");
    const button = createAIButton();

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = '<span style="font-size:12px;">Generating...</span>';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" 
                    width="18" height="18" viewBox="0 0 24 24" 
                    fill="none" stroke="currentColor" stroke-width="2" 
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 18V5"/>
                    <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/>
                    <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/>
                    <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/>
                    <path d="M18 18a4 4 0 0 0 2-7.464"/>
                    <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/>
                    <path d="M6 18a4 4 0 0 1-2-7.464"/>
                    <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>
                </svg>
                <span style="font-size: 13px; padding-left:3px; font-weight: 500;">
            AI Reply
        </span>
            `;
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
