function getOptionValue(el) {
  return el.getAttribute("data-value") || el.innerText.trim();
}

function detectType(item) {
  if (item.querySelector('div[role="checkbox"]')) return "checkbox";
  if (item.querySelector('div[role="radio"]')) return "radio";
  if (item.querySelector("textarea")) return "text";
  if (item.querySelector('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])')) {
    return "text";
  }
  return null;
}

function setFieldValue(field, value) {
  const inputSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  const textAreaSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (field.tagName === "INPUT" && inputSetter) {
    inputSetter.call(field, value);
  } else if (field.tagName === "TEXTAREA" && textAreaSetter) {
    textAreaSetter.call(field, value);
  } else {
    field.value = value;
  }

  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

const handlers = {
  text(item, answer) {
    const field =
      item.querySelector("textarea") ||
      item.querySelector(
        'input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])'
      );
    if (!field) return false;

    field.focus();
    setFieldValue(field, answer);
    field.blur();
    return true;
  },

  radio(item, answer) {
    const radios = item.querySelectorAll('div[role="radio"]');
    for (const radio of radios) {
      if (getOptionValue(radio) !== answer) continue;
      if (radio.getAttribute("aria-checked") !== "true") {
        radio.click();
      }
      return true;
    }
    return false;
  },

  checkbox(item, answer) {
    const checkboxes = item.querySelectorAll('div[role="checkbox"]');
    if (checkboxes.length === 0) return false;

    const answers = answer.split(",").map((s) => s.trim());

    checkboxes.forEach((checkbox) => {
      const value = getOptionValue(checkbox);
      const isChecked = checkbox.getAttribute("aria-checked") === "true";
      const shouldBeChecked = answers.includes(value);

      if (shouldBeChecked !== isChecked) {
        checkbox.click();
      }
    });

    return true;
  },
};
