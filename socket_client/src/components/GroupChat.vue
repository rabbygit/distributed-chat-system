<template>
  <div>
    <div>
      <div class="left-panel"></div>
      <div class="right-panel">
        <div class="header">
          <h4>System Design</h4>
        </div>

        <ul class="messages">
          <li v-for="(message, index) in messages" :key="index" class="message">
            {{ message.content }}
          </li>
        </ul>

        <form @submit.prevent="onSubmit" class="form">
          <textarea
            v-model="input"
            placeholder="Your message..."
            class="input"
          />
          <button :disabled="!isValid" class="send-button">Send</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { socket } from "../socket";

export default {
  name: "GroupChat",
  components: {},
  data() {
    return {
      input: "",
      messages: [],
    };
  },
  computed: {
    isValid() {
      return this.input.length > 0;
    },
  },
  methods: {
    onSubmit() {
      socket.emit("group message", {
        content: this.input,
      });
      this.input = "";
    },
  },
  created() {
    socket.on("group message", ({ content }) => {
      this.messages.push({
        content,
      });
    });
  },
  destroyed() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("users");
    socket.off("user connected");
    socket.off("user disconnected");
    socket.off("private message");
  },
};
</script>

<style scoped>
.left-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  overflow-x: hidden;
  background-color: #3f0e40;
  color: white;
}

.right-panel {
  margin-left: 260px;
}

.header {
  line-height: 40px;
  padding: 10px 20px;
  border-bottom: 1px solid #dddddd;
}

.messages {
  margin: 0;
  padding: 20px;
}

.message {
  list-style: none;
}

.sender {
  font-weight: bold;
  margin-top: 5px;
}

.form {
  padding: 10px;
}

.input {
  width: 80%;
  resize: none;
  padding: 10px;
  line-height: 1.5;
  border-radius: 5px;
  border: 1px solid #000;
}

.send-button {
  vertical-align: top;
}
</style>
