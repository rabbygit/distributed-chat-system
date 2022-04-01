<template>
  <div>
    <div>
      <div class="left-panel">
        <router-link to="/group">Group Chat</router-link>
        <user
          v-for="user in users"
          :key="user.id"
          :user="user"
          :selected="selectedUser === user"
          @select="onSelectUser(user)"
        />
      </div>
      <message-panel
        v-if="selectedUser"
        :user="selectedUser"
        @input="onMessage"
        class="right-panel"
      />
    </div>
  </div>
</template>

<script>
import { socket } from "../socket";
import User from "./User";
import MessagePanel from "./MessagePanel";
import makeApiCall from "../api_service";

export default {
  name: "Chat",
  components: {
    User,
    MessagePanel,
  },
  data() {
    return {
      selectedUser: null,
      users: [],
      user: JSON.parse(localStorage.getItem("socket_user")),
    };
  },
  methods: {
    onMessage(content) {
      if (this.selectedUser) {
        socket.emit("private message", {
          content,
          to: this.selectedUser.id,
        });
        this.selectedUser.messages.push({
          content,
          fromSelf: true,
        });
      }
    },

    onSelectUser(user) {
      console.log("user selected", user);
      this.selectedUser = user;
      user.hasNewMessages = false;
    },

    async getUsers() {
      try {
        const { users } = await makeApiCall({
          url: "http://localhost:81/users",
        });

        users.forEach((user) => {
          user.self = user.id === this.user.id;
          this.initReactiveProperties(user);
        });

        // put the current user first, and sort by username
        this.users = users.sort((a, b) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        });
      } catch (error) {
        console.error(error);
      }
    },

    initReactiveProperties(user) {
      user.connected = true;
      user.messages = [];
      user.hasNewMessages = false;
    },
  },

  created() {
    this.getUsers();

    socket.on("connect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    socket.on("disconnect", () => {
      this.users.forEach((user) => {
        if (user.self) {
          user.connected = false;
        }
      });
    });

    socket.on("user connected", (user) => {
      this.initReactiveProperties(user);
      this.users.push(user);
    });

    socket.on("user disconnected", (id) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.id === id) {
          user.connected = false;
          break;
        }
      }
    });

    socket.on("private message", ({ content, from }) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.id === from) {
          user.messages.push({
            content,
            fromSelf: false,
          });
          if (user !== this.selectedUser) {
            user.hasNewMessages = true;
          }
          break;
        }
      }
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
</style>
