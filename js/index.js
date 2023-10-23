class Minesweeper {
  constructor({
    reseauEle,
    mineCountEle,
    resetBtnEle,
    timerEle,
    difficultySelectEle,
    chartHitEle,
    chartHitShowBtnEle,
    recordBreakingEle,
    toggleBtnEle,
    shadeEle,
    messageEle,
  }) {
    this.mapping = []; // 映射坐标系
    this.reseauEle = reseauEle; // 网格
    this.mineCountEle = mineCountEle; // 地雷计数
    this.resetBtnEle = resetBtnEle; // 重设按钮
    this.chartHitEle = chartHitEle; // 排行榜
    this.recordBreakingEle = recordBreakingEle; // 破纪录弹窗
    this.chartHitShowBtnEle = chartHitShowBtnEle; // 排行榜按钮
    this.chartHit_ins = new ChartHit(this.chartHitEle, recordBreakingEle); // 排行榜控制器
    this.difficultySelectEle = difficultySelectEle; // 切换难度
    this.timing_ins = new Timing({ timeCountEle: timerEle }); // 计时器
    this.mineCount_ins = new MineCount(mineCountEle, this.flagList); // 计数器
    this.toggleBtnEle = toggleBtnEle; // 暂停/继续按钮
    this.shadeEle = shadeEle; // 暂停状态的遮罩
    this.messageTrigger_ins = new MessageTrigger(messageEle); // 消息提示
    this.mouseState = {
      left: "up",
      right: "up",
    };
    this.init();
    window.getMapping = this.getMapping;
    // this.currentDifficulty = "easy"; // 应该是可选的; 初级:easy   中级: average   高级: hard
  }
  init = () => {
    this.initDifficultySelect(); // 初始化游戏
    this.eventMouseDown = this.debounce(this.eventMouseDown, 30);
    this.addSystemLevelEventListener(); // 添加系统级事件监听
    this.createGameChessboard(); // 创建 游戏内容
  };
  getTileItem = (original) => {
    if (Number(original)) {
      return original;
    }

    switch (original) {
      case "mine":
        return "M";
      case "null":
        return 0;
    }
  };

  getMapping = () => {
    if (this.gameState === "await") {
      console.log("当前网格为空");
      return;
    }
    let tileMapping = [];

    this.mapping.forEach((rowiItem, rowIndex) => {
      tileMapping[rowIndex] = [];
      rowiItem.forEach((rankItem, rankIndex) => {
        let current = rankItem.secret;

        tileMapping[rowIndex][rankIndex] = this.getTileItem(current);
      });
    });

    return tileMapping;
  };
  addSystemLevelEventListener = () => {
    // 添加系统级事件监听
    this.resetBtnEle.addEventListener("click", this.resetReseau);
    this.chartHitShowBtnEle.addEventListener(
      "click",
      this.chartHit_ins.handlerUiShow
    );
    this.difficultySelectEle.addEventListener("change", this.difficultyChange);
    this.toggleBtnEle.addEventListener("click", this.playStateToggle);
    this.shadeEle.addEventListener("click", this.playStateToggle);
  };

  playStateToggle = () => {
    // 游戏状态:   await: 未开始   running: 进行中   die: 死亡   victory:成功
    // _gameState = "await";
    // get gameState() {
    //   return this._gameState;
    // }
    if (this.gameState === "running") {
      this.gameState = "pause";
    } else if (this.gameState === "pause") {
      this.gameState = "running";
    }
  };

  // 游戏难度管理  :  初级:easy   中级: average   高级: hard
  get currentDifficulty() {
    let isDifficulty = window.localStorage.getItem("currentDifficulty");
    if (!isDifficulty) {
      window.localStorage.setItem("currentDifficulty", "easy");
      isDifficulty = "easy";
    }
    return isDifficulty;
  }
  set currentDifficulty(newDifficulty) {
    let isDifficulty = window.localStorage.getItem("currentDifficulty");
    if (isDifficulty === newDifficulty) {
      return;
    }
    window.localStorage.setItem("currentDifficulty", newDifficulty);
    this.createGameChessboard();
  }

  difficultyIndexList = {
    // 游戏难度对应的option index
    easy: 0,
    average: 1,
    hard: 2,
  };
  initDifficultySelect = () => {
    // 初始化选择难度dom
    this.difficultySelectEle.selectedIndex =
      this.difficultyIndexList[this.currentDifficulty];
  };

  difficultyChange = (e) => {
    // 难度切换事件
    let selectValue = e.target.selectedOptions[0].value;
    this.currentDifficulty = selectValue;
  };
  createGameChessboard = () => {
    // 创建/重置 游戏
    this.deadWork();
    this.removeEventListener();
    this.addEventListener();
    this.resetReseau();
  };

  handlerStartGame = (startGrid) => {
    // 开始游戏
    this.createMineList(startGrid);
    this.wholeSynchro();
  };

  GridSize = 25; // 格子尺寸
  MineList = []; // 地雷列表
  flagList = []; // 标记列表

  // 游戏状态:   await: 未开始   running: 进行中   pause: 暂停   die: 死亡   victory:成功
  _gameState = "await";
  get gameState() {
    return this._gameState;
  }
  set gameState(newState) {
    if (newState === "die") {
      // 死亡(踩雷)
      this.timing_ins.state = "pause";
      this.setResetButtonState("die");
      this.removeEventListener();
    } else if (newState === "victory") {
      // 胜利
      this.timing_ins.state = "pause";
      this.setResetButtonState("victory");
      this.handlerVictory();
      this.removeEventListener();
      this.chartHit_ins.tryUpdateRecord(
        this.currentDifficulty,
        this.timing_ins.currentTime
      );
    } else if (newState === "await") {
      // 等待开局
      this.setResetButtonState("normal");
      this.addEventListener();
      if (this._gameState === "pause") {
        this.toggleBtnEle.innerHTML = "暂停";
        this.shadeEle.classList.remove("pause");
      }
      this.timing_ins.state = "await";
    } else if (newState === "running") {
      // 游戏进行中
      this.setResetButtonState("normal");
      this.timing_ins.state = "running";

      if (this._gameState === "pause") {
        this.toggleBtnEle.innerHTML = "暂停";
        this.shadeEle.classList.remove("pause");
      }
    } else if (newState === "pause" && this._gameState === "running") {
      // 暂停游戏
      this.timing_ins.state = "pause";
      this.toggleBtnEle.innerHTML = "继续";
      this.shadeEle.classList.add("pause");
    }
    this._gameState = newState;
  }

  setResetButtonState = (tagState) => {
    // 设置重置按钮状态
    this.resetBtnEle.setAttribute("state", tagState);
  };

  handlerVictory = () => {
    // 游戏成功
    this.MineList.forEach((itemIns) => {
      itemIns.setToFlag();
    });
  };

  mineBombBack = (actionCoo) => {
    // 踩雷回调
    this.gameState = "die";

    this.MineList.forEach((itemIns) => {
      if (itemIns.coo === actionCoo) {
        return;
      }
      if (itemIns.secret === "mine" && itemIns.state === "normal") {
        itemIns.state = "open-mine"; // 展示所有的地雷
      }
    });

    this.flagList.forEach((itemIns) => {
      if (itemIns.secret !== "mine" && itemIns.state === "normal-flag") {
        itemIns.setToErroeFlag(); // 展示所有标记错误的方格
      }
    });
  };

  togetherBack = (actionItemIns) => {
    // 双按键回调
    let { secret, neighbourList } = actionItemIns;

    if (!Number(secret)) {
      return;
    }

    let flagCount = 0;
    let isIncludeNull = null;
    neighbourList.forEach(({ x, y }) => {
      let currentItem = this.mapping[y][x];
      if (currentItem.state === "normal-flag") {
        flagCount++;
      }

      if (/^normal/.test(currentItem.state) && currentItem.secret === "null") {
        isIncludeNull = currentItem;
      }
    });
    if (flagCount === secret) {
      if (isIncludeNull) {
        this.nullSpreadBack(isIncludeNull);
      }
      neighbourList.forEach(({ x, y }) => {
        let currentItem = this.mapping[y][x];
        currentItem.handlerOpen();
      });
    }
  };

  // 打开安全格子计数
  _safeOpenedCount = 0;
  get safeOpenedCount() {
    return this._safeOpenedCount;
  }
  set safeOpenedCount(newNumber) {
    if (newNumber === this.rowCount * this.rankCount - this.mineCount) {
      this.gameState = "victory";
    }
    this._safeOpenedCount = newNumber;
  }
  openSafeBack = () => {
    // 打开安全的格子回调
    this.safeOpenedCount++;
  };

  nullSpreadBack = (actionItemIns) => {
    // 展开回调(洪水算法)

    let _this = this;
    function flood(itemIns) {
      let { neighbourList } = itemIns;

      neighbourList.forEach(({ x, y }) => {
        let i_ins = _this.mapping[y][x];
        if (i_ins.secret !== "mine") {
          if (!/^open/.test(i_ins.state)) {
            i_ins.handlerOpen();
            if (i_ins.secret === "null") {
              flood(i_ins);
            }
          }
        }
      });
    }

    flood(actionItemIns);
  };

  resetReseau = () => {
    // 重置网格
    this.mapping.forEach((rowItem) => {
      rowItem.forEach((item) => {
        item.restore();
      });
    });
    this.MineList.length = 0;
    this.flagList.length = 0;
    this.mineCount_ins.initMineCount(this.mineCount);
    this.gameState = "await";
    this._safeOpenedCount = 0;
  };

  ANDFlagList = (order, target) => {
    // 增删标记列表
    let isIncludes = this.flagList.includes(target);
    if (order === "add" && !isIncludes) {
      this.flagList.push(target);
    } else if (order === "del" && isIncludes) {
      let tagIndex = this.flagList.findIndex((i) => i === target);
      this.flagList.splice(tagIndex, 1);
    }

    this.mineCount_ins.updateCount();
  };

  createMineList = (startGrid) => {
    // 创建地雷列表
    // let MineList = [];
    let { MineList } = this;
    let mineCount = this.mineCount;
    let {
      coo: { x: start_x, y: start_y },
    } = startGrid;
    while (MineList.length !== mineCount) {
      let tag_x = Math.floor(Math.random() * this.rankCount);
      let tag_y = Math.floor(Math.random() * this.rowCount);
      let isResume = MineList.find(
        (i) => i.coo.x === tag_x && i.coo.y === tag_y
      );
      if (tag_x === start_x && tag_y === start_y) {
        continue;
      }
      if (!isResume) {
        let mineItemIns = this.mapping[tag_y][tag_x].setSecret("mine");
        MineList.push(mineItemIns);
      }
    }
  };

  wholeSynchro = () => {
    // 设置每个格子实例的secret
    for (let i = 0; i < this.mapping.length; i++) {
      for (let j = 0; j < this.mapping[i].length; j++) {
        let neighbourMineCount = 0;
        let gridIns = this.mapping[i][j];
        if (!gridIns) {
          throw new Error("wholeSynchro循环有问题");
        }

        if (gridIns.secret === "mine") continue;
        gridIns.neighbourList.forEach(({ x, y }) => {
          let currentMineItem = this.mapping[y][x];
          if (currentMineItem.secret === "mine") {
            neighbourMineCount++;
          }
        });

        gridIns.setSecret(neighbourMineCount || "null");
      }
    }
  };

  // 难度数据
  difficulty = {
    easy: {
      // 初级
      rowCount: 9, // 行数
      rankCount: 9, // 列数
      mineCount: 10, // 地雷数量
    },
    average: {
      // 中级
      rowCount: 16, // 行数
      rankCount: 16, // 列数
      mineCount: 49, // 地雷数量
    },
    hard: {
      // 高级
      rowCount: 16, // 行数
      rankCount: 30, // 列数
      mineCount: 99, // 地雷数量
    },
  };

  isListener = false;
  addEventListener = () => {
    // document.body.addEventListener('mouseleave')
    if (this.isListener) {
      return;
    }
    this.isListener = true;
    // 设置鼠标状态
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    document.addEventListener("mousedown", this.setMouseState, true);
    document.addEventListener("mouseup", this.setMouseState, true);

    // 游戏
    this.reseauEle.addEventListener("mousedown", this.eventMouseDown);
    this.reseauEle.addEventListener("mouseup", this.eventMouseUp);
    this.reseauEle.addEventListener("mouseleave", this.eventMouseLeave, true);
    this.reseauEle.addEventListener("mouseenter", this.eventMouseEnter, true);
  };
  removeEventListener = () => {
    // document.body.addEventListener('mouseleave')
    if (!this.isListener) {
      return;
    }
    // this.resetBtnEle.removeEventListener("click", this.resetReseau);
    this.isListener = false;
    // 设置鼠标状态
    document.removeEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    document.removeEventListener("mousedown", this.setMouseState, true);
    document.removeEventListener("mouseup", this.setMouseState, true);

    // 游戏
    this.reseauEle.removeEventListener("mousedown", this.eventMouseDown);
    this.reseauEle.removeEventListener("mouseup", this.eventMouseUp);
    this.reseauEle.removeEventListener(
      "mouseleave",
      this.eventMouseLeave,
      true
    );
    this.reseauEle.removeEventListener(
      "mouseenter",
      this.eventMouseEnter,
      true
    );
  };

  setMouseState = (e) => {
    // 设置鼠标状态
    if (e.type === "mousedown") {
      if (e.button === 0) {
        // 0: 左键    1:中键   2:右键
        this.mouseState.left = "down";
      } else if (e.button === 2) {
        this.mouseState.right = "down";
      }
    } else if (e.type === "mouseup") {
      if (e.button === 0) {
        // 0: 左键    1:中键   2:右键
        this.mouseState.left = "up";
      } else if (e.button === 2) {
        this.mouseState.right = "up";
      }
    }
  };

  debounce = (fun, timeCount) => {
    // 防抖函数
    let timer = null;

    return function (...params) {
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        fun(...params);
      }, timeCount);
    };
  };

  eventMouseDown = (e) => {
    // 鼠标按下
    let gridItem = e.target;
    let gridItemIns = gridItem.GridIns || gridItem.parentNode.GridIns;
    if (!gridItemIns) return;

    // TODO: 作弊键
    if (e.ctrlKey) {
      let msg = "";
      if (this.gameState !== "running") {
        msg = "请先开始游戏";
      } else if (gridItemIns.secret === "mine") {
        msg = "这个是 地雷!!";
      } else if (Number(gridItemIns.secret)) {
        msg = `这个是 数字: ${gridItemIns.secret}`;
      } else if (gridItemIns.secret === "null") {
        msg = "这个是 空白块";
      }
      this.messageTrigger_ins.handlerShowMessage(msg);
      return;
    }
    if (e.buttons === 1) {
      gridItemIns.handlerMouseDown_left();
    } else if (e.buttons === 2) {
      gridItemIns.handlerMouseDown_right();
    } else if (e.buttons === 3) {
      gridItemIns.handlerMouseDown_together();
    }
  };
  eventMouseUp = (e) => {
    // 鼠标抬起
    if (e.ctrlKey) return;
    let gridItem = e.target;

    let gridItemIns = gridItem.GridIns || gridItem.parentNode.GridIns;

    if (!gridItemIns) return;
    if (e.button === 0) {
      if (this.gameState === "await") {
        this.gameState = "running";
        this.handlerStartGame(gridItemIns);
      }
      gridItemIns.handlerMouseUp_left();
    } else if (e.button === 2) {
      gridItemIns.handlerMouseUp_right();
    }
  };
  eventMouseLeave = (e) => {
    // 鼠标移出
    let gridItem = e.target;
    let gridItemIns = gridItem.GridIns || gridItem.parentNode.GridIns;

    if (!gridItemIns) return;

    gridItemIns.handlerMouseLeave();
  };
  eventMouseEnter = (e) => {
    // 鼠标移入
    let gridItem = e.target;
    let gridItemIns = gridItem.GridIns || gridItem.parentNode.GridIns;

    if (!gridItemIns) return;
    gridItemIns.handlerMouseEnter();
  };

  deadWork = () => {
    // 准备工作
    let { rowCount, rankCount, mineCount } =
      this.difficulty[this.currentDifficulty];
    let { GridSize } = this;

    // 设置容器大小
    this.reseauEle.style.width = `${rankCount * GridSize}px`;
    this.reseauEle.style.height = `${rowCount * GridSize}px`;

    // 设置网格数据
    this.rowCount = rowCount;
    this.rankCount = rankCount;
    this.mineCount = mineCount;

    this.initReseau();
  };
  initReseau = () => {
    // 初始化网格
    this.reseauEle.innerHTML = "";
    this.mapping.length = 0;
    for (let i = 0; i < this.rowCount; i++) {
      let mappingRow = [];

      let currentRow = document.createElement("div");
      currentRow.classList.add("row");
      currentRow.style.height = `${this.GridSize}px`;
      for (let j = 0; j < this.rankCount; j++) {
        let currentItem = document.createElement("div");
        currentItem.classList.add("item");
        currentItem.style.height = `${this.GridSize}px`;
        currentItem.style.width = `${this.GridSize}px`;
        currentItem.setAttribute("loc_x", j);
        currentItem.setAttribute("loc_y", i);
        // currentItem.style.backgroundColor = `#fff`;
        currentRow.appendChild(currentItem);

        let mappingItem = new Grid(
          currentItem,
          { x: j, y: i },
          this.difficulty[this.currentDifficulty],
          this.mouseState,
          this.mineBombBack,
          this.nullSpreadBack,
          this.togetherBack,
          this.openSafeBack,
          this.ANDFlagList
        );
        mappingRow.push(mappingItem);
      }
      this.reseauEle.appendChild(currentRow);
      this.mapping.push(mappingRow);
    }
  };
}

let reseauEle = document.querySelector(".reseau");
let mineCountEle = document.querySelector(".mineCount");
let resetBtnEle = document.querySelector(".resetBtn");
let timerEle = document.querySelector(".timer");
let difficultySelectEle = document.querySelector(".difficultySelect");
let chartHitEle = document.querySelector(".chartHit");
let chartHitShowBtnEle = document.querySelector(".chartHit-show-btn");
let toggleBtnEle = document.querySelector(".toggle-btn");
let shadeEle = document.querySelector(".shade");
let recordBreakingEle = document.querySelector(".record-breaking");
let messageEle = document.querySelector(".message");
let mine_sweping_instance = new Minesweeper({
  reseauEle,
  mineCountEle,
  resetBtnEle,
  timerEle,
  difficultySelectEle,
  chartHitEle,
  chartHitShowBtnEle,
  recordBreakingEle,
  toggleBtnEle,
  shadeEle,
  messageEle,
});
