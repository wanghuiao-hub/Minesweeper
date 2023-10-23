class Timing {
  constructor({ timeCountEle }) {
    this.timeCountEle = timeCountEle;
    this.numberItemEleList = this.timeCountEle.children;
    this.state = "await";
  }

  _state = "await"; // running : 进行中   pause : 暂停  await : 未开始
  get state() {
    return this._state;
  }
  set state(newState) {
    if (newState === "running") {
      this.startTimeout();
    } else if (newState === "pause") {
      this.pauseTimeout();
    } else if (newState === "await") {
      this.reseTimeout();
    } else {
      console.error("[Timing] 无效的状态值");
      return;
    }
    this._state = newState;
  }

  _currentTime = "000";
  get currentTime() {
    return Number(this._currentTime);
  }
  set currentTime(newTime) {
    this._currentTime =
      newTime >= 100
        ? `${newTime}`
        : newTime >= 10
        ? `0${newTime}`
        : `00${newTime}`;
    // this.timeCountEle.innerHTML = this._currentTime;
    this._currentTime.split("").forEach((item, index) => {
      this.numberItemEleList[index].setAttribute("current-number", item);
    });
    if (newTime === 999) {
      this.state = "pause";
    }
  }

  timer = null;
  startTimeout = () => {
    this.timer = setInterval(() => {
      this.currentTime = this.currentTime + 1;
    }, 1000);
  };
  pauseTimeout = () => {
    this.timer && clearInterval(this.timer);
  };
  reseTimeout = () => {
    this.pauseTimeout();
    this.currentTime = 0;
  };
}
