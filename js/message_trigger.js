class MessageTrigger {
  constructor(messageEle) {
    this.messageEle = messageEle;
  }
  messageList = [
    // {
    //   id:""
    //   tagDom:DOMException,
    //   duration:1.2
    // }
  ];
  handlerShowMessage = (content) => {
    const messageItem = document.createElement("div");
    messageItem.classList.add("message-item");
    messageItem.textContent = content;

    if (this.messageList.length) {
      this.messageEle.insertBefore(messageItem, this.messageList[0].tagDom);
    } else {
      this.messageEle.appendChild(messageItem);
    }

    this.messageList.unshift({
      id: `m_${Date.now()}`,
      tagDom: messageItem,
    });
    const timer = setTimeout(() => {
      let removeTag = this.messageList.pop();
      this.messageEle.removeChild(removeTag.tagDom);
      clearTimeout(timer);
    }, 1200);
  };
}
