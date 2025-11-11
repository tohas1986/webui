import Vue from 'vue';
import App from './App.vue';
import router from './router';

//Do not change store import.
//Exact match alias set to support
//dotenv customizations.
import store from './store';
import eventBus from './eventBus';

import {
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  BVConfigPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormDatepickerPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormTagsPlugin,
  InputGroupPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  PaginationPlugin,
  ProgressPlugin,
  TablePlugin,
  TabsPlugin,
  ToastPlugin,
  TooltipPlugin,
} from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import i18n from './i18n';
import { format } from 'date-fns-tz';

// Filters
const shortTimeZoneFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timeZoneName: 'short',
});

Vue.filter('shortTimeZone', function (value) {
  if (!(value instanceof Date)) return '';
  const parts = shortTimeZoneFormatter.formatToParts(value);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  return tzPart ? tzPart.value.replace(/^GMT/, 'UTC') : '';
});

Vue.filter('formatDate', function (value) {
  if (!(value instanceof Date)) return '';
  const isUtcDisplay = store.getters['global/isUtcDisplay'];

  const pattern = `yyyy-MM-dd`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return isUtcDisplay
    ? value.toISOString().substring(0, 10)
    : format(value, pattern, { timeZone: timezone });
});

Vue.filter('formatTime', function (value) {
  if (!(value instanceof Date)) return '';
  const isUtcDisplay = store.getters['global/isUtcDisplay'];

  if (isUtcDisplay) {
    return value.toLocaleTimeString('default', {
      timeZone: 'UTC',
      hourCycle: 'h23',
    });
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const pattern = `HH:mm:ss`;

  return format(value, pattern, { timeZone: timezone });
});

// Plugins
Vue.use(BVConfigPlugin, {
  BFormText: { textVariant: 'secondary' },
  BTable: {
    headVariant: 'light',
    footVariant: 'light',
  },
  BFormTags: {
    tagVariant: 'primary',
    addButtonVariant: 'link-primary',
  },
  BBadge: {
    variant: 'primary',
  },
});

[
  AlertPlugin,
  BadgePlugin,
  ButtonPlugin,
  BVConfigPlugin,
  CardPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormDatepickerPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormTagsPlugin,
  InputGroupPlugin,
  LayoutPlugin,
  LinkPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavbarPlugin,
  NavPlugin,
  PaginationPlugin,
  ProgressPlugin,
  TablePlugin,
  TabsPlugin,
  ToastPlugin,
  TooltipPlugin,
  Vuelidate,
].forEach((plugin) => Vue.use(plugin));

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
Vue.prototype.$eventBus = eventBus;
