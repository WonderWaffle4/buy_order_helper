// background.js

let color = '#3aa757';

chrome.webNavigation.onCompleted.addListener(({ tabId }) => {
  chrome.scripting.executeScript({
    target: { tabId },
    function: markItems,
  })
});

markItems = () => {
  chrome.storage.sync.get("marked_items", ({ marked_items }) => {
    //let marked_items = ['listing-440_76561198116396341_fff74787ecf7f26cc1215b0f2a7058b9', 'listing-440_76561198116396341_70af5a088a0b19351cd8fce1519cd7d9', 'listing-440_76561198116396341_5bbb34aa1ec2f554613f97e98f6e84e7', 'listing-440_76561198116396341_ec4814690f8fc97eaf02ed7ed8214ec4', 'listing-440_76561198116396341_6192028491fd16974567202cc9914a10', 'listing-440_76561198116396341_46d39436aaa0a90e70d86df632c9fecf', 'listing-440_76561198116396341_d7e73de0ad992b2b32d298ad22928a73', 'listing-440_76561198116396341_b83fa5a1f8c4028d97f92cba97427284', 'listing-440_76561198116396341_f75ec7c290fe5e154d94b13b15c4ebe4', 'listing-440_76561198116396341_aac4d4787f2b14a0e2cc7de4cf43cc90']
    //console.log("in mark_items.js");
    let active_button = document.querySelector('.pagination .active').children[0];
    let page = active_button.textContent;

    let page_selector = document.querySelector(".pagination");
    console.log(Number(page_selector.children[2].children[0].textContent));
    //console.log(page_selector);
    if (marked_items[0].length > 0) {
      
      console.log(page_selector, "hrere", Number(page_selector.children[2].children[0].textContent) - 1);

      let mark = false;
      for (let i = 0; i < Number(page_selector.children[2].children[0].textContent) - 1; i++) {
        if (marked_items[i].length > 0) {
          mark = true;
          console.log("here");
          break;
        }
      }

      if (mark) {
        console.log("here1");
        page_selector.children[0].children[0].style.backgroundColor = 'blue';
        page_selector.children[1].children[0].style.backgroundColor = 'blue';
      }

      mark = false;

      for (let i = 2; i < page_selector.children.length - 2; i++) {
        if (page_selector.children[i].className == 'active') {
          console.log("active");
          page_selector.children[i].children[0].style.backgroundColor = 'red';
        }
        else {
          console.log("not active");
          page_selector.children[i].children[0].style.backgroundColor = '#990000';
        }
      }

      // for (let i = Number(page_selector.children[page_selector.length - 3].textContent) - 1; i < marked_items.length; i++) {
      //   if (marked_items[i].length > 0) {
      //     mark = true;
      //     break;
      //   }
      // }


      if (marked_items[page - 1].length > 0) {
        for (let marked_item of marked_items[page - 1]) {
          //console.log(marked_item);
          let listing = document.getElementById(marked_item);
          if (listing.children[0].id != "BackpackTF_Marked_Listing") {
            let inject = document.createElement("div");
            inject.style.backgroundColor = 'red';
            inject.style.height = "75px";
            inject.style.width = "87px";
            inject.id = "BackpackTF_Marked_Listing";
            listing.insertBefore(inject, listing.children[0]);
            inject.append(listing.children[1]);
            inject.children[0].style.margin = "5px 5px";
            //console.log(inject.children[0]);
          }
        }
      }
    };
  });
}




// chrome.storage.sync.get("marked_items", ({marked_items}) => {
//   marked_items.push("1");
//   chrome.storage.sync.set({marked_items: marked_items});
//   console.log(marked_items);
// });

/*
chrome.tabs.onActivated.addListener( function(activeInfo){
  chrome.tabs.get(activeInfo.tabId, function(tab){
      y = tab.url;
      console.log("you are here: "+y);
  });
});
});
*/

/*
chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete' && tab.active) {
    console.clear();
    
  }
})*/

chrome.runtime.onInstalled.addListener(() => {
  let marked_items = [[]];
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ marked_items });
  console.log(marked_items);
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

