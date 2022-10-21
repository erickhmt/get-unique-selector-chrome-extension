const MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';

// Previous dom, that we want to track, so we can remove the previous styling.
let prevDOM = null;

const mouseHandler = (e) => {
    const srcElement = e.target;
    console.log('target: ', srcElement)

    if (prevDOM != null) {
        prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
    srcElement.classList.add(MOUSE_VISITED_CLASSNAME);

    prevDOM = srcElement;
}

const clickHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (prevDOM) {
        document.removeEventListener('mousemove', mouseHandler);
    }
    console.log('selected el: ', e.target);
    let generatedXpath = getXPath(e.target);
    console.log('generatedXpath: ', generatedXpath);
}

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {

        const isPickingActive = message?.active;
        console.log(message?.active);
        sendResponse({target: 'teste'});

        if(isPickingActive) {
            console.log('enable picking')
            document.addEventListener('mousemove', mouseHandler, false);
            document.addEventListener('click', clickHandler, false);
        } else {
            console.log('disable picking')
            document.removeEventListener('mousemove', mouseHandler); 
            document.removeEventListener('click', clickHandler);  
        }
    }
);

function getXPath(el) {
    let nodeElem = el;
    if (nodeElem && nodeElem.id) {
        return "//*[@id=\"" + nodeElem.id + "\"]";
    }
    let parts = [];
    while (nodeElem && Node.ELEMENT_NODE === nodeElem.nodeType) {
        let nbOfPreviousSiblings = 0;
        let hasNextSiblings = false;
        let sibling = nodeElem.previousSibling;
        while (sibling) {
            if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE &&
                sibling.nodeName === nodeElem.nodeName) {
                nbOfPreviousSiblings++;
            }
            sibling = sibling.previousSibling;
        }
        sibling = nodeElem.nextSibling;
        while (sibling) {
            if (sibling.nodeName === nodeElem.nodeName) {
                hasNextSiblings = true;
                break;
            }
            sibling = sibling.nextSibling;
        }
        let prefix = nodeElem.prefix ? nodeElem.prefix + ":" : "";
        let nth = nbOfPreviousSiblings || hasNextSiblings
            ? "[" + (nbOfPreviousSiblings + 1) + "]"
            : "";
        parts.push(prefix + nodeElem.localName + nth);
        nodeElem = nodeElem.parentNode;
    }
    return parts.length ? "/" + parts.reverse().join("/") : "";
}
