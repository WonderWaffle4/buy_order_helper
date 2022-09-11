// background.js
//"externally_connectable": {
//"matches": ["https://backpack.tf/*", "http://backpack.tf/*"]
//}
let color = '#3aa757';

chrome.runtime.onMessage.addListener((response, sender, sendResponse) => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId },
      function: markItems,
    });
  });
});

chrome.webNavigation.onCompleted.addListener(({ tabId }) => {
  chrome.scripting.executeScript({
    target: { tabId },
    function: markItems,
  });

});

markItems = () => {
  chrome.storage.local.get("marked_items", ({ marked_items }) => {
    let active_button = document.querySelector('.pagination .active').children[0];
    let page = active_button.textContent;
    let page_selector = document.querySelector(".pagination");
    console.log(marked_items);
    if (marked_items[0].length > 0) {
      let mark = false;
      for (let i = 0; i < Number(page_selector.children[2].children[0].textContent) - 1; i++) {
        if (marked_items[i].length > 0) {
          mark = true;
          break;
        }
      }
      if (mark) {
        page_selector.children[0].children[0].style.backgroundColor = 'blue';
        page_selector.children[1].children[0].style.backgroundColor = 'blue';
      }
      
      for (let i = 2; i < page_selector.children.length - 2; i++) {
        if (marked_items[Number(page_selector.children[i].children[0].textContent) - 1].length > 0) {
          if (page_selector.children[i].className == 'active')
            page_selector.children[i].children[0].style.backgroundColor = 'red';
          else
            page_selector.children[i].children[0].style.backgroundColor = '#990000';
        }
      }
      mark = false;
      for (let i = marked_items.length - 1; i > Number(page_selector.children[page_selector.children.length - 3].children[0].textContent); i--) {
        if (marked_items[i].length > 0) {
          mark = true;
          break;
        }
      }
      if (mark) {
        page_selector.children[page_selector.children.length - 1].children[0].style.backgroundColor = 'blue';
        page_selector.children[page_selector.children.length - 2].children[0].style.backgroundColor = 'blue';
      }


      if (marked_items[page - 1].length > 0) {
        for (let marked_item of marked_items[page - 1]) {
          let listing = document.getElementById(marked_item);
          if (listing.children[0].id != "BackpackTF_Marked_Listing") {
            console.log(12341241414141)
            let inject = document.createElement("div");
            inject.style.backgroundColor = 'red';
            inject.style.height = "75px";
            inject.style.width = "87px";
            inject.id = "BackpackTF_Marked_Listing";
            listing.insertBefore(inject, listing.children[0]);
            inject.append(listing.children[1]);
            inject.children[0].style.margin = "5px 5px";
          }
        }
      }
    };
  });
}

chrome.runtime.onInstalled.addListener(() => {
  let marked_items = [[]];
  let api_key = "6304bfd7f008aa881605375a";
  let token = "5a8eb58244325a307c31a484";
  chrome.storage.sync.set({ color });
  chrome.storage.local.set({ marked_items });
  chrome.storage.sync.set({ api_key });
  chrome.storage.sync.set({ token });
  console.log(marked_items);
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

