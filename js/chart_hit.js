class RecordBreaking {
  constructor(recordBreakingEle, confirmBack) {
    this.recordBreakingEle = recordBreakingEle;
    this.confirmBack = confirmBack;
    this.init();
    this.addEventListener();
  }

  // 破纪录弹窗显隐
  get isrecordBreakingEleShow() {
    return this.recordBreakingEle.style.display === "flex";
  }
  set isrecordBreakingEleShow(newValue) {
    this.recordBreakingEle.style.display = newValue ? "flex" : "none";
    this.nameInputEle.focus();
  }

  // 当前难度
  get currentLeve() {
    return this.leveEle.innerHTML;
  }
  set currentLeve(newLeve) {
    this.leveEle.innerHTML = newLeve;
  }

  // 姓名输入框
  get nameText() {
    return this.nameInputEle.value;
  }
  set nameText(newText) {
    this.nameInputEle.value = newText;
  }
  init = () => {
    this.nameInputEle = this.recordBreakingEle.querySelector(".name-ipt"); // 姓名输入框
    this.confirmBtnEle = this.recordBreakingEle.querySelector(".confirm-btn"); // 确定按钮
    this.leveEle = this.recordBreakingEle.querySelector(".leve"); // 级别
  };
  addEventListener = () => {
    this.nameInputEle.addEventListener("input", this.nameInputEvent); // 姓名输入框
    this.confirmBtnEle.addEventListener("click", this.clickConfirmBtnEleEvent); // 确定按钮
  };

  clickConfirmBtnEleEvent = () => {
    this.confirmBack(this.nameText);
    this.handlerUiHide();
  };

  nameInputEvent = (e) => {
    this.nameText = e.target.value;
  };
  leveList = {
    easy: "初级",
    average: "中级",
    hard: "高级",
  };

  // 应该是可选的; 初级:easy   中级: average   高级: hard
  handlerUiShow = (leve) => {
    // 显示弹窗
    this.currentLeve = this.leveList[leve];
    this.nameText = "匿名";
    this.isrecordBreakingEleShow = true;
  };
  handlerUiHide = () => {
    // 隐藏弹窗
    this.isrecordBreakingEleShow = false;
    this.nameText = "";
    this.currentLeve = "";
  };
}

class ChartHit {
  constructor(chartHitEle, recordBreakingEle) {
    this.chartHitEle = chartHitEle; // 排行榜弹窗
    this.recordBreakingEle = recordBreakingEle; // 破纪录弹窗
    this.recordBreaking_ins = new RecordBreaking(
      this.recordBreakingEle,
      this.confirmBack
    );
    this.init();
    this.addEventListener();
  }

  // 排行榜弹窗显隐
  get ischartHitEleShow() {
    return this.chartHitEle.style.display === "block";
  }
  set ischartHitEleShow(newValue) {
    return (this.chartHitEle.style.display = newValue ? "block" : "none");
  }

  handlerUiShow = () => {
    if (!this.ischartHitEleShow) {
      this.ischartHitEleShow = true;
    }
  };
  handlerUiHide = () => {
    if (this.ischartHitEleShow) {
      this.ischartHitEleShow = false;
    }
  };
  chartHitData = {
    _this: this,
    // 初级记录
    get easyRecord() {
      let isEasyRecord = JSON.parse(window.localStorage.getItem("easyRecord"));
      if (!isEasyRecord) {
        isEasyRecord = { time: 999, name: "匿名" };
        // this.easyRecordEle.innerHTML = isEasyRecord.time;
        // this.easyRecordNameEle.innerHTML = isEasyRecord.name;
        window.localStorage.setItem("easyRecord", JSON.stringify(isEasyRecord));
      }

      return isEasyRecord;
    },
    set easyRecord(newRecord) {
      this._this.easyRecordEle.innerHTML = newRecord.time;
      this._this.easyRecordNameEle.innerHTML = newRecord.name;
      window.localStorage.setItem("easyRecord", JSON.stringify(newRecord));
    },
    // 中级记录
    get averageRecord() {
      let isAverageRecord = JSON.parse(
        window.localStorage.getItem("averageRecord")
      );
      if (!isAverageRecord) {
        isAverageRecord = { time: 999, name: "匿名" };
        // this.averageRecordEle.innerHTML = isAverageRecord.time;
        // this.averageRecordNameEle.innerHTML = isAverageRecord.name;
        window.localStorage.setItem(
          "averageRecord",
          JSON.stringify(isAverageRecord)
        );
      }

      return isAverageRecord;
    },
    set averageRecord(newRecord) {
      this._this.averageRecordEle.innerHTML = newRecord.time;
      this._this.averageRecordNameEle.innerHTML = newRecord.name;
      window.localStorage.setItem("averageRecord", JSON.stringify(newRecord));
    },
    // 高级记录
    get hardRecord() {
      let isHardRecord = JSON.parse(window.localStorage.getItem("hardRecord"));
      if (!isHardRecord) {
        isHardRecord = { time: 999, name: "匿名" };
        // this.hardRecordEle.innerHTML = isHardRecord.time;
        // this.hardRecordNameEle.innerHTML = isHardRecord.name;
        window.localStorage.setItem("hardRecord", JSON.stringify(isHardRecord));
      }

      return isHardRecord;
    },
    set hardRecord(newRecord) {
      this._this.hardRecordEle.innerHTML = newRecord.time;
      this._this.hardRecordNameEle.innerHTML = newRecord.name;
      window.localStorage.setItem("hardRecord", JSON.stringify(newRecord));
    },
  };
  init = () => {
    // 初始化
    //   document.querySelector
    // easy: 0,
    // average: 1,
    // hard: 2,
    this.easyRecordEle = this.chartHitEle.querySelector(
      // 初级记录容器
      ".record-easy .record-count"
    );
    this.easyRecordNameEle = this.chartHitEle.querySelector(
      // 初级记录姓名
      ".record-easy .name"
    );
    this.averageRecordEle = this.chartHitEle.querySelector(
      // 中级记录容器
      ".record-average .record-count"
    );
    this.averageRecordNameEle = this.chartHitEle.querySelector(
      // 中级记录容器
      ".record-average .name"
    );
    this.hardRecordEle = this.chartHitEle.querySelector(
      // 高级记录容器
      ".record-hard .record-count"
    );
    this.hardRecordNameEle = this.chartHitEle.querySelector(
      // 高级记录容器
      ".record-hard .name"
    );
    this.confirmBtnEle = this.chartHitEle.querySelector(
      // 确定按钮
      ".confirm-btn"
    );
    this.resetChartHitBtnEle = this.chartHitEle.querySelector(
      // 重设按钮
      ".reset-chartHit-btn"
    );
    this.synchrodata();
  };

  synchrodata = () => {
    // 同步数据
    let { easyRecord, averageRecord, hardRecord } = this.chartHitData;
    // 初级记录
    this.easyRecordEle.innerHTML = easyRecord.time;
    this.easyRecordNameEle.innerHTML = easyRecord.name;

    this.averageRecordEle.innerHTML = averageRecord.time;
    this.averageRecordNameEle.innerHTML = averageRecord.name;

    this.hardRecordEle.innerHTML = hardRecord.time;
    this.hardRecordNameEle.innerHTML = hardRecord.name;
  };

  resetData = () => {
    // 重置排行榜
    this.chartHitData.easyRecord = { time: 999, name: "匿名" };
    this.chartHitData.averageRecord = { time: 999, name: "匿名" };
    this.chartHitData.hardRecord = { time: 999, name: "匿名" };
  };

  addEventListener = () => {
    this.confirmBtnEle.addEventListener("click", this.handlerUiHide); // 隐藏排行榜
    this.resetChartHitBtnEle.addEventListener("click", this.resetData); // 重置排行榜
  };

  newRecord = null;
  tryUpdateRecord = (leve, record) => {
    let oldRecord = this.chartHitData[`${leve}Record`];

    if (record < oldRecord.time) {
      this.newRecord = { leve, time: record };
      this.recordBreaking_ins.handlerUiShow(leve);
    }
  };

  confirmBack = (nameText) => {
    let { leve, time } = this.newRecord;
    this.chartHitData[`${leve}Record`] = { time, name: nameText };
    this.synchrodata();
    this.newRecord = {};
    this.handlerUiShow();
  };
}
