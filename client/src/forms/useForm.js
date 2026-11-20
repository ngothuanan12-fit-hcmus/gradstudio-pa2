import { useState } from 'react';

// The one shared helper behind every form of the app (forms are written by hand, no library).
// - `validate(values)` returns { field: message } with what the contract requires; it is computed, not stored.
// - Messages show only after the first try, next to each field (TextField links them with aria-describedby).
// - A 400 from the API puts its `fields` messages on the matching fields; any other error shows at the form's top.
// - What the user typed stays after an error, and the submit cannot send twice while a request is out.
export default function useForm({ initial, validate, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [tried, setTried] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const checkErrors = validate(values);
  const errors = tried ? { ...apiErrors, ...checkErrors } : {};

  function setValue(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    // A message the API gave for this field no longer applies once the user changes it.
    setApiErrors((e) => {
      const rest = { ...e };
      delete rest[name];
      return rest;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setTried(true);
    setFormError(null);
    const first = Object.keys(checkErrors)[0];
    if (first) {
      form.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setBusy(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error.status === 400 && Object.keys(error.fields || {}).length) {
        setApiErrors(error.fields);
        form.querySelector(`[name="${Object.keys(error.fields)[0]}"]`)?.focus();
      } else {
        setFormError(error.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return {
    values,
    errors,
    formError,
    busy,
    handleSubmit,
    // The submit stays focusable while busy (aria-disabled, not disabled): a disabled button would drop the keyboard
    // focus to <body> and the user would have to Tab from the top of the page. handleSubmit ignores a second press.
    submitProps: { type: 'submit', 'aria-disabled': busy ? 'true' : undefined },
    // Props for a controlled input: <TextField {...form.field('email')} />.
    field: (name) => ({
      name,
      value: values[name],
      error: errors[name],
      onChange: (e) => setValue(name, e.target.value),
    }),
  };
}
