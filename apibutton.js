// Initialize button with user's preferred color
let api_box = document.getElementById("apiInput");
let api_button = document.getElementById("apiInputButton");


api_button.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    //console.log(api_box);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setApiKey,
        args: [api_box.value]
    });
})

function setApiKey(api_key) {
    console.log(api_key);
    chrome.storage.sync.set({ api_key });
}