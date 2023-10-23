class MineCount {
  // 地雷计数
  constructor(mineCountEle, flagList) {
    this.mineCountEle = mineCountEle;
    this.numberItemEleList = this.mineCountEle.children;
    this.flagList = flagList;
  }
  toteCount = 0;

  initMineCount = (toteCount) => {
    this.toteCount = toteCount;
    this.currentCoanMine = toteCount;
  };

  _currentCoanMine = "000";
  get currentCoanMine() {
    return Number(this._currentCoanMine);
  }
  set currentCoanMine(newCount) {
    let newCountNum = Number(newCount);
    if (newCountNum || newCountNum === 0) {
      if (newCountNum >= 0) {
        this._currentCoanMine =
          newCount >= 100
            ? `${newCount}`
            : newCount >= 10
            ? `0${newCount}`
            : `00${newCount}`;
      } else {
        let absCount = Math.abs(newCount);
        let _currentCoanMine =
          absCount >= 100
            ? `${absCount}`
            : absCount >= 10
            ? `0${absCount}`
            : `00${absCount}`;
        this._currentCoanMine = `-${_currentCoanMine.slice(-2)}`;
      }
      this._currentCoanMine.split("").forEach((item, index) => {
        this.numberItemEleList[index].setAttribute("current-number", item);
      });
      // this.mineCountEle.innerHTML = this._currentCoanMine;
    }
  }
  updateCount = () => {
    let currentFlagCount = this.flagList.length;
    this.currentCoanMine = this.toteCount - currentFlagCount;
  };
}
