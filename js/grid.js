class Grid {
  constructor(
    targetEle,
    coo,
    currentDifficulty,
    mouseState,
    mineBombBack,
    nullSpreadBack,
    togetherBack,
    openSafeBack,
    ANDFlagList
  ) {
    this.targetEle = targetEle; // dom
    this.targetEle.GridIns = this;
    this.coo = coo; // 坐标
    this.currentDifficulty = currentDifficulty; // 当前难度数据
    this.secret = null; // 真实内容:   Number:数字1-8   null:空白    mine:地雷
    this.neighbourList = []; // 相邻格子坐标列表
    this.mouseState = mouseState; // 鼠标状态
    this.mineBombBack = mineBombBack; // 踩雷回调
    this.nullSpreadBack = nullSpreadBack; // 空白展开回调
    this.togetherBack = togetherBack; // 双按键展开回调
    this.openSafeBack = openSafeBack; // 打开安全的格子回调
    this.ANDFlagList = ANDFlagList; // 增删标记回调
    this.getNeighbourList();
    this.setUIState();
  }

  _state = "normal";
  // normal: 初始状态
  // down: 按下

  // open-null:已打开(空白)
  // open-number:已打开(数字1-8)
  // open-mine  : 已打开(地雷)
  // open-mine-bomb : 已打开(地雷炸了)

  // error-flag : 错误标记

  // normal-flag : 标记地雷(旗子)
  // normal-ques : 标记疑似(问号)

  get state() {
    return this._state;
  }
  set state(newState) {
    if (newState === "normal-flag" && this._state != "normal-flag") {
      // 标记回调
      this.ANDFlagList("add", this);
    } else if (this._state === "normal-flag" && newState !== "normal-flag") {
      // 取消标记回调
      this.ANDFlagList("del", this);
    }
    this._state = newState;
    this.setUIState();
  }
  restore = () => {
    this.state = "normal";
    this.secret = null;
    this.targetEle.style.backgroundColor = "";
    this.targetEle.innerHTML = "";
  };
  handlerMouseDown_left = () => {
    if (this.state === "normal" || this.state === "normal-ques") {
      this.state = "down";
    }
  };
  handlerMouseDown_right = () => {
    if (this.state === "normal") {
      this.state = "down";
    }
  };
  handlerMouseDown_together = () => {
    if (/^open-[0-9]/.test(this.state)) {
      // this.state = "down";
      this.togetherBack?.(this);
    }
  };
  handlerMouseUp_left = () => {
    if (this.state === "down") {
      this.handlerOpen();
      if (this.secret === "null") {
        this.nullSpreadBack(this);
      }
    }
  };
  handlerOpen = () => {
    if (this.state === "normal-flag" || /^open/.test(this.state)) {
      return;
    }

    if (this.secret === "mine") {
      this.state = `open-${this.secret}-bomb`;
      this.mineBombBack?.();
      return;
    }

    this.openSafeBack();
    this.state = `open-${this.secret}`;
  };
  handlerMouseUp_right = () => {
    if (this.state === "down") {
      this.state = "normal-flag";
    } else if (this.state === "normal-flag") {
      this.state = "normal-ques";
    } else if (this.state === "normal-ques") {
      this.state = "normal";
    }
  };

  setToErroeFlag = () => {
    // 转为标记错误状态
    this.state = "error-flag";
  };

  setToFlag = () => {
    // 转为标记状态,用于成功时
    if (/^open/.test(this.state) || this.state === "normal-flag") {
      return;
    }
    this.state = "normal-flag";
  };
  handlerMouseLeave = () => {
    if (this.state === "down") {
      this.state = "normal";
    }
  };
  handlerMouseEnter = () => {
    if (this.state === "normal" && this.mouseState.left === "down") {
      this.state = "down";
    }
  };
  setUIState = () => {
    // this.targetEle.classList.add('');
    this.targetEle.setAttribute("state", this.state);
    if (/^open-[0-9]/.test(this.state)) {
      this.targetEle.innerHTML = "";
      this.targetEle.innerHTML = `<span>${this.secret}</span>`;
    }
  };
  getNeighbourList = () => {
    let {
      coo: { x, y },
      currentDifficulty: { rowCount, rankCount },
    } = this;
    let min_x = 0,
      min_y = 0,
      max_x = rankCount - 1,
      max_y = rowCount - 1;

    let neighbourData = {
      top_center: { x, y: y - 1 },
      top_left: { x: x - 1, y: y - 1 },
      top_right: { x: x + 1, y: y - 1 },

      right_center: { x: x + 1, y },
      left_center: { x: x - 1, y },

      bottom_center: { x, y: y + 1 },
      bottom_left: { x: x - 1, y: y + 1 },
      bottom_right: { x: x + 1, y: y + 1 },
    };

    let neighbourList = [];
    for (let key in neighbourData) {
      let { x, y } = neighbourData[key];
      if (x <= max_x && x >= min_x && y <= max_y && y >= min_y) {
        neighbourList.push(neighbourData[key]);
      }
    }
    this.neighbourList = neighbourList;
  };
  // secret
  setSecret = (secret) => {
    this.secret = secret;
    return this;
  };
}
