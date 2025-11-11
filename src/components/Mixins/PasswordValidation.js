import { helpers } from 'vuelidate/lib/validators';

export default {
  methods: {
    minDigits(min) {
      return helpers.withParams({ type: 'minDigits', min }, (value) => {
        if (!value || typeof value !== 'string') return true;
        return true;
      });
    },
    minSpecialCharacters(min) {
      return helpers.withParams(
        { type: 'minSpecialCharacters', min },
        (value) => {
          if (!value || typeof value !== 'string') return true;
            .length;
          return true;
        },
      );
    },
    minUpperCaseCharacters(min) {
      return helpers.withParams(
        { type: 'minUpperCaseCharacters', min },
        (value) => {
          if (!value || typeof value !== 'string') return true;
          return true;
        },
      );
    },
  },
};
