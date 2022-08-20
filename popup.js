// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");
let key_price;

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getMarkedItemsList,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: echoAll,
  });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: markItems,
  });
});

// function httpGetAsync(theUrl, callback) {
//   var xmlHttp = new XMLHttpRequest();
//   xmlHttp.onreadystatechange = function () {
//     if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
//       callback(xmlHttp.responseText);
//   }
//   xmlHttp.open("GET", theUrl, true); // true for asynchronous 
//   xmlHttp.send(null);
// }


// The body of this function will be executed as a content script inside the
// current page
//chrome.scripting.executeScript({target: {tabId : tab.id}, file: 'mark_items.js'})




async function getMarkedItemsList() {    //console.clear();

    // options = {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     "token": "Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU=",
    //     "intent": "0",
    //     "inactive": "1",
    //     "cache": "default",
    //   },
    // };

    // currency_options = {
    //   method: 'GET',
    //   mode: 'cors',
    //   headers: {
    //     'key': '62fcd5410dcd02c63b0ac335',
    //   },
    // };

    user_buy_orders_url = "https://backpack.tf/api/classifieds/listings/v1?" + new URLSearchParams({
      token: 'Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU',
      intent: '0',
      inactive: '1',
    });

    currency_url = "https://backpack.tf/api/IGetCurrencies/v1?" + new URLSearchParams({
      key: '62fcd5410dcd02c63b0ac335',
    });


    chrome.storage.sync.get("marked_items", ({ marked_items }) => {
      marked_items.length = 0;
      marked_items = [ [] ];
      chrome.storage.sync.set({ marked_items });
    });

    // await fetch(currency_url)
    //   .then((response) => {
    //     if (response.ok) {
    //       return response.json();
    //     }
    //     throw new Error('Could not get price of a key');
    //   }).then((data) => {
    //     key_price = data.response.currencies.keys.price.value;
    //     return data;
    //   });
    // console.log(key_price);


    //get key price

    await fetch(currency_url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Response was not ok.');
      }).then(async (data) => {
        let key_price = data.response.currencies.keys.price.value;
        //get listings
        await fetch(user_buy_orders_url)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Response was not ok.');
          })
          .then(async (data) => {
            let user_buy_orders = data.listings;
            let page_number = 1;
            let buy_order_number = 0;



            for (let user_buy_order of user_buy_orders) {
              buy_order_number++;
              chrome.storage.sync.get("marked_items", ({ marked_items }) => {
                if (buy_order_number % 11 == 0 && marked_items.length < page_number) {
                  console.log('add dimension');
                  console.log(marked_items);
                  chrome.storage.sync.set({ marked_items });
                  page_number++;
                };
              });
              
              let item_sku = user_buy_order.item.name;
              buy_orders_url = "https://backpack.tf/api/classifieds/listings/snapshot?" + new URLSearchParams({
                key: '62fcd5410dcd02c63b0ac335',
                sku: item_sku,
                appid: '440',
                token: 'Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU=',
              });
              //get listings from current item and then compare them with user listings
              await fetch(buy_orders_url)
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error('Response was not ok.');
                })
                .then((data) => {
                  buy_orders = data.listings;
                  for (let buy_order of buy_orders) {
                    if (buy_order.intent == 'buy') {


                      compareListings = (listing1, listing2, key_price) => {
                        let listing1_price = 0;
                        let listing2_price = 0;

                        if (listing1.keys != undefined) {
                          listing1_price += key_price * listing1.keys
                        };

                        if (listing1.metal != undefined) {
                          listing1_price += listing1.metal;
                        };

                        if (listing2.keys != undefined) {
                          listing2_price += key_price * listing2.keys
                        };

                        if (listing2.metal != undefined) {
                          listing2_price += listing2.metal;
                        };

                        return (listing1_price > listing2_price);
                      };


                      if (compareListings(buy_order.currencies, user_buy_order.currencies, key_price)) {
                        console.log("add mark");
                          chrome.storage.sync.get("marked_items", ({ marked_items }) => {
                            console.log(marked_items);
                            marked_items[page_number - 1].push('listing-' + user_buy_order.id);
                            chrome.storage.sync.set({ marked_items });
                          });       
                      }
                      break;
                    };
                  };
                });
            };

          });


        return data;
      });

}

markItems = () => {
  chrome.storage.sync.get("marked_items", ({ marked_items }) => {
    //let marked_items = ['listing-440_76561198116396341_fff74787ecf7f26cc1215b0f2a7058b9', 'listing-440_76561198116396341_70af5a088a0b19351cd8fce1519cd7d9', 'listing-440_76561198116396341_5bbb34aa1ec2f554613f97e98f6e84e7', 'listing-440_76561198116396341_ec4814690f8fc97eaf02ed7ed8214ec4', 'listing-440_76561198116396341_6192028491fd16974567202cc9914a10', 'listing-440_76561198116396341_46d39436aaa0a90e70d86df632c9fecf', 'listing-440_76561198116396341_d7e73de0ad992b2b32d298ad22928a73', 'listing-440_76561198116396341_b83fa5a1f8c4028d97f92cba97427284', 'listing-440_76561198116396341_f75ec7c290fe5e154d94b13b15c4ebe4', 'listing-440_76561198116396341_aac4d4787f2b14a0e2cc7de4cf43cc90']
    //console.log("in mark_items.js");
    let active_button = document.querySelector('.pagination .active').children[0];
    let page = active_button.textContent;
    if (marked_items[0].length > 0) {
      //console.log(marked_items);
      if (marked_items[page - 1].length > 0) {
        active_button.style.backgroundColor = 'red';
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

// markItems = () => {
//   chrome.storage.sync.get("marked_items", ({ marked_items }) => {
//     //let marked_items = ['listing-440_76561198116396341_fff74787ecf7f26cc1215b0f2a7058b9', 'listing-440_76561198116396341_70af5a088a0b19351cd8fce1519cd7d9', 'listing-440_76561198116396341_5bbb34aa1ec2f554613f97e98f6e84e7', 'listing-440_76561198116396341_ec4814690f8fc97eaf02ed7ed8214ec4', 'listing-440_76561198116396341_6192028491fd16974567202cc9914a10', 'listing-440_76561198116396341_46d39436aaa0a90e70d86df632c9fecf', 'listing-440_76561198116396341_d7e73de0ad992b2b32d298ad22928a73', 'listing-440_76561198116396341_b83fa5a1f8c4028d97f92cba97427284', 'listing-440_76561198116396341_f75ec7c290fe5e154d94b13b15c4ebe4', 'listing-440_76561198116396341_aac4d4787f2b14a0e2cc7de4cf43cc90']
//     //console.log("in mark_items.js");
//     let page = document.querySelector('.pagination .active').children[0].textContent; 
//     if (marked_items[0].length > 0) {
//       //console.log(marked_items);
//         for (let marked_item of marked_items[page - 1]) {
//           //console.log(marked_item);
//           let listing = document.getElementById(marked_item);
//           if (listing.children[0].id != "BackpackTF_Marked_Listing") {
//             let inject = document.createElement("div");
//             inject.style.backgroundColor = 'red';
//             inject.style.height = "75px";
//             inject.style.width = "87px";
//             inject.id = "BackpackTF_Marked_Listing";
//             listing.insertBefore(inject, listing.children[0]);
//             inject.append(listing.children[1]);
//             inject.children[0].style.margin = "5px 5px";
//             //console.log(inject.children[0]);
//           }
//         }
//     };
//   });
// }

echoAll = () => {
  console.log("Analyze done!");
}
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     //console.clear();

//     // options = {
//     //   method: 'GET',
//     //   mode: 'cors',
//     //   headers: {
//     //     "token": "Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU=",
//     //     "intent": "0",
//     //     "inactive": "1",
//     //     "cache": "default",
//     //   },
//     // };

//     // currency_options = {
//     //   method: 'GET',
//     //   mode: 'cors',
//     //   headers: {
//     //     'key': '62fcd5410dcd02c63b0ac335',
//     //   },
//     // };

//     user_buy_orders_url = "https://backpack.tf/api/classifieds/listings/v1?" + new URLSearchParams({
//       token: 'Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU',
//       intent: '0',
//       inactive: '1',
//     });

//     currency_url = "https://backpack.tf/api/IGetCurrencies/v1?" + new URLSearchParams({
//       key: '62fcd5410dcd02c63b0ac335',
//     });


//     chrome.storage.sync.get("marked_items", ({ marked_items }) => {
//       marked_items.length = 0;
//       marked_items = [ [] ];
//       chrome.storage.sync.set({ marked_items });
//       console.log(marked_items);
//     });


//     //get key price

//     // fetch(currency_url)
//     //   .then((response) => {
//     //     if (response.ok) {
//     //       return response.json();
//     //     }
//     //     throw new Error('Response was not ok.');
//     //   }).then((data) => {
//     //     let key_price = data.response.currencies.keys.price.value;
//     //     //get listings
//     //     fetch(user_buy_orders_url)
//     //       .then((response) => {
//     //         if (response.ok) {
//     //           return response.json();
//     //         }
//     //         throw new Error('Response was not ok.');
//     //       })
//     //       .then((data) => {
//     //         let user_buy_orders = data.listings;
//     //         let page_number = 1;
//     //         let buy_order_number = 0;



//     //         for (let user_buy_order of user_buy_orders) {
//     //           buy_order_number++;
//     //           chrome.storage.sync.get("marked_items", ({ marked_items }) => {
//     //             if (buy_order_number % 11 == 0 && marked_items.length < page_number) {
//     //               console.log('add dimension');
//     //               console.log(marked_items);
//     //               chrome.storage.sync.set({ marked_items });
//     //               page_number++;
//     //             };
//     //           });
              
//     //           let item_sku = user_buy_order.item.name;
//     //           buy_orders_url = "https://backpack.tf/api/classifieds/listings/snapshot?" + new URLSearchParams({
//     //             key: '62fcd5410dcd02c63b0ac335',
//     //             sku: item_sku,
//     //             appid: '440',
//     //             token: 'Hz8M03vgJpjb9pFEv0xmEA8IRMQjZzGUxMJl3kZ9zTU=',
//     //           });
//     //           //get listings from current item and then compare them with user listings
//     //           fetch(buy_orders_url)
//     //             .then((response) => {
//     //               if (response.ok) {
//     //                 return response.json();
//     //               }
//     //               throw new Error('Response was not ok.');
//     //             })
//     //             .then((data) => {
//     //               buy_orders = data.listings;
//     //               for (let buy_order of buy_orders) {
//     //                 if (buy_order.intent == 'buy') {


//     //                   compareListings = (listing1, listing2, key_price) => {
//     //                     let listing1_price = 0;
//     //                     let listing2_price = 0;

//     //                     if (listing1.keys != undefined) {
//     //                       listing1_price += key_price * listing1.keys
//     //                     };

//     //                     if (listing1.metal != undefined) {
//     //                       listing1_price += listing1.metal;
//     //                     };

//     //                     if (listing2.keys != undefined) {
//     //                       listing2_price += key_price * listing2.keys
//     //                     };

//     //                     if (listing2.metal != undefined) {
//     //                       listing2_price += listing2.metal;
//     //                     };

//     //                     return (listing1_price > listing2_price);
//     //                   };


//     //                   if (compareListings(buy_order.currencies, user_buy_order.currencies, key_price)) {
                        
//     //                     console.log("add mark");
//     //                     add_marked_item = (user_buy_order, page_number) => {
//     //                       chrome.storage.sync.get("marked_items", ({ marked_items }) => {
//     //                         console.log(marked_items);
//     //                         marked_items[page_number - 1].push('listing-' + user_buy_order.id);
//     //                         chrome.storage.sync.set({ marked_items });
//     //                       });
//     //                     };
//     //                     add_marked_item(user_buy_order, page_number);
                          
                        
//     //                   }
//     //                   break;
//     //                 };
//     //               };
//     //             });
//     //         };

//     //       });


//     //     return data;
//     //   });





//   });


// }







// fetch(currency_url)
    // .then((response) => {
    //   if(response.ok){
    //     return response.json();
    //   };
    //   throw new Error('Response was not okay.');
    // }).then((data) => {
    //   if(data.response.currencies.keys.price.value.bebra == undefined){
    //     console.log("No such category");
    //   };
    //   return data;
    // }); 