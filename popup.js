let btnStart = document.querySelector('#btnStart');
let btnCancel = document.querySelector('#btnCancel');

btnStart.addEventListener('click', async () => {
  btnStart.style.display = 'none';
  btnCancel.style.display = 'block';

  sendMessage({active: true})
});

btnCancel.addEventListener('click', () => {
  btnStart.style.display = 'block';
  btnCancel.style.display = 'none';

  sendMessage({active: false})
});

const sendMessage = (message) => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
      console.log(response);
    });
  });
} 