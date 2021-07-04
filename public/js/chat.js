const socket = io("http://localhost:5000");
const devUrl = "http://localhost:5000/api/v1";
const prodUrl = "https://zero-hunger-initiative.herokuapp.com/api/v1";
//const qrcode = new Decoder();
//https://res.cloudinary.com/masterd/image/upload/v1624524785/ymbe275ulm5ebye3lnl4.png

//const message =  JSON.parse(localStorage.getItem("message"));
const token =  localStorage.getItem("token");
const user =  JSON.parse(localStorage.getItem("user"));
    
    
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

new Chat(devUrl, socket).socketIO();