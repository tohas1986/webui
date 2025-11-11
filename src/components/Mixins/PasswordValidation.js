import { helpers } from 'vuelidate/lib/validators';

export default {
  methods: {
    minDigits(min) {
      return helpers.withParams({ type: 'minDigits', min }, (value) => {
        if (!value || typeof value !== 'string') return true;
        const digitsCount = (value.match(/\d/g) || []).length;
        return digitsCount >= min;
      });
    },
    minSpecialCharacters(min) {
      return helpers.withParams(
        { type: 'minSpecialCharacters', min },
        (value) => {
          if (!value || typeof value !== 'string') return true;
          const specialCharsCount = (value.match(/[^a-zA-Zа-яА-Я0-9]/g) || [])
            .length;
          return specialCharsCount >= min;
        },
      );
    },
    minUpperCaseCharacters(min) {
      return helpers.withParams(
        { type: 'minUpperCaseCharacters', min },
        (value) => {
          if (!value || typeof value !== 'string') return true;
          const upperCaseCount = (value.match(/[A-ZА-ЯЁ]/g) || []).length;
          return upperCaseCount >= min;
        },
      );
    },
  },
};
