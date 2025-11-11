export default {
  methods: {
    getModifiedFields(form, originalForm, alwaysInclude = []) {
      const changed = {};

      for (const key in form) {
        const isAlwaysIncluded = alwaysInclude.includes(key);
        const isChanged =
          JSON.stringify(form[key]) !== JSON.stringify(originalForm[key]);

        if (isAlwaysIncluded || isChanged) {
          changed[key] = form[key];
        }
      }

      return changed;
    },
  },
};
