// Initialize button with user's preferred color
let token_box = document.getElementById("tokenInput");
let token_button = document.getElementById("tokenInputButton");

token_button.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: setToken,
        args: [token_box.value]
    });
})

function setToken(token){
    console.log(token);
    chrome.storage.sync.set({ token });
}
