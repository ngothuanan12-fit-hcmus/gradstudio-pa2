import { useRef, useState } from 'react';

// The one shared helper behind every form of the app (forms are written by hand, no library).
// - `validate(values)` returns { field: message } with what the contract requires; it is computed, not stored.
// - Messages show only after the first try, next to each field (TextField links them with aria-describedby).
// - An API error with `fields` (a 400) puts its messages on the matching fields; any other error shows at the top.
// - What the user typed stays after an error, and the submit cannot send twice while a request is out.
export default function useForm({ initial, validate, onSubmit }) {
  const [values, setValues] = useState(initial);
  const [tried, setTried] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);
  // `busy` in state shows on screen; this ref is the guard. Two submits in the same tick both read the old state, so
  // the guard must change at once, not on the next render (a review found two requests from two quick submits).
  const sending = useRef(false);

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
    if (sending.current) return;
    const form = event.currentTarget;
    setTried(true);
    setFormError(null);
    const first = Object.keys(checkErrors)[0];
    if (first) {
      form.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      await onSubmit(values);
    } catch (error) {
      // A 400 from the API carries `fields`; a screen may also put a 409's message on its field (an e-mail in use).
      if (Object.keys(error.fields || {}).length) {
        setApiErrors(error.fields);
        form.querySelector(`[name="${Object.keys(error.fields)[0]}"]`)?.focus();
      } else {
        setFormError(error.message);
      }
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  return {
    values,
    errors,
    formError,
    busy,
    handleSubmit,
    setValue,
    // Back to the first values with no messages, for a form that stays on screen after sending (a chat box).
    reset: () => {
      setValues(initial);
      setTried(false);
      setApiErrors({});
      setFormError(null);
    },
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
