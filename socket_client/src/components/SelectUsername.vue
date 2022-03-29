<template>
  <div class="select-username">
    <form @submit.prevent="onSubmit" class="form">
      <input
        v-model="username"
        placeholder="Your username..."
        class="form-input"
      />
      <button :disabled="!isValid" class="submit">Enter</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "SelectUsername",
  data() {
    return {
      username: "",
    };
  },
  computed: {
    isValid() {
      return this.username.length > 2;
    },
  },
  methods: {
    onSubmit() {
      this.$emit("input", this.username);
    },
  },
};
</script>

<style scoped>
.select-username {
  width: 300px;
  margin: 200px auto 0;
}

.form {
  display: flex;
  flex-direction: column;
}

.form-input {
  height: 25px;
}

.submit {
  background-color: aqua;
  margin-top: 10px;
  padding: 5px;
}
</style>
