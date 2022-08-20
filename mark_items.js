let marked_items = ['listing-440_76561198116396341_fff74787ecf7f26cc1215b0f2a7058b9', 'listing-440_76561198116396341_70af5a088a0b19351cd8fce1519cd7d9', 'listing-440_76561198116396341_5bbb34aa1ec2f554613f97e98f6e84e7', 'listing-440_76561198116396341_ec4814690f8fc97eaf02ed7ed8214ec4', 'listing-440_76561198116396341_6192028491fd16974567202cc9914a10', 'listing-440_76561198116396341_46d39436aaa0a90e70d86df632c9fecf', 'listing-440_76561198116396341_d7e73de0ad992b2b32d298ad22928a73', 'listing-440_76561198116396341_b83fa5a1f8c4028d97f92cba97427284', 'listing-440_76561198116396341_f75ec7c290fe5e154d94b13b15c4ebe4', 'listing-440_76561198116396341_aac4d4787f2b14a0e2cc7de4cf43cc90']
console.log("in mark_items.js");
      for(let marked_item of marked_items){
        let listing = document.getElementById(marked_item);
        if(listing.children[0].id != "BackpackTF_Marked_Listing"){
          let inject = document.createElement("div");
          inject.style.backgroundColor = 'red';
          inject.style.height = "75px";
          inject.style.width = "87px";
          inject.id = "BackpackTF_Marked_Listing";
          listing.insertBefore(inject, listing.children[0]);
          inject.append(listing.children[1]);
          inject.children[0].style.margin = "5px 5px";
          console.log(inject.children[0]);
        }
      }