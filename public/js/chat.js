// chat app
const socket = io();

// Elements
const $formMessage = document.getElementById("formMessage");
const $messageInput = document.querySelector("#messageInput");
const $sendLocation = document.querySelector(".send-location");
const $messageFormButton = document.querySelector(".messageFormButton");
const $messages = document.querySelector("#message");
const $sidebar = document.querySelector("#sidebar");
// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate = document.querySelector("#url-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// automatic scrolling
const autoScroll = () => {
  // new message
  const $newMessage = $messages.lastElementChild;
  // height of the new message
  const $newMessageStyles = getComputedStyle($newMessage);
  const $newMessageMargin = parseInt($newMessageStyles.marginBottom);
  const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;
  // visible height
  const visibleHeight = $messages.offsetHeight;
  // height of the messages container
  const contaierHeight = $messages.scrollHeight;
  // how far scrolled
  const scrollOffSet = $messages.scrollTop + visibleHeight;
  // autoscroll check
  if (contaierHeight - $newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = contaierHeight;
  }
};
// catch an event
socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  // const markup = message.includes("http")
  //   ? `<a href=${message}>${message}</a>`
  //   : message;
  // const htdml = `
  //   <div id="message">
  //     <div>
  //       <p>${markup}</p>
  //     </div>
  //   </div>
  // `;
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  // console.log(message);
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

$formMessage.addEventListener("submit", (e) => {
  e.preventDefault();
  // disable
  const message = e.target.elements.message.value;
  if (message == "") return;
  $messageFormButton.setAttribute("disabled", "disabled");
  // send an event
  socket.emit("sendMessage", message, (error) => {
    // enable
    $messageFormButton.removeAttribute("disabled");
    $messageInput.value = "";
    $messageInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("message was delivered");
  });
});

$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) return console.log(" Geolocation not supported");

  // disable
  $sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("sendLocation", { latitude, longitude }, () => {
        // enable
        $sendLocation.removeAttribute("disabled");
        console.log("Location sent");
      });
    },
    (err) => {}
  );
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// sidebar -> roomData
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  $sidebar.innerHTML = html;
});
// io() connects to the Socket.io server
// const socket = io();
// socket.on("CountUpdated", (count) => {
//   console.log("Count has been updated : ", count);
// });
// document.querySelector("#increment").addEventListener("click", () => {
//   socket.emit("increment");
// });

// get url query string data
