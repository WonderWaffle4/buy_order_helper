refreshButtonAll()
refreshButton()
let global_refresh_button = document.getElementById("refreshButton");
let global_refresh_button_all = document.getElementById("refreshButtonAll");

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

global_refresh_button_all.addEventListener("click", async () => {
  await getMarkedItemsList();
});

global_refresh_button_all.children[0].addEventListener('mouseover', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh_all_active16.png');
  element.src = image_url;
});

global_refresh_button_all.children[0].addEventListener('mouseout', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh_all16.png');
  element.src = image_url;
});

function refreshButtonAll() {
  let refresh_button = document.createElement("button");
  refresh_button.id = "refreshButtonAll";
  refresh_button.style.background = 'none';
  refresh_button.style.border = 'none';
  let image_url = chrome.runtime.getURL('StyleImages/refresh_all16.png');
  refresh_button.innerHTML = '<img src=\"' + image_url + '\">';
  let element = document.querySelectorAll(".panel-heading")[2];
  element.insertBefore(refresh_button, element.children[1]);
  refresh_button.append(element.children[2]);

  return refresh_button;
}

global_refresh_button_all.addEventListener("click", async () => {
  await getMarkedItemsList();
});

global_refresh_button_all.children[0].addEventListener('mouseover', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh_all_active16.png');
  element.src = image_url;
});

global_refresh_button_all.children[0].addEventListener('mouseout', (event) => {
  let element = event.target;
  let image_url = chrome.runtime.getURL('StyleImages/refresh_all16.png');
  element.src = image_url;
});


async function getMarkedItemsList() {

  console.clear();

  await chrome.storage.sync.get("api_key", async ({ api_key }) => {
    await chrome.storage.sync.get("token", async ({ token }) => {

      console.log('API KEY:', api_key);
      console.log('TOKEN:', token);

      async function fetchRetry(url){
        delay = (timeout) => {
          return new Promise(resolve => setTimeout(resolve, timeout));
        }


        let response = await fetch(url);
        let error = false;
        if (!response.ok)
          error = true;
        let timeout = 10000;
        while (error) {
          await delay(timeout);
          response = await fetch(url);
          console.log('url:', url, 'timeout:', timeout);
          if (response.ok) error = false;
          timeout += 5000;
        } 
        return response;
      }


      user_buy_orders_url = "https://backpack.tf/api/classifieds/listings/v1?" + new URLSearchParams({
        token: token,
        intent: '0',
        inactive: '1',
      });

      currency_url = "https://backpack.tf/api/IGetCurrencies/v1?" + new URLSearchParams({
        key: api_key,
      });

      chrome.storage.local.get("marked_items", ({ marked_items }) => {
        marked_items.length = 0;
        marked_items = [[]];
        chrome.storage.local.set({ marked_items });
      });
      let response = await fetchRetry(currency_url);
      let json = await response.json()
      key_price = json.response.currencies.keys.price.value;
      console.log(key_price);

      response = await fetchRetry(user_buy_orders_url);
      json = await response.json()
      const user_buy_orders = json.listings;

      chrome.storage.local.get("marked_items", ({ marked_items }) => {
        for (let i = 0; i < Math.ceil(user_buy_orders.length / 10) - 1; i++) {
          marked_items.push([]);
        }
        chrome.storage.local.set({ marked_items });
      });

      for (let i = 0; i < user_buy_orders.length; i++) {
        let item_sku = user_buy_orders[i].item.name;
        if (item_sku == '') 
          continue;
        let page_number = Math.ceil((i + 1) / 10);
        console.log("page:", page_number, "item:", item_sku);
        buy_orders_url = "https://backpack.tf/api/classifieds/listings/snapshot?" + new URLSearchParams({
          key: api_key,
          sku: item_sku,
          appid: '440',
          token: token,
        });
        response = await fetchRetry(buy_orders_url);
        json = await response.json()
        let buy_orders = json.listings;

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


            if (compareListings(buy_order.currencies, user_buy_orders[i].currencies, key_price)) {
              chrome.storage.local.get("marked_items", ({ marked_items }) => {
                marked_items[page_number - 1].push('listing-' + user_buy_orders[i].id);
                console.log("PUSHED\npage:", page_number, "item:", item_sku);
                chrome.storage.local.set({ marked_items });
                
              });
              break;
            }
            else
            break;
          };
        };
        
      };
      console.log("ANALYZE DONE!!!!!!!!!!ANALYZE DONE!!!!!!!!!!ANALYZE DONE!!!!!!!!!!ANALYZE DONE!!!!!!!!!!");
      chrome.runtime.sendMessage("scanning done", (response) => { });
      return 0;
    });
  });

  return 1;
}