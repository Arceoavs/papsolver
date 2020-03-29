export default {
  required: value => !!value || "Input required.",
  min: v => v.length >= 8 || "Min 8 characters.",
  email: v => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(v) || "Invalid e-mail.";
  },
  passwordMatch: (first, sec) => first === sec || "Passwords do not match"
};
