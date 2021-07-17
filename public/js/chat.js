////////= Omo i wan use jQuery for the first time 😊, i should have learn this when am done with JavaScript. Nevertheless, we move. REACTJS IS THERE 😄


// Things to take care of
// 1) Handle when a user is not online, i.e sending the message but mark as unread
// 2) When displaying all conversation, add a green dot to recognise online users
// 3) admin should be able to click on each conversation which will lead to displaying all the message for that conversation

const socket = io(`${location.host}`);
const $q = document.querySelector.bind(document);

const user = JSON.parse($('#user-data').attr("data"));
let onlineUsers = null;
//let otherMembers = [];
let conversations = null;
let currentConv = 0;
//let messages = null;
//console.log(JSON.stringify(user))

document.addEventListener('click', e => {
  //console.log(e.target);
  
  if (e.target.className.includes("list-group-item border-0") || e.target.className.includes("media-body") || e.target.className.includes("list-group-item-heading") || e.target.className.includes("d-flex text-muted m-0") || e.target.className.includes("show-online") || e.target.className.includes("media")) {
    // Set current conversation to the id
    currentConv = e.target.id;
    
    // Removing old message from the dom
    $(".chat").remove();
    $(".chat-left").remove();
    
    // Refetch message for that specific conversation
    fetchMessage(conversations, user);
    //console.log(e.target.id);
  }
});

// Connected user
socket.emit('sendConnectedUser', user._id);

// Send connected user to Admin
//if(user.role === "admin") {
  socket.on('getConnectedUser', (users) => {
    onlineUsers = users;
    // TEST
    //console.log(JSON.stringify(users));
    // TEST
  });
//}

// Get message from the server
socket.on("getMessage", (data) => {
  //console.log(JSON.stringify(data));
  insertSingleMessageToDOM(data, user);
});


const fetchConversation = async (user) => {
  //conversation
  try {
    // Make an http request to the api
    const res = await axios({
      method: 'GET',
      url: `/api/v1/conversation/${user._id}`});
      //console.log("conv")
      //console.log(JSON.stringify(res))
    if(res.data.conversation.length < 1) {
      // 1) Create a new conversation with the admin
      const res = await axios({
        method: 'POST',
        url: `/api/v1/conversation`,
        data: {members: [user._id, "60ce2c43732fc72480f9a4e7"]}
      });
      
      // 2) Fetch that conversation
      if(res.data.status === "success") {
        const {data} = res.data;
        conversations = data;
        //console.log("new conversation")
        //console.log(JSON.stringify(conversation))
        // Get other members
        getOtherMember(data, user)
        fetchMessage(data, user);
        //console.log(this.otherMembers);
      }
      return;
    }
    
    // if everything is ok
    if(res.data.status === "success") {
      const {conversation} = res.data;
      conversations = conversation;
      //console.log("old conversation")
      //console.log(JSON.stringify(conversation))
      // Get other members
      getOtherMember(conversation, user)
      fetchMessage(conversation, user);
      //console.log(this.otherMembers);
    }
    
  } catch (e) {
    //console.log(e);
    console.log(e.response.data.message);
  }
}
 
const showOnlineUsers = (user) => {
    let allOnlineUser = null;
    /*
    console.log("online, users")
    console.log(JSON.stringify(user))
    /*console.log(JSON.stringify(onlineUsers))*/
   user.forEach((userObject, i) => {
     //console.log(JSON.stringify(memberObject.members))
      onlineUsers.forEach((onlineUser, i) => {
        
        if(userObject._id === onlineUser.userId) {
          const oUser = [...user, {...userObject, online: true}];
          allOnlineUser = oUser;
          /*console.log("oUser")
          console.log(JSON.stringify(oUser))
          console.log(`oUser ${i}: ${userObject._id} / connected user ${i}: ${onlineUser.userId}`);*/
          return
        }
        
        allOnlineUser = user;
      })
   })
   
   //console.log(allOnlineUser)
   insertAllConversationToDOM(allOnlineUser);
}

const getOtherMember = (conv, user) => {
  let otherMembers = [];
  
  conv.forEach((el) => {
    el.members.map((id) => {
      if(id !== user._id) otherMembers.push(id)
    })
  });
  //console.log(JSON.stringify(otherMembers))
  //console.log(this.otherMembers);
  fetchMemberDetails(otherMembers);
}
 
const fetchMemberDetails = async (otherMembers) => {
  try {
    // Make an http request to the api
    const promises = otherMembers.map(async (id) => {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/users/${id}`});
      return res.data.data;
    });
    
    // Resolve all trh Promise above
    const users = await Promise.all(promises);
    // User
    //console.log(JSON.stringify(users))
    
    // Showing all online users
    showOnlineUsers(users)
  } catch (e) {
    //console.log(e);
    console.log(e.response.data.message);
  }
}


const fetchMessage = async (conversations, user) => {
  //message
  try {
    // Fetch all messages related to a conversation
    if(conversations.length > 1) {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/message/${conversations[currentConv]._id}`});
      
      const {message} = res.data;
      //messages = message;
      //console.log(JSON.stringify(message))
      insertMessageToDOM(message, user);
      
      return;
    }
    
    const res = await axios({
      method: 'GET',
      url: `/api/v1/message/${conversations[0]._id}`});
    
    const {message} = res.data;
    //messages = message;
    //console.log(JSON.stringify(message))
    insertMessageToDOM(message, user);
    //localStorage.setItem("message", JSON.stringify(message));
    
    //console.log(message);
  } catch (e) {
    //console.log(e);
    console.log(e.response.data.message);
  }
}

const insertAllConversationToDOM = (otherConversation) => {
  otherConversation.forEach((member, i) => {
    const html = `<a class="list-group-item border-0" id=${`${i}`}>
      <span class="media" id=${`${i}`}>
        <span class="avatar avatar-md avatar-online" id=${`${i}`}>
          <img class="media-object d-flex mr-3 bg-primary rounded-circle" src="/images/default.jpg" alt="User Image" height="50">
          <i></i>
        </span>
        <div class="media-body" id=${`${i}`}>
          <h6 class="list-group-item-heading">${member.firstName + " " + member.lastName}
            <span id=${`${i}`} class="p-1 text-white float-right primary">4:14 AM</span>
          </h6>
          <p class="d-flex text-muted m-0" style="justify-content: flex-start; align-items: center;" id=${`${i}`}>
            <i class="material-icons mr-1">check</i>
            <span>${member.username}</span>
          </p>
          <p class="show-online" id=${`${i}`}>
            ${member.online !== undefined && member.online === true ? "<p>online</p>" : "<span></span>" }
          </p>
        </div>
      </span>
    </a>`;
    
  $("#conversation-box").append(html);
  });
};

const insertSingleMessageToDOM = (msg, userData, isBot = false) => {
  const html = `<div class=${userData._id === msg.senderId ? "chat" : "chat-left"}>
    <div class="chat-avatar">
      <a class="avatar">
        <img src=${ userData.role !== "admin" && !isBot ? 'https://robohash.org/'+ user.username +'?set=set3' : "/images/chatbot.png"} class="rounded-circle" width="50" alt="avatar">
       </a>
    </div>
    <div class="chat-body">
      <div class="chat-content">
        <p>${msg.message}</p>
        <i>${!isBot ? moment(new Date()).fromNow(): ''}</i>
      </div>
    </div>
  </div>`;
  
  $("#chats-container").append(html);
  Array.from(document.querySelectorAll('.chat-avatar')).pop().scrollIntoView({ behavior: 'smooth' });
};

const insertMessageToDOM = (messages, userData) => {
  const chatHeader = `
    <div class="chat chat-left">
      <div class="chat-avatar">
        <a class="avatar">
          <img src="/images/chatbot.png" class="rounded-circle" width="50" alt="avatar">
        </a>
      </div>
      <div class="chat-body">
        <div class="chat-content">
          <p>Hi, ${user.firstName}! I'm Fifi, your virtual support. How may I assist you today?<br><br>
            <button class="btn btn-primary chat-cue">Make A Donation</button>
            <button class="btn btn-primary chat-cue">View Donations</button>
            <button class="btn btn-primary chat-cue">Customer Support</button>
          </p>
        </div>
      </div>
    </div>
  `;
  
  $("#chats-container").append(chatHeader);
  
  messages.forEach((msg) => {
    const html = `<div class=${userData._id === msg.senderId ? "chat" : "chat-left"}>
      <div class="chat-avatar">
        <a class="avatar">
          <img src=${ userData.role !== "admin" ? 'https://robohash.org/'+ user.username +'?set=set3' : "/images/chatbot.png"} class="rounded-circle" width="50" alt="avatar">
         </a>
      </div>
      <div class="chat-body">
        <div class="chat-content">
          <p>${msg.message}</p>
          <i>${moment(msg.createdAt).fromNow()}</i>
        </div>
      </div>
    </div>`;
    
  $("#chats-container").append(html);
  });
};

$("#send-message").on("click", async(e) => {
  // Get the receiverId
  const receiverId = conversations.map((el) => {
    return el.members.find((id) => id !== user._id);
  });
  //console.log("receiverId")
  //console.log(receiverId)
  const userMessage = $('#message-box').val().trim() || $('#hidden-input').val().trim();

  // Prevent empty messages from being sent
  if (!/\S/.test(userMessage)) return;
  
  socket.emit("sendMessage", {
    senderId: user._id,
    receiverId: (receiverId.length > 1 ? receiverId[currentConv] : receiverId[0]),
    message: userMessage
  });
  
  try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/message`,
        data:{
          senderId: user._id,
          conversationId: `${conversations.length > 1 ? conversations[currentConv]._id : conversations[0]._id}`,
          message: userMessage
        }
      });
      //console.log(JSON.stringify(res))
      const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
      $('#hidden-input').val('');

      // Initiate bot response
      initiateBotResponse(userMessage);
    } catch (e) {
      console.log(e.response.data.message);
    }
  
  /*socket.on("userNotOnline", async ({senderId, message}) => {
    try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/message`,
        data:{
          senderId,
          conversationId: `${conversations.length > 1 ? conversations[currentConv]._id : conversations[0]._id}`,
          message,
          unread: true
        }
      });
      //console.log(JSON.stringify(res))
      const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
    } catch (e) {
      console.log(e.response.data.message);
    }
    //return;
  })*/
  
  /*socket.on("getMessage", async (data) => {
    try {
      const res = await axios({
        method: 'POST',
        url: `/api/v1/message`,
        data:{
          senderId: user._id,
          conversationId: `${conversations.length > 1 ? conversations[currentConv]._id : conversations[0]._id}`,
          message: userMessage
        }
      });
      //console.log(JSON.stringify(res))
      console.log(res);
      // const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
    } catch (e) {
      console.log(e.response.data.message);
    }
  });*/
});

// Send message when user clicks on any chat cue button
$q('body').addEventListener('click', e => {
  if (e.target.matches('.chat-cue')) {
    e.target.setAttribute('disabled', 'disabled');
    $q('#hidden-input').value = e.target.innerText;

    $('#send-message').click();
  }
})

// Send message when 'Enter' key is pressed
$q('body').addEventListener('keydown', e => {
  if (e.key === 'Enter' ) $('#send-message').click();
})

fetchConversation(user);

const initiateBotResponse = userMessage => {
  // My idea: For those four initial options the "bot" shows the user, create replies for them.
  // I made them to be sent as messages
  // Then admins can answer the other enquiries

  // Another idea: Let's try to reach out to an online admin from the BE instead. It's more safe & ideal.
  // Then, if no admin could be reached, the bot will now send a message to the user that no admin is online at the moment
  const messageData = {
    senderId: (() => {
      const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
      return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16));
    })()
  }

  setTimeout(() => {
    switch (userMessage.toUpperCase()) {
      case 'MAKE A DONATION':
        // Send a message back to the donor
        // It doesn't get saved though
        messageData.message = `To make a donation, click on "Donation" in the sidebar to go to the Donations page. You can then click on the <b>"New Donation"</b> for food donations or <b>"New Monetary Donation"</b> to donate cash. Hope this helps 🙂.`;
        insertSingleMessageToDOM(messageData, user, true);

        break;
      case 'VIEW DONATIONS':
        messageData.message = `Click on "Donation" in the sidebar to go to the Donations page. You will then see two tables where you can view your <b>Food Donations</b> & <b>Monetary Donations</b> respectively`;
        insertSingleMessageToDOM(messageData, user, true);

        break;
      case 'CUSTOMER SUPPORT':
        // messageData.message = `Unfortunately, this feature isn't available yet 🥺. You can still reach out to us through the live chat for any enquiry you might have 🙂.`;
        messageData.message = 'Contacting customer care...'
        insertSingleMessageToDOM(messageData, user, true);

        // Trying contacting an online admin
        setTimeout(() => {
          messageData.message = `Couldn't contact customer care at the moment 🥺. Please try again later.`;
          insertSingleMessageToDOM(messageData, user, true);
        }, 2e3);
        break;
    }
  }, 2e3);
}

class Chat {
  constructor(socket) {
    this.user = JSON.parse($('#user-data').attr("data"));
    this.otherMembers = [];
    this.currentConv = 0;
    this.socket = socket;
    this.fetchConversation();
    //this.fetchMessage();
  }
  
  socketIO() {
    this.socket.emit('sendConnectedUser', this.user._id);
    
    if(this.user._id === "admin") {
      socket.on('getConnectedUser', (users) => {
        // TEST
        console.log("admin seeing online user");
        console.log(JSON.stringify(users));
        // TEST
      });
    }
  }
  
  async fetchConversation() {
    //conversation
    try {
      console.log("enter 2")
      // Make an http request to the api
      const res = await axios({
        method: 'GET',
        url: `/api/v1/conversation/${this.user._id}`});
      
      // if everything is ok
      if(res.data.status === "success") {
        const {conversation} = res.data;
        
        // Get other members
        this.getOtherMember(conversation)
        //console.log(this.otherMembers);
      }
      
    } catch (e) {
      //console.log(e);
      console.log(e.response.data.message);
    }
  }
  
  async getOtherMember (conv) {
    conv.forEach((el) => {
      el.members.map((id) => {
        if(id !== user._id) this.otherMembers.push(id)
      })
    });
    //console.log(this.otherMembers);
    this.fetchMemberDetails();
  }
  
  async fetchMemberDetails () {
    try {
      console.log("enter")
      // Make an http request to the api
      const promises = this.otherMembers.map(async (id) => {
        const res = await axios({
          method: 'GET',
          url: `/api/v1/users/${id}`});
        return res.data.data;
      });
      
      // Resolve all trh Promise above
      const users = await Promise.all(promises);
      // User
      console.log(JSON.stringify(users))
    } catch (e) {
      //console.log(e);
      console.log(e.response.data.message);
    }
  }
}

//new Chat(socket).socketIO();
