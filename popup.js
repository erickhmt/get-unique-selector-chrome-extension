let pickingElement = false;

document.querySelector('#btnPicker').addEventListener('click', async (e) => {
  pickingElement = !pickingElement;

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log('sending to: ', tabs[0])
    chrome.tabs.sendMessage(tabs[0].id, {active: pickingElement}, function(response) {
      console.log(response);
    });
  });
})