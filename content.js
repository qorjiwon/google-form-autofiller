function matchesKeywords(itemText, question) {
  const keywords = question
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keywords.some((keyword) => itemText.includes(keyword));
}

function fillItem(item, data) {
  const type = detectType(item);
  if (!type || !handlers[type]) return;

  const itemText = item.textContent || item.innerText || "";

  for (const entry of data) {
    if (!entry.question || !entry.answer) continue;
    if (!matchesKeywords(itemText, entry.question)) continue;
    if (handlers[type](item, entry.answer)) break;
  }
}

function attemptAutofill(retryCount = 0) {
  chrome.storage.local.get(["formData", "isAutofillEnabled"], (result) => {
    const isEnabled = result.isAutofillEnabled !== false;

    if (!isEnabled || !result.formData) return;

    const listItems = document.querySelectorAll('div[role="listitem"]');

    if (listItems.length === 0) {
      if (retryCount < 5) {
        setTimeout(() => attemptAutofill(retryCount + 1), 1000);
      }
      return;
    }

    listItems.forEach((item) => fillItem(item, result.formData));
  });
}

setTimeout(() => attemptAutofill(0), 1000);
