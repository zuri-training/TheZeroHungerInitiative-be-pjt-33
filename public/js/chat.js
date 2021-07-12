////////= Omo i wan use jQuery for the first time 😊, i should have learn this when am done with JavaScript. Nevertheless, we move. REACTJS IS THERE 😄


// Things to take care of
// 1) Handle when a user is not online, i.e sending the message but mark as unread
// 2) When displaying all conversation, add a green dot to recognise online users
// 3) admin should be able to click on each conversation which will lead to displaying all the message for that conversation

//const socket = io("http://localhost:5000");
const socket = io(`${location.host}`);

const user = JSON.parse($('#user-data').attr("data"));
//let otherMembers = [];
let conversations = null;
let currentConv = 3
//let messages = null;

// Connected user
socket.emit('sendConnectedUser', user._id);

// Send connected user to Admin
if(user.role === "admin") {
  socket.on('getConnectedUser', (users) => {
    // TEST
    alert(JSON.stringify(users));
    // TEST
  });
}

// Get message from the server
socket.on("getMessage", (data) => {
  //alert(JSON.stringify(data));
  insertSingleMessageToDOM(data, user);
});

const fetchConversation = async (user) => {
  //conversation
  try {
    // Make an http request to the api
    const res = await axios({
      method: 'GET',
      url: `/api/v1/conversation/${user._id}`});
      
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
        //alert("new conversation")
        //alert(JSON.stringify(conversation))
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
      //alert("old conversation")
      //alert(JSON.stringify(conversation))
      // Get other members
      getOtherMember(conversation, user)
      fetchMessage(conversation, user);
      //console.log(this.otherMembers);
    }
    
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
  }
}
 
const getOtherMember = (conv, user) => {
  let otherMembers = [];
  
  conv.forEach((el) => {
    el.members.map((id) => {
      if(id !== user._id) otherMembers.push(id)
    })
  });
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
    //alert(JSON.stringify(users))
    insertAllConversationToDOM(users)
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
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
      //alert(JSON.stringify(message))
      insertMessageToDOM(message, user);
      
      return;
    }
    
    const res = await axios({
      method: 'GET',
      url: `/api/v1/message/${conversations[0]._id}`});
    
    const {message} = res.data;
    //messages = message;
    //alert(JSON.stringify(message))
    insertMessageToDOM(message, user);
    //localStorage.setItem("message", JSON.stringify(message));
    
    //console.log(message);
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
  }
}

const t = () => {
  /*document.addEventListener('DOMContentLoaded', (event) => {
    alert("loaded");
    const arr = Array.from(document.querySelectorAll(".list-group-item"));
    alert(JSON.stringify(arr));
  });*/
  
  
  /*$(".list-group-item").on("click", (e) => {
    alert(JSON.stringify($(this)))
  })*/
  //alert(JSON.stringify(conv))
}

const insertAllConversationToDOM = (otherConversation) => {
  otherConversation.forEach((member) => {
    const html = `<a class="list-group-item border-0">
      <span class="media">
        <span class="avatar avatar-md avatar-online">
          <img class="media-object d-flex mr-3 bg-primary rounded-circle" src="/images/default.jpg" alt="User Image" height="50">
          <i></i>
        </span>
        <div class="media-body">
          <h6 class="list-group-item-heading">${member.firstName + " " + member.lastName}
            <span class="p-1 text-white float-right primary">4:14 AM</span>
          </h6>
          <p class="d-flex text-muted m-0" style="justify-content: flex-start; align-items: center;">
            <i class="material-icons mr-1">check</i>
            <span>${member.username}</span>
          </p>
        </div>
      </span>
    </a>`;
    
  $("#conversation-box").append(html);
  });
};

const insertSingleMessageToDOM = (msg, userData) => {
  const html = `<div class=${userData._id === msg.senderId ? "chat" : "chat-left"}>
    <div class="chat-avatar">
      <a class="avatar">
        <img src=${ userData.role !== "admin" ? "/images/default.jpg" : "/images/chatbot.png"} class="rounded-circle" width="50" alt="avatar">
       </a>
    </div>
    <div class="chat-body">
      <div class="chat-content">
        <p>${msg.message}</p>
        <p>${moment(new Date()).fromNow()}</p>
      </div>
    </div>
  </div>`;
  
  $("#chats-container").append(html);
};

const insertMessageToDOM = (messages, userData) => {
  messages.forEach((msg) => {
    const html = `<div class=${userData._id === msg.senderId ? "chat" : "chat-left"}>
      <div class="chat-avatar">
        <a class="avatar">
          <img src=${ userData.role !== "admin" ? "/images/default.jpg" : "/images/chatbot.png"} class="rounded-circle" width="50" alt="avatar">
         </a>
      </div>
      <div class="chat-body">
        <div class="chat-content">
          <p>${msg.message}</p>
          <p>${moment(msg.createdAt).fromNow()}</p>
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
  //alert("receiverId")
  //alert(receiverId)
  const userMessage = $("#message-box").val();
  
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
      //alert(JSON.stringify(res))
      const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
    } catch (e) {
      alert(e.response.data.message);
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
      //alert(JSON.stringify(res))
      const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
    } catch (e) {
      alert(e.response.data.message);
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
      //alert(JSON.stringify(res))
      const {data} = res.data;
      
      // Insert new message to DOM
      insertSingleMessageToDOM(data, user);
      
      // Clear user input
      $("#message-box").val("");
    } catch (e) {
      alert(e.response.data.message);
    }
  });*/
});

fetchConversation(user);

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
        alert("admin seeing online user");
        alert(JSON.stringify(users));
        // TEST
      });
    }
  }
  
  async fetchConversation() {
    //conversation
    try {
      alert("enter 2")
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
      alert(e.response.data.message);
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
      alert("enter")
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
      alert(JSON.stringify(users))
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
    }
  }
}

//new Chat(socket).socketIO();
