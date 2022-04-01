<template>
  <div>
    <select-username
      v-if="!usernameAlreadySelected"
      @input="onUsernameSelection"
    />
    <div v-else-if="!resolved">Connecting...</div>
    <chat v-else />
  </div>
</template>

<script>
import SelectUsername from "./SelectUsername";
import Chat from "./Chat";
import { socket, initialize } from "../socket";
import makeApiCall from "../api_service";

export default {
  name: "Home",
  components: {
    Chat,
    SelectUsername,
  },
  data() {
    return {
      usernameAlreadySelected: false,
      resolved: false,
    };
  },
  methods: {
    async onUsernameSelection(username) {
      try {
        // register the user to server
        const signup_response = await makeApiCall({
          url: "http://localhost:81/sign_up",
          method: "POST",
          body: JSON.stringify({ username }),
        });

        if (!signup_response.status) {
          alert(signup_response.message);
          return;
        }

        this.usernameAlreadySelected = true;

        await this.connectToSocket(signup_response.user.id);

        localStorage.setItem(
          "socket_user",
          JSON.stringify(signup_response.user)
        );
      } catch (error) {
        alert(`Something went wrong! maybe your internet connection is down?`);
      }
    },

    async connectToSocket(id) {
      try {
        const url_response = await makeApiCall({
          url: "http://localhost:80",
        });

        if (!url_response.status) {
          alert(url_response.message);
          return;
        }

        // get the url from server
        initialize(url_response.host);
        socket.auth = { id };

        this.resolved = true;
      } catch (error) {
        alert(`Something went wrong! maybe your internet connection is down?`);
      }
    },
  },

  async created() {
    const user_str = localStorage.getItem("socket_user");
    if (user_str) {
      const user = JSON.parse(user_str);
      this.usernameAlreadySelected = true;
      await this.connectToSocket(user.id);
    }
  },
};
</script>

<style>
body {
  margin: 0;
}

@font-face {
  font-family: Lato;
  src: url("/fonts/Lato-Regular.ttf");
}

#app {
  font-family: Lato, Arial, sans-serif;
  font-size: 14px;
}
</style>
