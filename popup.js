document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("list-container");
  const addBtn = document.getElementById("add-btn");
  const newQuestionInput = document.getElementById("new-question");
  const newAnswerInput = document.getElementById("new-answer");
  const autofillToggle = document.getElementById("autofill-toggle");
  const toast = document.getElementById("toast");

  let formData = [];
  let toastTimeout;

  function showToast() {
    toast.className = "toast show";
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.className = toast.className.replace("show", "");
    }, 2000);
  }

  // Load data
  chrome.storage.local.get(["formData", "isAutofillEnabled"], (result) => {
    if (result.formData) {
      formData = result.formData;
      renderList();
    }
    
    if (result.isAutofillEnabled !== undefined) {
      autofillToggle.checked = result.isAutofillEnabled;
    } else {
      autofillToggle.checked = true; // Default to true
    }
  });

  autofillToggle.addEventListener("change", (e) => {
    chrome.storage.local.set({ isAutofillEnabled: e.target.checked }, () => {
      showToast();
    });
  });

  function renderList() {
    listContainer.innerHTML = "";
    formData.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "item";

      const header = document.createElement("div");
      header.className = "item-header";

      const questionInput = document.createElement("input");
      questionInput.type = "text";
      questionInput.className = "item-question-input";
      questionInput.value = item.question;
      questionInput.placeholder = "질문 입력";
      
      questionInput.addEventListener("change", () => {
        formData[index].question = questionInput.value;
        saveData(false);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "삭제";
      deleteBtn.onclick = () => {
        formData.splice(index, 1);
        saveData();
      };

      header.appendChild(questionInput);
      header.appendChild(deleteBtn);

      const answerInput = document.createElement("input");
      answerInput.type = "text";
      answerInput.className = "item-answer";
      answerInput.value = item.answer || "";
      answerInput.placeholder = "답변을 입력하세요";
      
      // Save data on change
      answerInput.addEventListener("change", () => {
        formData[index].answer = answerInput.value;
        saveData(false); // Don't re-render to avoid losing focus
      });

      itemEl.appendChild(header);
      itemEl.appendChild(answerInput);
      listContainer.appendChild(itemEl);
    });
  }

  function saveData(reRender = true) {
    chrome.storage.local.set({ formData }, () => {
      if (reRender) renderList();
      showToast();
    });
  }

  addBtn.addEventListener("click", () => {
    const q = newQuestionInput.value.trim();
    const a = newAnswerInput.value.trim();
    if (q) {
      formData.push({ question: q, answer: a });
      newQuestionInput.value = "";
      newAnswerInput.value = "";
      saveData();
    }
  });
});
