refreshButton()
let global_refresh_button = document.getElementById("refreshButton");

global_refresh_button.addEventListener("click", async () => {
  await getMarkedItemsList();
});

global_refresh_button.children[0].addEventListener('mouseover', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh_active16.png');
  element.src = image_url;
});

global_refresh_button.children[0].addEventListener('mouseout', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh16.png');
  element.src = image_url;
});

function refreshButton() {
  let refresh_button = document.createElement("button");
  refresh_button.id = "refreshButton";
  refresh_button.style.background = 'none';
  refresh_button.style.border = 'none';
  let image_url = chrome.runtime.getURL('StyleImages/refresh16.png');
  refresh_button.innerHTML = '<img src=\"' + image_url + '\">';
  let element = document.querySelectorAll(".panel-heading")[2];
  element.insertBefore(refresh_button, element.children[1]);
  refresh_button.append(element.children[2]);

  return refresh_button;
}

refreshButtonOver = (event) => {
  let element = event.target;
  element.src = 'http://127.0.0.1:8887/refresh_active16.png';
  element.id = 'mouseover';
}

refreshButtonOut = (event) => {
  let element = event.target;
  element.src = 'http://127.0.0.1:8887/refresh16.png';
  element.id = 'mouseout';
}

async function getMarkedItemsList() {

  console.clear();

  await chrome.storage.sync.get("api_key", async ({ api_key }) => {
    await chrome.storage.sync.get("token", async ({ token }) => {
      console.log(api_key);
      console.log(token);

      user_buy_orders_url = "https://backpack.tf/api/classifieds/listings/v1?" + new URLSearchParams({
        token: token,
        intent: '0',
        inactive: '1',
      });

      currency_url = "https://backpack.tf/api/IGetCurrencies/v1?" + new URLSearchParams({
        key: api_key,
      });

      chrome.storage.sync.get("marked_items", ({ marked_items }) => {
        marked_items.length = 0;
        marked_items = [[]];
        chrome.storage.sync.set({ marked_items });
      });

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
              chrome.storage.sync.get("marked_items", ({ marked_items }) => {
                for (let i = 0; i < Math.ceil(user_buy_orders.length / 10) - 1; i++) {
                  marked_items.push([]);
                }
                chrome.storage.sync.set({ marked_items });
                console.log(marked_items);
              });
              for (let user_buy_order of user_buy_orders) {
                buy_order_number++;
                if (buy_order_number % 12 == 0) {
                  page_number++;
                }
                let item_sku = user_buy_order.item.name;
                buy_orders_url = "https://backpack.tf/api/classifieds/listings/snapshot?" + new URLSearchParams({
                  key: api_key,
                  sku: item_sku,
                  appid: '440',
                  token: token,
                });
                //get listings from current item and then compare them with user listings
                await fetch(buy_orders_url)
                  .then((response) => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error('response was not okay');
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
                          chrome.storage.sync.get("marked_items", ({ marked_items }) => {
                            marked_items[page_number - 1].push(['listing-' + user_buy_order.id, 1]);
                            chrome.storage.sync.set({ marked_items });
                          });

                        }
                        break;
                      };
                    };
                    return data;
                  })
                  .catch(() => {
                    chrome.storage.sync.get("marked_items", ({ marked_items }) => {
                      marked_items[page_number - 1].push(['listing-' + user_buy_order.id, 0]);
                      chrome.storage.sync.set({ marked_items });
                    });
                    return data;
                  });
              };
              return data;
            });


          return data;
        });
      chrome.runtime.sendMessage("scanning done", (response) => {
      });
    });
  });
  return 1;
}