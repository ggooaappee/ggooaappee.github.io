(() => {
  "use strict";

  const STORAGE_KEY = "leyun-card-profile-v3";
  const defaultProfile = {
    name: "张三",
    studentId: "2025010101",
    college: "示例学院",
    major: "示例专业",
    className: "示例班级",
    recharge: "100.00",
    subsidy: "0.00",
    notice: "关于办理“大学生信用卡”的介绍",
    avatar: "",
  };

  const editConfigs = {
    identity: {
      title: "修改个人信息",
      fields: [
        { key: "name", label: "姓名", type: "text", maxlength: 20 },
        { key: "studentId", label: "学号", type: "text", maxlength: 30 },
      ],
    },
    newUser: {
      title: "添加新用户",
      fields: [
        { key: "name", label: "姓名", type: "text", maxlength: 20 },
        { key: "studentId", label: "学工号码", type: "text", maxlength: 30 },
        { key: "college", label: "学院", type: "text", maxlength: 40 },
        { key: "major", label: "专业", type: "text", maxlength: 40 },
        { key: "className", label: "班级", type: "text", maxlength: 40 },
      ],
    },
    school: {
      title: "修改学院、专业和班级",
      fields: [
        { key: "college", label: "学院", type: "text", maxlength: 40 },
        { key: "major", label: "专业", type: "text", maxlength: 40 },
        { key: "className", label: "班级", type: "text", maxlength: 40 },
      ],
    },
    balance: {
      title: "修改余额",
      fields: [
        { key: "recharge", label: "充值余额", type: "number", min: "0", step: "0.01" },
        { key: "subsidy", label: "补助余额", type: "number", min: "0", step: "0.01" },
      ],
    },
  };

  const featureKeys = {
    教育优惠商城: "education",
    扫一扫: "scan",
    付款码: "paycode",
    刷脸设置: "face",
    交易明细: "transactions",
    账单缴费查询: "bills",
    智能水电缴费: "utilities",
    OA申请: "oa",
    固定座位时长: "attendance",
    综测成绩: "syn",
    校车查询: "bus",
    成绩查询: "scores",
    帮助: "help",
    校园商圈: "campus",
    "金融消费者权益保护": "bulletin",
  };

  const myFeatureKeys = {
    常用地址: "address",
    修改支付密码: "password",
    忘记支付密码: "forgotPassword",
    卡片挂失: "lostCard",
    帮助中心: "help",
    切换账号: "accounts",
    解绑当前账号: "unbind",
    切换主题: "theme",
  };

  const elements = {
    appShell: document.querySelector(".app-shell"),
    appContent: document.querySelector(".app-content"),
    pages: [...document.querySelectorAll(".page")],
    navItems: [...document.querySelectorAll(".nav-item")],
    name: document.querySelector("#nameButton"),
    studentId: document.querySelector("#studentNumber"),
    schoolText: document.querySelector("#schoolText"),
    recharge: document.querySelector("#rechargeBalance"),
    subsidy: document.querySelector("#subsidyBalance"),
    notice: document.querySelector("#noticeText"),
    messageTitle: document.querySelector("#messageTitle"),
    avatar: document.querySelector("#avatarImage"),
    profileAvatar: document.querySelector("#profileAvatar"),
    profileAvatarButton: document.querySelector("#profileAvatarButton"),
    profileIdentityButton: document.querySelector("#profileIdentityButton"),
    profileName: document.querySelector("#profileName"),
    profileNumber: document.querySelector("#profileNumber"),
    nameButton: document.querySelector("#nameButton"),
    accountToggle: document.querySelector("#accountToggle"),
    accountOverlay: document.querySelector("#accountOverlay"),
    accountPanelName: document.querySelector("#accountPanelName"),
    accountPanelSchool: document.querySelector("#accountPanelSchool"),
    accountPanelNumber: document.querySelector("#accountPanelNumber"),
    accountPanelDepartment: document.querySelector("#accountPanelDepartment"),
    accountReturn: document.querySelector("#accountReturn"),
    accountAdd: document.querySelector("#accountAdd"),
    schoolButton: document.querySelector("#schoolButton"),
    balanceButton: document.querySelector("#balanceButton"),
    noticeButton: document.querySelector("#noticeButton"),
    avatarButton: document.querySelector("#avatarButton"),
    avatarInput: document.querySelector("#avatarInput"),
    editProfileButton: document.querySelector("#editProfileButton"),
    featureItems: [...document.querySelectorAll(".feature-item")],
    messageTabs: [...document.querySelectorAll(".message-tab")],
    messageTypeButton: document.querySelector("#messageTypeButton"),
    messageTypeValue: document.querySelector("#messageTypeValue"),
    messageItem: document.querySelector("#creditCardMessage"),
    messageReadLabel: document.querySelector("#messageReadLabel"),
    messageEmpty: document.querySelector("#messageEmpty"),
    myDemoButtons: [...document.querySelectorAll("[data-my-demo]")],
    featurePage: document.querySelector("#featurePage"),
    featureContent: document.querySelector("#featureContent"),
    detailBack: document.querySelector("#detailBack"),
    backdrop: document.querySelector("#sheetBackdrop"),
    sheet: document.querySelector(".edit-sheet"),
    sheetTitle: document.querySelector("#sheetTitle"),
    sheetClose: document.querySelector("#sheetClose"),
    editForm: document.querySelector("#editForm"),
    formFields: document.querySelector("#formFields"),
    toast: document.querySelector("#toast"),
  };

  let profile = loadProfile();
  let activeEdit = "";
  let lastFocusedElement = null;
  let toastTimer = 0;
  let activeMessageFilter = "all";
  let activeMessageType = "all";
  let messageRead = false;
  let currentPageId = "homePage";
  let currentFeature = "";
  let featureReturnPage = "homePage";
  let paymentTimer = 0;
  let paymentSeconds = 59;
  let scanStream = null;
  let scanTimer = 0;
  let accountCloseTimer = 0;

  function loadProfile() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...defaultProfile, ...stored };
    } catch {
      return { ...defaultProfile };
    }
  }

  function saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      showToast("本地存储空间不足，头像可能无法保存");
    }
  }

  function normalizedMoney(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) && number >= 0 ? number.toFixed(2) : "0.00";
  }

  function renderProfile() {
    elements.name.textContent = profile.name || "未填写";
    elements.studentId.textContent = profile.studentId || "";
    elements.schoolText.textContent = [profile.college, profile.major, profile.className]
      .filter(Boolean)
      .join("/");
    elements.recharge.textContent = normalizedMoney(profile.recharge);
    elements.subsidy.textContent = normalizedMoney(profile.subsidy);
    elements.notice.textContent = profile.notice || defaultProfile.notice;
    elements.messageTitle.textContent = profile.notice || defaultProfile.notice;
    elements.profileName.textContent = profile.name || "未填写";
    elements.profileNumber.textContent = profile.studentId || "";
    elements.accountPanelName.textContent = profile.name || "未填写";
    elements.accountPanelSchool.textContent = "仰恩大学";
    elements.accountPanelNumber.textContent = profile.studentId || "";
    elements.accountPanelDepartment.textContent = fullDepartment();

    const avatarSource = profile.avatar || "assets/avatar.svg";
    elements.avatar.src = avatarSource;
    elements.profileAvatar.src = avatarSource;
    updateSchoolMarquee();
  }

  function updateSchoolMarquee() {
    requestAnimationFrame(() => {
      elements.schoolButton.classList.add("is-scrolling");
    });
  }

  function switchPage(pageId) {
    cleanupFeature();
    closeAccountPanel();
    currentPageId = pageId;
    currentFeature = "";
    elements.appShell.classList.remove("detail-mode");
    elements.pages.forEach((page) => {
      page.classList.toggle("active", page.id === pageId);
    });
    elements.navItems.forEach((item) => {
      const isActive = item.dataset.page === pageId;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-current", isActive ? "page" : "false");
    });
    elements.appContent.scrollTop = 0;
  }

  function renderMessages() {
    const statusMatches =
      activeMessageFilter === "all" ||
      (activeMessageFilter === "unread" && !messageRead) ||
      (activeMessageFilter === "read" && messageRead);
    const typeMatches =
      activeMessageType === "all" || activeMessageType === "announcement";
    const visible = statusMatches && typeMatches;
    elements.messageItem.hidden = !visible;
    elements.messageEmpty.hidden = visible;
    elements.messageItem.classList.toggle("unread", !messageRead);
    elements.messageItem.classList.toggle("read", messageRead);
    elements.messageReadLabel.textContent = messageRead ? "已读" : "未读";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function fullDepartment() {
    return [profile.college, profile.major, profile.className].filter(Boolean).join("/");
  }

  function currentMonthText() {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  }

  function formatDateTime(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    ].join(" ");
  }

  function createTransactionSamples() {
    const now = Date.now();
    return Array.from({ length: 4 }, (_, index) => {
      const minutesAgo = 17 + index * 137 + Math.floor(Math.random() * 45);
      const randomDigits = Array.from({ length: 18 }, () =>
        Math.floor(Math.random() * 10),
      ).join("");
      return {
        title: "余额支付 , 系统付款码",
        kind: "消费",
        amount: "1.00 元",
        time: formatDateTime(new Date(now - minutesAgo * 60 * 1000)),
        order: `D${randomDigits}`,
        summary: "校车消费",
      };
    });
  }

  function featureTemplate(key) {
    const safeName = escapeHtml(profile.name || "未填写");
    const safeNumber = escapeHtml(profile.studentId || "");
    const safeDepartment = escapeHtml(fullDepartment());
    const avatar = escapeHtml(profile.avatar || "assets/avatar.svg");

    if (key === "paycode") {
      return `
        <div class="pay-page detail-screen">
          <div class="pay-school">仰恩大学</div>
          <section class="pay-code-card">
            <div class="pay-code-inner">
              <div class="qr-frame">
                <span class="qr-corner qr-corner-tl"></span>
                <span class="qr-corner qr-corner-tr"></span>
                <span class="qr-corner qr-corner-bl"></span>
                <span class="qr-corner qr-corner-br"></span>
                <div class="qr-output" id="qrOutput" aria-label="付款二维码"></div>
              </div>
            </div>
          </section>
          <div class="pay-code-number" id="payCodeNumber">45511****</div>
          <button class="pay-code-refresh" id="payRefreshButton" type="button">
            <span class="pay-refresh-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.5 8.5V4m0 0h-4.5M19.5 4l-3.2 3.2a7 7 0 1 0 1.7 7.1"></path>
              </svg>
            </span>
            <span class="pay-countdown" id="payCountdown">付款码59秒后失效</span>
          </button>
          <div class="pay-tips">
            <strong>仅可当面消费使用</strong>
            <span>请调高手机亮度后扫码</span>
          </div>
            <div class="pay-success" id="paySuccess">获取付款码<br>成功</div>
        </div>`;
    }

    if (key === "transactions") {
      const rows = createTransactionSamples()
        .map(
          (item) => `
            <article class="transaction-item">
              <div class="transaction-head"><span>${escapeHtml(item.title)}</span><span>${escapeHtml(item.kind)}</span></div>
              <div class="transaction-fields">
                <div class="transaction-field"><span>金额</span><span>${escapeHtml(item.amount)}</span></div>
                <div class="transaction-field"><span>入账时间</span><span>${escapeHtml(item.time)}</span></div>
                <div class="transaction-field"><span>单号</span><span>${escapeHtml(item.order)}</span></div>
                <div class="transaction-field"><span>摘要</span><span>${escapeHtml(item.summary)}</span></div>
              </div>
            </article>`,
        )
        .join("");
      return `
        <div class="transaction-page detail-screen">
          <div class="transaction-toolbar">
            <button class="transaction-chip active" type="button">全部</button>
            <button class="transaction-chip" type="button">充值</button>
            <button class="transaction-chip" type="button">补助</button>
            <button class="transaction-chip" type="button">更多 ▾</button>
          </div>
          <div class="transaction-month">${currentMonthText()}</div>
          <div>${rows}</div>
        </div>`;
    }

    if (key === "bills") {
      return `
        <div class="detail-screen">
          <img class="detail-hero" src="assets/bill-hero.png" alt="缴费">
          <div class="bill-actions">
            <button type="button" data-detail-toast="缴费记录查询">缴费记录查询</button>
            <button type="button" data-detail-toast="缴费汇总查询">缴费汇总查询</button>
          </div>
        </div>`;
    }

    if (key === "utilities") {
      return `
        <div class="detail-screen">
          <img class="detail-hero" src="assets/bill-hero.png" alt="水电费缴纳">
          <form class="utility-form" id="utilityForm">
            <div class="utility-row">
              <label for="utilityBuilding">楼栋:</label>
              <select id="utilityBuilding" required>
                <option value="" selected disabled>请选择楼栋</option>
                <option>第一教学楼</option>
                <option>第二教学楼</option>
                <option>学生公寓1栋</option>
                <option>学生公寓2栋</option>
              </select>
            </div>
            <div class="utility-row">
              <label for="utilityFloor">楼层:</label>
              <select id="utilityFloor" required>
                <option value="" selected disabled>请选择楼层</option>
                <option>1层</option><option>2层</option><option>3层</option><option>4层</option><option>5层</option>
              </select>
            </div>
            <div class="utility-row">
              <label for="utilityRoom">房间:</label>
              <input id="utilityRoom" type="text" placeholder="请选择房间" autocomplete="off" required>
            </div>
          </form>
          <button class="utility-confirm" id="utilityConfirm" type="button" disabled>确认</button>
          <div class="utility-tip">温馨提示：<br>请选择楼栋、楼层、房间后缴费</div>
        </div>`;
    }

    if (key === "oa") {
      const topIcons = [
        ["OA申请", "M4 5a2 2 0 0 1 2-2h12v16H4z", true],
        ["已发起", "M4 4h16v16H4zM8 9h8M8 13h6", false],
        ["待处理", "M5 3h14v18H5zM8 8h8M8 12h8", false],
        ["已处理", "M4 4h16v16H4zM8 12l2 2 5-5", false],
        ["已接收", "M4 4h16v16H4zM8 12l2 2 5-5", false],
      ];
      const sideIcons = [
        ["设备外借", "M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"],
        ["场地预约", "M4 9 12 3l8 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"],
        ["法学院场地预约", "M4 9 12 3l8 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"],
        ["荣誉申请", "M6 3h12v5l-6 4-6-4zM7 15h10v6H7z"],
      ];
      return `
        <div class="detail-screen">
          <div class="oa-tabs">
            ${topIcons
              .map(
                ([label, path, active], index) => `
                <button class="oa-tab ${active ? "active" : ""}" type="button" data-detail-toast="${label}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>
                  <span>${label}</span>
                </button>`,
              )
              .join("")}
          </div>
          <div class="oa-actions">
            ${sideIcons
              .map(
                ([label, path]) => `
                <button class="oa-action" type="button" data-detail-toast="${label}">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>
                  <span>${label}</span>
                </button>`,
              )
              .join("")}
          </div>
          <div class="oa-hint">长按图标可添加至主页面菜单</div>
        </div>`;
    }

    if (key === "attendance") {
      return `
        <div class="attendance-page detail-screen">
          <div class="attendance-profile">
            <img src="${avatar}" alt="">
            <div class="attendance-copy">
              <div class="attendance-name-row"><span>${safeName}</span><span>班次信息：</span></div>
              <div class="attendance-dep">${safeDepartment}</div>
            </div>
          </div>
          <div class="calendar-card">
            <div class="calendar-head" id="calendarHead"></div>
            <div class="calendar-grid" id="calendarGrid"></div>
          </div>
        </div>`;
    }

    if (key === "syn") {
      return `<div class="detail-screen"><div class="empty-detail">暂无综测成绩</div></div>`;
    }

    if (key === "bus") {
      return `
        <div class="bus-page detail-screen">
          <div class="bus-search"><input type="search" placeholder="搜索路线" aria-label="搜索路线"></div>
          <div class="bus-title">附近公交</div>
          <button class="bus-route" type="button" data-detail-toast="旧区--新区">旧区--新区</button>
          <button class="bus-route" type="button" data-detail-toast="新区--旧区">新区--旧区</button>
        </div>`;
    }

    if (key === "scores") {
      return `
        <div class="score-page detail-screen">
          <div class="score-profile">
            <img src="${avatar}" alt="">
            <div class="score-profile-copy">
              <strong>${safeName} ${safeNumber}</strong>
              <span>仰恩大学</span>
            </div>
          </div>
          <table class="score-table">
            <thead><tr><th>课程</th><th>分数</th><th>备注</th></tr></thead>
            <tbody><tr><td class="empty-row" colspan="3">暂无数据</td></tr></tbody>
          </table>
        </div>`;
    }

    if (key === "help") {
      return `
        <div class="help-page detail-screen">
          <section class="help-section">
            <h2><strong>01</strong> / 绑定信息不正确?</h2>
            <div class="help-qa">
              <p>Q：绑定提示输入信息不正确<br>A：输入的内容是否与一卡通预留的信息一致，如不一致或新信息不全需要到一卡通中心更正、补全信息。</p>
              <p>Q：收不到验证短信<br>A：输入的手机号码是否正确，也有可能遇到网络延迟短信需要等待一段时间才到达，遇到这情况可以重试。</p>
              <p>Q：手机号码更换怎么办<br>A：手机号码更换前先解绑，然后用新手机号码进行绑定。如果没有解绑就更换手机号码了，需要到一卡通中心修改预留的手机号码，然后登录APP会提示进行重新绑定。</p>
            </div>
          </section>
          <section class="help-section">
            <h2><strong>02</strong> / 充值</h2>
            <div class="help-qa">
              <p>Q：充值后一卡通的余额没有增加<br>A：可能因网络原因没有收到银行的充值成功信息，可隔日查询下，如果还没有到账请到一卡通中心处理。</p>
              <p>Q：充值后，在POS机上用卡查询余额没有增加<br>A：请检查POS网络是否正常，必须是联机的POS机才会更新余额。</p>
            </div>
          </section>
          <section class="help-section">
            <h2><strong>03</strong> / 查询</h2>
            <div class="help-qa">
              <p>Q：POS机消费后在APP里查询不到消费记录<br>A：刷卡消费，APP查询会延迟一段时间；用APP的账户消费可以实时查询。</p>
            </div>
          </section>
        </div>`;
    }

    if (key === "face") {
      return `
        <div class="face-page detail-screen">
          <div class="face-profile">
            <img src="${avatar}" alt="">
            <div class="face-profile-copy"><span>${safeName}</span><span>仰恩大学</span></div>
          </div>
          <div class="face-photo"><img src="${avatar}" alt="人脸照片"></div>
          <button class="face-delete" type="button" data-detail-toast="已删除人脸照片">删除</button>
          <div class="face-tip-card">
            <h3>温馨提示</h3>
            <p>1、人脸照用于刷脸消费与门禁。</p>
            <p>2、手机拍摄本人免冠、未美颜的正面真人照（拍摄真人，不要翻拍照片）。</p>
            <p>3、在自拍截取人像时，脸部在截取框中心，框中人脸占比不小于二分之一（请确保照片方向非倒立）。</p>
            <p>4、若刷脸时提示二次验证，请输入 <strong>2745</strong>（请勿泄露于他人）</p>
          </div>
        </div>`;
    }

    if (key === "education") {
      return `
        <div class="edu-page detail-screen">
          <div class="edu-header">
            <h1>教育优惠商城</h1>
            <p>学生专属教育优惠服务</p>
          </div>
          <div class="edu-items">
            <button class="edu-item" type="button" data-detail-toast="数码教育优惠"><span><strong>数码教育优惠</strong><span>学习设备专属价格</span></span><em>查看 ›</em></button>
            <button class="edu-item" type="button" data-detail-toast="软件教育优惠"><span><strong>软件教育优惠</strong><span>学习软件优惠套餐</span></span><em>查看 ›</em></button>
            <button class="edu-item" type="button" data-detail-toast="校园生活优惠"><span><strong>校园生活优惠</strong><span>校园周边生活服务</span></span><em>查看 ›</em></button>
          </div>
        </div>`;
    }

    if (key === "scan") {
      return `
        <div class="scan-page detail-screen">
          <div class="scan-viewfinder" id="scanViewfinder"><span class="scan-line"></span></div>
          <div class="scan-note" id="scanNote">将二维码放入框内</div>
          <button class="scan-button" id="scanButton" type="button">打开相机</button>
        </div>`;
    }

    if (key === "campus") {
      return `
        <div class="edu-page detail-screen">
          <div class="edu-header"><h1>校园商圈</h1><p>校园周边商户与生活服务</p></div>
          <div class="edu-items">
            <button class="edu-item" type="button" data-detail-toast="餐饮美食"><span><strong>餐饮美食</strong><span>校园周边餐厅</span></span><em>›</em></button>
            <button class="edu-item" type="button" data-detail-toast="生活服务"><span><strong>生活服务</strong><span>便利生活服务</span></span><em>›</em></button>
            <button class="edu-item" type="button" data-detail-toast="校园活动"><span><strong>校园活动</strong><span>最新校园优惠</span></span><em>›</em></button>
          </div>
        </div>`;
    }

    if (key === "bulletin") {
      return `
        <article class="article-page detail-screen">
          <h1>3·15金融消费者权益保护 ——致大学生的风险提示函</h1>
          <div class="article-meta">2023-03-20 · 校园卡服务中心</div>
          <div class="article-body">
            <p>为增强在校大学生的金融风险防范意识，提醒同学们理性消费、保护个人信息，谨防非法借贷、电信诈骗和虚假兼职等风险。</p>
            <p>请妥善保管身份证、银行卡以及支付验证码，不要向陌生人透露个人金融信息。</p>
            <p>如遇可疑金融活动，请及时向学校相关部门或公安机关咨询核实。</p>
          </div>
        </article>`;
    }

    if (key === "creditNotice") {
      return `
        <article class="article-page detail-screen">
          <h1>关于办理“大学生信用卡”的介绍</h1>
          <div class="article-meta">2023-03-20 · 校园卡服务中心 · 公告</div>
          <div class="article-body">
            <p>大学生信用卡是面向在校大学生发行的金融支付产品。办理前请结合自身实际消费能力与还款能力，理性选择。</p>
            <p>请通过银行官方渠道了解申请条件、授信额度、年费政策、还款方式及逾期影响，切勿通过陌生链接提交身份证、银行卡等个人信息。</p>
            <p>如对相关业务有疑问，可前往校园卡服务中心或银行营业网点咨询。</p>
          </div>
        </article>`;
    }

    if (key === "address") {
      return `
        <div class="form-detail detail-screen">
          <form class="form-card" data-static-form="地址信息已保存">
            <h1>常用地址</h1>
            <label>联系人<input name="contact" value="${safeName}" autocomplete="off"></label>
            <label>手机号码<input name="phone" inputmode="tel" placeholder="请输入手机号码" autocomplete="off"></label>
            <label>详细地址<textarea name="address" rows="3" placeholder="请输入详细地址"></textarea></label>
            <button type="submit">保存</button>
          </form>
        </div>`;
    }

    if (key === "password" || key === "forgotPassword") {
      const title = key === "password" ? "修改支付密码" : "忘记支付密码";
      return `
        <div class="form-detail detail-screen">
          <form class="form-card" data-static-form="${title}提交成功">
            <h1>${title}</h1>
            <label>学号<input value="${safeNumber}" readonly></label>
            <label>手机号码<input inputmode="tel" placeholder="请输入预留手机号码" autocomplete="off"></label>
            <label>验证码<input inputmode="numeric" placeholder="请输入验证码" autocomplete="off"></label>
            <button type="submit">下一步</button>
          </form>
        </div>`;
    }

    if (key === "lostCard") {
      return `
        <div class="detail-screen">
          <div class="warning-card">
            <h1>卡片挂失</h1>
            <p>挂失后当前校园卡将立即停止使用。补卡前无法恢复原卡消费功能。</p>
            <button type="button" data-detail-toast="卡片挂失申请已提交">确认挂失</button>
          </div>
        </div>`;
    }

    if (key === "accounts") {
      return `
        <div class="detail-screen">
          <div class="warning-card">
            <h1>切换账号</h1>
            <p>当前账号：${safeName} · ${safeNumber}</p>
            <p>演示版保留当前账号资料。</p>
            <button type="button" data-detail-toast="当前已是登录账号">切换其他账号</button>
          </div>
        </div>`;
    }

    if (key === "unbind") {
      return `
        <div class="detail-screen">
          <div class="warning-card">
            <h1>解绑当前账号</h1>
            <p>解绑后需要重新通过身份验证绑定校园卡信息。</p>
            <button type="button" data-detail-toast="演示模式不会解绑当前账号">确认解绑</button>
          </div>
        </div>`;
    }

    if (key === "theme") {
      return `
        <div class="detail-screen">
          <div class="theme-list">
            <button class="theme-card active" type="button" data-detail-toast="当前主题：绿色主题"><span>绿色主题</span><span>✓</span></button>
            <button class="theme-card" type="button" data-detail-toast="蓝色主题即将开放"><span>蓝色主题</span><span>›</span></button>
            <button class="theme-card" type="button" data-detail-toast="橙色主题即将开放"><span>橙色主题</span><span>›</span></button>
          </div>
        </div>`;
    }

    return `<div class="detail-screen"><div class="empty-detail">功能暂不可用</div></div>`;
  }

  function randomHex(bytes = 16) {
    const values = new Uint8Array(bytes);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let index = 0; index < values.length; index += 1) {
        values[index] = Math.floor(Math.random() * 256);
      }
    }
    return [...values].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  function setupPaymentCode() {
    const output = document.querySelector("#qrOutput");
    const number = document.querySelector("#payCodeNumber");
    const countdown = document.querySelector("#payCountdown");
    const refresh = document.querySelector("#payRefreshButton");
    const success = document.querySelector("#paySuccess");
    if (!output || !number || !countdown || !refresh) return;

    const updateCountdown = () => {
      countdown.textContent = `付款码${paymentSeconds}秒后失效`;
    };

    const generate = () => {
      paymentSeconds = 59;
      const token = `LEYUN-PAY|${Date.now()}|${randomHex(20)}`;
      const masked = `${Math.floor(45500 + Math.random() * 100)}****`;
      number.textContent = masked;

      try {
        const qr = window.qrcode(0, "M");
        qr.addData(token);
        qr.make();
        output.innerHTML = qr.createSvgTag(4, 0);
        const svg = output.querySelector("svg");
        if (svg) {
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", "动态付款二维码");
        }
      } catch {
        output.textContent = "二维码生成失败";
      }
      updateCountdown();
      if (success) {
        success.classList.remove("show");
        void success.offsetWidth;
        success.classList.add("show");
      }
    };

    window.clearInterval(paymentTimer);
    generate();
    paymentTimer = window.setInterval(() => {
      paymentSeconds -= 1;
      if (paymentSeconds <= 0) {
        generate();
      } else {
        updateCountdown();
      }
    }, 1000);
    refresh.addEventListener("click", generate);
  }

  function setupCalendar() {
    const grid = document.querySelector("#calendarGrid");
    const head = document.querySelector("#calendarHead");
    if (!grid || !head) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    head.textContent = `${year}年${month + 1}月`;

    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const cells = weekdays.map((day) => `<div class="calendar-week">${day}</div>`);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousDays = new Date(year, month, 0).getDate();

    for (let index = 0; index < 42; index += 1) {
      let label = "";
      let classes = "calendar-day";
      let dayNumber = 0;

      if (index < firstDay) {
        dayNumber = previousDays - firstDay + index + 1;
        label = String(dayNumber);
        classes += " muted";
      } else if (index < firstDay + daysInMonth) {
        dayNumber = index - firstDay + 1;
        label = dayNumber === 1 ? `${month + 1}月` : String(dayNumber);
        if (dayNumber === 1) classes += " festival";
        if (
          now.getFullYear() === year &&
          now.getMonth() === month &&
          now.getDate() === dayNumber
        ) {
          classes += " today";
          label = `<span>${dayNumber}</span>`;
        }
      } else {
        dayNumber = index - firstDay - daysInMonth + 1;
        label = String(dayNumber);
        classes += " muted";
      }

      cells.push(`<div class="${classes}">${label}</div>`);
    }
    grid.innerHTML = cells.join("");
  }

  function setupUtilities() {
    const building = document.querySelector("#utilityBuilding");
    const floor = document.querySelector("#utilityFloor");
    const room = document.querySelector("#utilityRoom");
    const confirm = document.querySelector("#utilityConfirm");
    if (!building || !floor || !room || !confirm) return;

    const update = () => {
      confirm.disabled = !(building.value && floor.value && room.value.trim());
    };
    building.addEventListener("change", update);
    floor.addEventListener("change", update);
    room.addEventListener("input", update);
    confirm.addEventListener("click", () => {
      showToast(`${building.value} ${floor.value} ${room.value.trim()} 账单已生成`);
    });
  }

  function stopScan() {
    window.clearInterval(scanTimer);
    scanTimer = 0;
    if (scanStream) {
      scanStream.getTracks().forEach((track) => track.stop());
      scanStream = null;
    }
  }

  async function startScanCamera() {
    const viewfinder = document.querySelector("#scanViewfinder");
    const note = document.querySelector("#scanNote");
    const button = document.querySelector("#scanButton");
    if (!viewfinder || !note || !button) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      showToast("当前浏览器不支持相机");
      return;
    }

    try {
      stopScan();
      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      const video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = scanStream;
      viewfinder.prepend(video);
      note.textContent = "请将二维码置于取景框内";
      button.textContent = "正在扫描";
      showToast("相机已打开");
    } catch {
      note.textContent = "无法打开相机，请检查浏览器权限";
      showToast("无法打开相机");
    }
  }

  function setupFeature(key) {
    if (key === "paycode") setupPaymentCode();
    if (key === "attendance") setupCalendar();
    if (key === "utilities") setupUtilities();
    if (key === "scan") {
      document.querySelector("#scanButton")?.addEventListener("click", startScanCamera);
    }
  }

  function cleanupFeature() {
    window.clearInterval(paymentTimer);
    paymentTimer = 0;
    stopScan();
  }

  function openFeature(key, options = {}) {
    const template = featureTemplate(key);
    featureReturnPage = options.returnPage || currentPageId || "homePage";
    currentFeature = key;
    elements.featureContent.innerHTML = template;
    elements.pages.forEach((page) => {
      page.classList.toggle("active", page.id === "featurePage");
    });
    elements.appShell.classList.add("detail-mode");
    elements.appContent.scrollTop = 0;
    window.history.pushState(
      { ...(window.history.state || {}), leyunFeature: key, returnPage: featureReturnPage },
      "",
      `#feature-${key}`,
    );
    setupFeature(key);
  }

  function closeFeature() {
    cleanupFeature();
    currentFeature = "";
    elements.appShell.classList.remove("detail-mode");
    switchPage(featureReturnPage || "homePage");
  }

  function openEdit(type) {
    const config = editConfigs[type];
    if (!config) return;

    activeEdit = type;
    lastFocusedElement = document.activeElement;
    elements.sheetTitle.textContent = config.title;
    elements.formFields.replaceChildren();

    config.fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "field";

      const label = document.createElement("label");
      label.htmlFor = `field-${field.key}`;
      label.textContent = field.label;

      const input = document.createElement("input");
      input.id = `field-${field.key}`;
      input.name = field.key;
      input.type = field.type;
      input.value = type === "newUser" ? "" : profile[field.key] || "";
      input.autocomplete = "off";
      if (field.maxlength) input.maxLength = field.maxlength;
      if (field.min) input.min = field.min;
      if (field.step) input.step = field.step;

      wrapper.append(label, input);
      elements.formFields.append(wrapper);
    });

    elements.backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      const firstInput = elements.formFields.querySelector("input");
      firstInput?.focus({ preventScroll: true });
      firstInput?.select();
    });
  }

  function closeEdit() {
    elements.backdrop.hidden = true;
    document.body.style.overflow = "";
    activeEdit = "";
    if (lastFocusedElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function openAccountPanel() {
    elements.accountPanelName.textContent = profile.name || "未填写";
    elements.accountPanelNumber.textContent = profile.studentId || "";
    elements.accountPanelDepartment.textContent = fullDepartment();
    window.clearTimeout(accountCloseTimer);
    elements.accountOverlay.hidden = false;
    elements.accountOverlay.classList.remove("is-open", "is-closing");
    void elements.accountOverlay.offsetWidth;
    elements.accountOverlay.classList.add("is-open");
  }

  function closeAccountPanel() {
    if (elements.accountOverlay.hidden) return;
    elements.accountOverlay.classList.remove("is-open");
    elements.accountOverlay.classList.add("is-closing");
    accountCloseTimer = window.setTimeout(() => {
      elements.accountOverlay.hidden = true;
      elements.accountOverlay.classList.remove("is-closing");
    }, 180);
  }

  function submitEdit(event) {
    event.preventDefault();
    const config = editConfigs[activeEdit];
    if (!config) return;

    const formData = new FormData(elements.editForm);
    config.fields.forEach((field) => {
      const rawValue = String(formData.get(field.key) || "").trim();
      profile[field.key] =
        field.type === "number" ? normalizedMoney(rawValue) : rawValue;
    });

    saveProfile();
    renderProfile();
    closeEdit();
    showToast("信息已保存");
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 1800);
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleAvatarChange(event) {
    const [file] = event.target.files;
    if (!file) return;

    try {
      const image = await readImage(file);
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - size) / 2;
      const sourceY = (image.naturalHeight - size) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d", { alpha: false });
      context.fillStyle = "#d9d9d9";
      context.fillRect(0, 0, 512, 512);
      context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 512, 512);
      profile.avatar = canvas.toDataURL("image/jpeg", 0.86);
      saveProfile();
      renderProfile();
      showToast("头像已更新");
    } catch {
      showToast("这张图片无法使用，请换一张");
    } finally {
      event.target.value = "";
    }
  }

  elements.nameButton.addEventListener("click", () => openEdit("identity"));
  elements.accountToggle.addEventListener("click", openAccountPanel);
  elements.accountReturn.addEventListener("click", closeAccountPanel);
  elements.accountAdd.addEventListener("click", () => {
    closeAccountPanel();
    openEdit("newUser");
  });
  elements.schoolButton.addEventListener("click", () => openEdit("school"));
  elements.balanceButton.addEventListener("click", () => openEdit("balance"));
  elements.editProfileButton.addEventListener("click", () => openEdit("identity"));
  elements.profileIdentityButton.addEventListener("click", () => openEdit("identity"));
  elements.avatarButton.addEventListener("click", () => elements.avatarInput.click());
  elements.profileAvatarButton.addEventListener("click", () => elements.avatarInput.click());
  elements.avatarInput.addEventListener("change", handleAvatarChange);
  elements.noticeButton.addEventListener("click", () => switchPage("messagesPage"));
  elements.sheetClose.addEventListener("click", closeEdit);
  elements.detailBack.addEventListener("click", () => {
    if (currentFeature) {
      window.history.back();
    } else {
      closeFeature();
    }
  });
  elements.editForm.addEventListener("submit", submitEdit);
  elements.backdrop.addEventListener("click", (event) => {
    if (event.target === elements.backdrop) closeEdit();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!elements.accountOverlay.hidden) {
      closeAccountPanel();
      return;
    }
    if (!elements.backdrop.hidden) {
      closeEdit();
      return;
    }
    if (currentFeature) {
      window.history.back();
    }
  });

  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => switchPage(item.dataset.page));
  });

  elements.featureItems.forEach((item) => {
    item.addEventListener("click", () => {
      const key = featureKeys[item.dataset.feature];
      if (key) {
        openFeature(key, { returnPage: "homePage" });
      }
    });
  });

  elements.myDemoButtons.forEach((item) => {
    item.addEventListener("click", () => {
      const key = myFeatureKeys[item.dataset.myDemo];
      if (key) {
        openFeature(key, { returnPage: "profilePage" });
      }
    });
  });

  elements.featureContent.addEventListener("click", (event) => {
    const toastTarget = event.target.closest("[data-detail-toast]");
    if (toastTarget) {
      showToast(`${toastTarget.dataset.detailToast}功能演示`);
    }

    const chip = event.target.closest(".transaction-chip");
    if (chip) {
      elements.featureContent
        .querySelectorAll(".transaction-chip")
        .forEach((item) => item.classList.toggle("active", item === chip));
    }
  });

  elements.featureContent.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-static-form]");
    if (!form) return;
    event.preventDefault();
    showToast(form.dataset.staticForm);
  });

  elements.messageTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeMessageFilter = tab.dataset.messageFilter;
      elements.messageTabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      renderMessages();
    });
  });

  elements.messageTypeButton.addEventListener("click", () => {
    activeMessageType = activeMessageType === "all" ? "announcement" : "all";
    elements.messageTypeValue.textContent =
      activeMessageType === "all" ? "全部" : "公告";
    renderMessages();
    showToast(`消息类型：${elements.messageTypeValue.textContent}`);
  });

  elements.messageItem.addEventListener("click", () => {
    messageRead = true;
    renderMessages();
    openFeature("creditNotice", { returnPage: "messagesPage" });
  });

  window.addEventListener("popstate", () => {
    if (currentFeature) closeFeature();
  });
  window.addEventListener("resize", updateSchoolMarquee);

  renderProfile();
  renderMessages();
})();
