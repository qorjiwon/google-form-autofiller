function attemptAutofill(retryCount = 0) {
  chrome.storage.local.get(["formData", "isAutofillEnabled"], (result) => {
    // Default to true if not set
    const isEnabled = result.isAutofillEnabled !== false; 
    
    if (!isEnabled || !result.formData) return;
    
    const data = result.formData;
    const listItems = document.querySelectorAll('div[role="listitem"]');
    
    if (listItems.length === 0) {
      // Form elements might not be loaded yet
      if (retryCount < 5) {
        setTimeout(() => attemptAutofill(retryCount + 1), 1000);
      }
      return;
    }

    listItems.forEach(item => {
      const itemText = item.textContent || item.innerText;
      
      for (const entry of data) {
        if (!entry.question || !entry.answer) continue;

        if (itemText.includes(entry.question)) {
          // 1. Text/Email/Number Inputs and Textareas
          const textInput = item.querySelector('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])');
          const textArea = item.querySelector('textarea');
          const field = textInput || textArea;
          
          if (field) {
            field.focus();
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
            
            if (field.tagName === 'INPUT' && nativeInputValueSetter) {
                nativeInputValueSetter.call(field, entry.answer);
            } else if (field.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
                nativeTextAreaValueSetter.call(field, entry.answer);
            } else {
                field.value = entry.answer;
            }

            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.blur();
          }

          // 2. Radio Buttons (객관식 질문 - 단일 선택)
          const radios = item.querySelectorAll('div[role="radio"]');
          if (radios.length > 0) {
            radios.forEach(radio => {
              const value = radio.getAttribute('data-value') || radio.innerText.trim();
              if (value === entry.answer) {
                // 이미 체크되어 있지 않다면 클릭
                if (radio.getAttribute('aria-checked') !== 'true') {
                  radio.click();
                }
              }
            });
          }

          // 3. Checkboxes (체크박스 - 다중 선택 가능)
          const checkboxes = item.querySelectorAll('div[role="checkbox"]');
          if (checkboxes.length > 0) {
            // 답변이 "사과, 포도" 와 같이 쉼표로 구분된 경우 배열로 분리
            const answers = entry.answer.split(',').map(s => s.trim());
            
            checkboxes.forEach(checkbox => {
              const value = checkbox.getAttribute('data-value') || checkbox.innerText.trim();
              const isChecked = checkbox.getAttribute('aria-checked') === 'true';
              const shouldBeChecked = answers.includes(value);
              
              if (shouldBeChecked && !isChecked) {
                checkbox.click();
              } else if (!shouldBeChecked && isChecked) {
                checkbox.click();
              }
            });
          }
          
        }
      }
    });
  });
}

// Automatically attempt to fill when the page loads
setTimeout(() => attemptAutofill(0), 1000);
