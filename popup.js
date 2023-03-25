let apiKey;


function updateInputWithSelectedText() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          document.getElementById("inputText").value = response.text;
        });
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", updateInputWithSelectedText);



const form = document.getElementById("translateForm");
const inputText = document.getElementById("inputText");
const targetLanguage = document.getElementById("targetLanguage");
const result = document.getElementById("result");
const translateButton = document.getElementById("translateButton");

const supported_languages = {
  "1": "Chinese",
  "2": "French",
  "3": "Japanese",
  "4": "German",
  "5": "Spanish",
  "6": "Italian",
  "7": "English",
  "8": "Thai",
};

const targetLanguageSelect = document.getElementById("targetLanguage");
  
for (const key in supported_languages) {
  const option = document.createElement("option");
  option.value = supported_languages[key];
  option.textContent = supported_languages[key];
  targetLanguageSelect.appendChild(option);
}  


function showApiKeyForm() {
  document.getElementById("api-key-container").style.display = "block";
  document.getElementById("translation-container").style.display = "none";
}

function showTranslationForm() {
  document.getElementById("api-key-container").style.display = "none";
  document.getElementById("translation-container").style.display = "block";
}

async function loadApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("apiKey", (data) => {
      resolve(data.apiKey);
    });
  });
}

async function saveApiKey(value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ apiKey: value }, () => {
      resolve();
    });
  });
}

document.getElementById("apiKeyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  apiKey = document.getElementById("apiKeyInput").value;
  await saveApiKey(apiKey);
  showTranslationForm();
});


async function translateText(inputText, targetLanguage, apiKey) {
  const data = await callOpenAI(inputText, targetLanguage, apiKey);

  if (data && data.choices && data.choices.length > 0) {
    return data.choices[0].message.content;
  } else {
    throw new Error("Unexpected API response structure");
  }
}


function setLoading(loading) {
  if (loading) {
    translateButton.textContent = "Loading...";
    translateButton.disabled = true;
  } else {
    translateButton.textContent = "Translate";
    translateButton.disabled = false;
  }
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}



form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading(true);
  const text = inputText.value;
  const language = targetLanguage.value;
  
  try {
    const translatedText = await translateText(text, language, apiKey);
    result.textContent = `Translated text: ${translatedText}`;
    document.getElementById("copyButton").style.display = "block"; // Show the "Copy" button
  } catch (error) {
    result.textContent = "Error: Unable to translate the text.";
    console.error(error);
  } finally {
    setLoading(false);
  }
});

document.getElementById("copyButton").addEventListener("click", () => {
  copyToClipboard(result.textContent);
});


// At the end of the popup.js file, add the following lines：
document.addEventListener("DOMContentLoaded", async () => {
  apiKey = await loadApiKey();
  if (apiKey) {
    showTranslationForm();
  } else {
    showApiKeyForm();
  }
});