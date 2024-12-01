"use strict";

const MOUSE_VISITED_CLASSNAME = "crx_mouse_visited";

let previousHoveredElement = null;
let floatingDiv = null;

const mouseHandler = (e) => {
  const srcElement = e.target;

  if (srcElement === previousHoveredElement) return;

  if (previousHoveredElement) {
    previousHoveredElement.classList.remove(MOUSE_VISITED_CLASSNAME);
  }

  if(floatingDiv !== null) {
    floatingDiv.style.display = 'block';
    floatingDiv.style.top = `${e.clientY + 20}px`;
    floatingDiv.style.left = `${e.clientX + 10}px`;
    floatingDiv.innerText = 'Selector: ' + getBestUniqueSelector(e.target);
}

  srcElement.classList.add(MOUSE_VISITED_CLASSNAME);
  previousHoveredElement = srcElement;
};

const addEventListeners = () => {
  document.addEventListener("mousemove", mouseHandler, false);
  document.addEventListener("click", clickHandler, false);
};

const removeEventListeners = () => {
  document.removeEventListener("mousemove", mouseHandler);
  document.removeEventListener("click", clickHandler);
};

const clickHandler = (e) => {
  e.preventDefault();
  e.stopPropagation();
  removeEventListeners();
  removeFloatingDiv();

  if (previousHoveredElement) {
    document.removeEventListener("mousemove", mouseHandler);
    previousHoveredElement.classList.remove(MOUSE_VISITED_CLASSNAME);
  }
  document.removeEventListener("click", clickHandler);

  let bestSelector = getBestUniqueSelector(e.target);

  navigator.clipboard.writeText(bestSelector);
  alert(`Best Unique Selector: ${bestSelector}. Copied to clipboard!`);
};

chrome.runtime.onMessage.addListener((message) => {
  const isPickingEnabled = message?.active;

  if (isPickingEnabled) {
    addEventListeners();
    addFloatingDiv();
  } else {
    removeEventListeners();
    removeFloatingDiv();

    if (previousHoveredElement) {
      previousHoveredElement.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
  }
});

const addFloatingDiv = () => {
  floatingDiv = document.createElement('div');
  floatingDiv.className = 'floating-div';
  floatingDiv.innerText = 'Selector: ';

  document.body.appendChild(floatingDiv);
}

const removeFloatingDiv = () => {
  if(floatingDiv !== null) {
      floatingDiv.remove();
      floatingDiv = null;
  }
}

const getBestUniqueSelector = (el) => {
  if (!el) return "no valid element";

  // ID Selector
  if (el.id) return `#${el.id}`;

  // Class Selector
  const classes = el.classList.length
    ? `.${Array.from(el.classList).join(".")}`
    : "";
  if (classes && document.querySelectorAll(classes).length === 1)
    return classes;

  // Name Attribute for form elements
  if (el.name && document.querySelectorAll(`[name="${el.name}"]`).length === 1)
    return `[name="${el.name}"]`;

  // CSS Selector
  let cssPath = cssSelector(el);
  if (cssPath && document.querySelectorAll(cssPath).length === 1)
    return cssPath;

  // XPath as a fallback
  return getXPath(el);
};

const cssSelector = (el) => {
  if (!el) return "";
  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else if (el.className) {
      selector += `.${Array.from(el.classList).join(".")}`;
    }
    let sib = el,
      nth = 1;
    while ((sib = sib.previousElementSibling)) {
      if (sib.nodeName.toLowerCase() == selector) nth++;
    }
    if (nth != 1) selector += `:nth-of-type(${nth})`;
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
};

const getXPath = (el) => {
  if (!el) return "";
  if (el.id) return `//*[@id="${el.id}"]`;

  const parts = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    for (
      let sibling = el.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      if (sibling.nodeName === el.nodeName) index++;
    }

    const tagName = el.nodeName.toLowerCase();
    const pathSegment = `[${index}]`;

    parts.unshift(`${tagName}${pathSegment}`);
    el = el.parentNode;
  }

  return parts.length ? `/${parts.join("/")}` : "";
};
