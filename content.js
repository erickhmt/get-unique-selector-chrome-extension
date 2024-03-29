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
    let bestSelector = getBestUniqueSelector(e.target);
    alert(`Best Unique Selector: ${bestSelector}\nXPath: ${generatedXpath}`);
}

chrome.runtime.onMessage.addListener(message => {
    const isPickingEnabled = message?.active;

    console.log('isPickingEnabled: ', isPickingEnabled)

    if (isPickingEnabled) {
        addEventListeners();
    } else {
        removeEventListeners();

        if (prevDOM) {
            prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
        }
    }
});

const getBestUniqueSelector  = (el) => {
    if (!el) return 'no valid element';

    // ID Selector
    if (el.id) return `#${el.id}`;

    // Class Selector
    const classes = el.classList.length ? `.${Array.from(el.classList).join('.')}` : '';
    if (classes && document.querySelectorAll(classes).length === 1) return classes;

    // Name Attribute for form elements
    if (el.name && document.querySelectorAll(`[name="${el.name}"]`).length === 1) return `[name="${el.name}"]`;

    // CSS Selector
    let cssPath = cssSelector(el);
    if (cssPath && document.querySelectorAll(cssPath).length === 1) return cssPath;

    // XPath as a fallback
    return getXPath(el);
}

const cssSelector = el => {
    if (!el) return '';
    let path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
            selector += `#${el.id}`;
            path.unshift(selector);
            break;
        } else if (el.className) {
            selector += `.${Array.from(el.classList).join('.')}`;
        }
        let sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
            if (sib.nodeName.toLowerCase() == selector)
                nth++;
        }
        if (nth != 1) selector += `:nth-of-type(${nth})`;
        path.unshift(selector);
        el = el.parentNode;
    }
    return path.join(' > ');
};

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