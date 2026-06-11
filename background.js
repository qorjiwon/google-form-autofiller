chrome.runtime.onInstalled.addListener(() => {
  const defaultData = [
    { question: "성함", answer: "" },
    { question: "주민등록번호", answer: "" },
    { question: "지급받을 은행명", answer: "" },
    { question: "계좌번호", answer: "" },
    { question: "연락처", answer: "" },
    { question: "이메일", answer: "" },
    { question: "실습 교육 사전 수강 여부", answer: "수강 완료" }
  ];

  chrome.storage.local.get(["formData"], (result) => {
    if (!result.formData || result.formData.length === 0) {
      chrome.storage.local.set({ formData: defaultData }, () => {
        console.log("Default form data initialized.");
      });
    }
  });
});
