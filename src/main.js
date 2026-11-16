import Vue from 'vue';
import VueKonva from 'vue-konva';
import VueMagpie from 'magpie-base';
import App from './App.vue';
import timing from './timing';
import magpieConfig from './magpie.config.js';

Vue.config.productionTip = false;

// Load Konva components
Vue.use(VueKonva, { prefix: 'Canvas' });

// Load magpie components
Vue.use(VueMagpie, magpieConfig);
Vue.mixin(timing);

// start app
new Vue({
  render: (h) => h(App)
}).$mount('#app');
