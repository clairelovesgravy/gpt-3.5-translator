function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = getSelectedText();
    sendResponse({ text: selectedText });
  }
});
