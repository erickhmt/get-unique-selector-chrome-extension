'use strict';

const MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';

// Previous dom, that we want to track, so we can remove the previous styling.
let prevDOM = null;

const mouseHandler = (e) => {
    const srcElement = e.target;

    if(srcElement === prevDOM)
        return;
    
    if (prevDOM) {
        prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }

    srcElement.classList.add(MOUSE_VISITED_CLASSNAME);
    prevDOM = srcElement;
}

const addEventListeners = () => {
    document.addEventListener('mousemove', mouseHandler, false);
    document.addEventListener('click', clickHandler, false);
};

const removeEventListeners = () => {
    document.removeEventListener('mousemove', mouseHandler);
    document.removeEventListener('click', clickHandler);
};

const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeEventListeners();

    if (prevDOM) {
        document.removeEventListener('mousemove', mouseHandler);
        prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
    document.removeEventListener('click', clickHandler);

    let generatedXpath = getXPath(e.target);
    alert('Xpath: ' + generatedXpath);
}

chrome.runtime.onMessage.addListener(message => {
    const isPickingEnabled = message?.active;

    if (isPickingEnabled) {
        addEventListeners();
    } else {
        removeEventListeners();

        if (prevDOM) {
            prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
        }
    }
});

const getXPath = el => {
    if (!el) return '';
    if (el.id) return `//*[@id="${el.id}"]`;

    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        for (let sibling = el.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
            if (sibling.nodeName === el.nodeName) index++;
        }

        const tagName = el.nodeName.toLowerCase();
        const pathSegment = `[${index}]`;
        parts.unshift(`${tagName}${pathSegment}`);
        el = el.parentNode;
    }
    return parts.length ? `/${parts.join('/')}` : '';
};