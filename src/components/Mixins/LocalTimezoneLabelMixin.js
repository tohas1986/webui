import { format } from 'date-fns-tz';

const LocalTimezoneLabelMixin = {
  methods: {
    localOffset(isUtcDisplay = false) {
      if (isUtcDisplay) {
        return 'UTC';
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const [region, cityKey] = timezone.split('/');

      const translationPath = `timezones.${region}.${cityKey}`;
      const translatedCity = this.$t(translationPath);

      const fallbackCity = cityKey.replace('_', ' ');
      const finalCity =
        translatedCity === translationPath ? fallbackCity : translatedCity;

      const rawOffset = format(new Date(), 'xxx', { timeZone: timezone });
      const hoursOnly = rawOffset.split(':')[0];
      const offsetNumber = parseInt(hoursOnly, 10);
      const formattedOffset = `UTC${offsetNumber >= 0 ? '+' : ''}${offsetNumber}`;

      return `${finalCity}, ${formattedOffset}`;
    },
  },
};

export default LocalTimezoneLabelMixin;
