////////= Omo i wan use jQuery for the first time 😊, i should have learn this when am done with JavaScript. Nevertheless, we move. REACTJS IS THERE 😄

const socket = io("http://localhost:5000");

const user = JSON.parse($('#user-data').attr("data"));
let otherMembers = [];
let conversations = null;
//let messages = null;

// Connected user
socket.emit('sendConnectedUser', user._id);

// Send connected user to Admin
if(user._id === "admin") {
  socket.on('getConnectedUser', (users) => {
    // TEST
    alert("admin seeing online user");
    alert(JSON.stringify(users));
    // TEST
  });
}

const fetchConversation = async (user) => {
  //conversation
  try {
    // Make an http request to the api
    const res = await axios({
      method: 'GET',
      url: `/api/v1/conversation/${user._id}`});
    
    // if everything is ok
    if(res.data.status === "success") {
      const {conversation} = res.data;
      conversations = conversation;
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
  conv.forEach((el) => {
    el.members.map((id) => {
      if(id !== user._id) otherMembers.push(id)
    })
  });
  //console.log(this.otherMembers);
  fetchMemberDetails();
}
 
const fetchMemberDetails = async () => {
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
    alert(JSON.stringify(users))
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
  }
}


const fetchMessage = async (conversations, user) => {
  //message
  try {
    alert("fetchMessage")
    // Fetch all messages related to a conversation
    if(conversations.length > 1) {
      const promises = conversations.map(async (conversation) => {
        const res = await axios({
          method: 'GET',
          url: `/api/v1/message/${conversation._id}`});
          
        return res.data.message;
      });
      
      // Resolve all the Promise above
      const message = await Promise.all(promises);
      messages = message;
      alert(JSON.stringify(message))
      //localStorage.setItem("message", JSON.stringify(message));
      
      return;
    }
    
    const res = await axios({
      method: 'GET',
      url: `/api/v1/message/${conversations[0]._id}`});
    
    const {message} = res.data;
    //messages = message;
    alert(JSON.stringify(message))
    insertMessageToDOM(message, user);
    //localStorage.setItem("message", JSON.stringify(message));
    
    //console.log(message);
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
  }
}

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
  
  const userMessage = $("#message-box").val();
  
  socket.emit("sendMessage", {
    senderId: user._id,
    receiverId: (receiverId.length > 1 ? receiverId[this.currentConv] : receiverId[0]),
    message: userMessage
  });
});

const sendMessage = async () => {
  e.preventDefault();
  //Get conversation from localStorage
  const conversation =  JSON.parse(localStorage.getItem("conversation"));
  
  // Get the receiverId
  const receiverId = conversation.map((el) => {
    return el.members.find((id) => id !== user._id);
  });
  console.log(receiverId);
  
  // Get user input message
  const {message} = this.sendDetails();
  
  // Emitting the sendMessage event
  this.socket.emit("sendMessage", {
    senderId: user._id,
    receiverId: (receiverId.length > 1 ? receiverId[this.currentConv] : receiverId[0]),
    message
  });
  
  // clear the text box
  //this.messageField.value = "";
  
  //this.insertToDOM({message, senderId:user._id});
  
  //const d = {createdAt: new Date(), message, senderId: user._id};
  //this.insertToDOM(d)
   
  
  try {
    console.log("bf");
    // Make an http request to the api
    const res = await axios({
      method: 'POST',
      url: `${this.url}/message`,
      data: {
        senderId: user._id,
        conversationId: `${conversation.length > 1 ? conversation[this.currentConv]._id : conversation[0]._id}`,
        message
      },
      headers: { 'Authorization': `Bearer ${token}`}
    });
    alert("af");
    const {message} = res.data;
    alert(message);
    this.insertToDOM(message);
    
  } catch (e) {
    //console.log(e);
    alert(e.response.data.message);
  }
}

fetchConversation(user);


/*
$('.logout').on('click', async function () {
  await axios({ url: '/api/v1/users/logout' }).then(() => (window.location.href = '/'));
});
*/

/*
class Chat {
  constructor(url, socket) {
    this.url = url;
    this.otherMembers = [];
    this.currentConv = 0;
    this.socket = socket;
    this.fetchConversation();
    this.fetchMessage();
    this.initDOMElement();
  }
  
  socketIO() {
    this.socket.emit('sendConnectedUser', user._id);
    this.socket.on('getConnectedUser', (users) => {
      console.log(users);
    });
    this.socket.on("getMessage", (data) => {
      alert(JSON.stringify(data));
      this.insertToDOM(data);
    });
  }
  
  async fetchConversation() {
    alert(JSON.stringify(user));
    //conversation
    try {
      // Make an http request to the api
      const res = await axios({
        method: 'GET',
        url: `${this.url}/conversation/${user._id}`,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // if everything is ok
      if(res.data.status === "success") {
        const {conversation} = res.data;
        //console.log(conversation);
        
        localStorage.setItem("conversation", JSON.stringify(conversation));
        
        // Get other members
        this.getOtherMember(conversation)
        //console.log(this.otherMembers);
      }
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
    }
  }
  
  async fetchMessage() {
    const conversation =  JSON.parse(localStorage.getItem("conversation"));
    
    //message
    try {
      // Fetch all messages related to a conversation
      if(conversation.length > 1) {
        const promises = conversation.map(async (conversation) => {
          const res = await axios({
            method: 'GET',
            url: `${this.url}/message/${conversation._id}`,
            headers: { 'Authorization': `Bearer ${token}`}
          });
          return res.data.message;
        })
        
        // Resolve all the Promise above
        const message = await Promise.all(promises);
        localStorage.setItem("message", JSON.stringify(message));
        this.insertMessageToDOM(message[this.currentConv]);
      
      return;
      }
      
      const res = await axios({
        method: 'GET',
        url: `${this.url}/message/${conversation[0]._id}`,
        headers: { 'Authorization': `Bearer ${token}`}
      });
      
      const {message} = res.data;
      localStorage.setItem("message", JSON.stringify(message));
      this.insertMessageToDOM(message);
      
      //console.log(message);
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
    }
  }
  
  insertMessageToDOM(messages) {
    messages.forEach((el) => {
      const html = `<div class=${user._id === el.senderId ? "owner" : "not"}><p><b>${el.message}</b></p><p>${el.createdAt}</p></div>`;
      this.messageBody.insertAdjacentHTML("beforeend", html);
    });
  }
  getOtherMember(conv) {
    conv.forEach((el) => {
      el.members.map((id) => {
        if(id !== user._id) this.otherMembers.push(id)
      })
    });
    //console.log(this.otherMembers);
    this.fetchMemberDetails();
  }
  
  async fetchMemberDetails() {
    try {
      // Make an http request to the api
      const promises = this.otherMembers.map(async (id) => {
        const res = await axios({
          method: 'GET',
          url: `${this.url}/users/${id}`,
          headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.data.data;
      })
      
      // Resolve all trh Promise above
      const users = await Promise.all(promises);
      
      // Insert the user into the dom
      this.insertConversationToDOM(users);
      //console.log(users);
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
    }
  }
  
  insertConversationToDOM(users) {
    users.forEach((el) => {
      const html = `<div><p><b>${el.firstName} ${el.lastName}</b></p><p>${el.email}</p></div>`;
      this.conversationBody.insertAdjacentHTML("beforeend", html);
    });
  }
  
  initDOMElement() {
    this.sendButton = document.querySelector(".submit");
    this.messageBody = document.querySelector(".message");
    this.conversationBody = document.querySelector(".conversation");
    this.messageField =  document.querySelector(".input");
    
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    // Login button
    this.sendButton.addEventListener("click", (e) => this.sendHandler(e));
  }
  
  sendDetails() {
    const message = document.querySelector(".input").value;
    
    return {message};
  }
  
  insertToDOM(data) {
    const {message, senderId} = data;
    
    const html = `<div class=${user._id === senderId ? "owner" : "not"}><p><b>${message}</b></p><p>${senderId}</p></div>`;
      
    this.messageBody.insertAdjacentHTML("beforeend", html);
  }
  
  async sendHandler(e) {
    e.preventDefault();
    //Get conversation from localStorage
    const conversation =  JSON.parse(localStorage.getItem("conversation"));
    
    // Get the receiverId
    const receiverId = conversation.map((el) => {
      return el.members.find((id) => id !== user._id);
    });
    console.log(receiverId);
    
    // Get user input message
    const {message} = this.sendDetails();
    
    // Emitting the sendMessage event
    this.socket.emit("sendMessage", {
      senderId: user._id,
      receiverId: (receiverId.length > 1 ? receiverId[this.currentConv] : receiverId[0]),
      message
    });
    
    // clear the text box
    //this.messageField.value = "";
    
    //this.insertToDOM({message, senderId:user._id});
    
    //const d = {createdAt: new Date(), message, senderId: user._id};
    //this.insertToDOM(d)
     
    
    try {
      console.log("bf");
      // Make an http request to the api
      const res = await axios({
        method: 'POST',
        url: `${this.url}/message`,
        data: {
          senderId: user._id,
          conversationId: `${conversation.length > 1 ? conversation[this.currentConv]._id : conversation[0]._id}`,
          message
        },
        headers: { 'Authorization': `Bearer ${token}`}
      });
      alert("af");
      const {message} = res.data;
      alert(message);
      this.insertToDOM(message);
      
    } catch (e) {
      //console.log(e);
      alert(e.response.data.message);
    }
  }
}
*/
//new Chat(devUrl, socket).socketIO();



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
