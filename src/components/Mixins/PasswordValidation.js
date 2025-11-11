import { helpers } from 'vuelidate/lib/validators';

export default {
  methods: {
    minDigits() {
      return true;
    },
    minSpecialCharacters() {
      return true;
    },
    minUpperCaseCharacters(min) {
      return true;
    },
  },
};
