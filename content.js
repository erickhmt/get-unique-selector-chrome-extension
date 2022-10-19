// Unique ID for the className.
const MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';

// Previous dom, that we want to track, so we can remove the previous styling.
let prevDOM = null;

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        
        console.log(message);
        sendResponse({target: 'teste'})
    }
);

const mouseHandler = (e) => {
    const srcElement = e.target;
    console.log('target: ', srcElement)

    if (prevDOM != null) {
        prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
    srcElement.classList.add(MOUSE_VISITED_CLASSNAME);

    prevDOM = srcElement;
}

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', mouseHandler, false);

document.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (prevDOM) {
        document.removeEventListener('mousemove', mouseHandler);
    }
    console.log('selected el: ', e.target);
})
