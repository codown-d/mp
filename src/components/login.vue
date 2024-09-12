<template>
  <h1>登录页面</h1><br><br>
  用户名：<input type="text" v-model="username"> <br>
  密码：<input type="password" v-model="password"> <br>
  <button @click="submit">登录</button> <br>
  <router-link to="/register">注册</router-link>
</template>

<script>
export default{
  data() {
    return {
      username: "",
      password: ""
    }
  },
  methods: {
    submit() {
      this.$axios.post('/userapi/login/',
          {"username": this.username, "password": this.password})
          .then((response) => {
            alert(response.data.msg)
          })
    }
  }
}
</script>
