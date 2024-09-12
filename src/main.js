import './assets/main.css'
import * as d3 from 'd3';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axios from 'axios'


import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css';

import Antd from 'ant-design-vue';
import "ant-design-vue/dist/reset.css";

const vuetify = createVuetify({
    components,
    directives,
})


const app = createApp(App)

axios.defaults.baseURL = "http://localhost:8000"
app.config.globalProperties.$axios = axios


app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Antd)

app.mount('#app')
