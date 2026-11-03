const STORAGE_KEY = "studyflow-data-v1";
const PAGE_LABELS = {
  dashboard: "Tổng quan",
  tasks: "Công việc",
  calendar: "Thời gian biểu",
  courses: "Môn học",
  progress: "Tiến độ học tập",
};
const COLOR_HEX = {
  blue: "#718cf0",
  violet: "#987de3",
  mint: "#54b99c",
  peach: "#eaa27e",
  rose: "#dc8492",
  amber: "#d4a243",
};
const PRIORITIES = { high: "Cao", medium: "Trung bình", low: "Thấp" };
const EVENT_TYPES = { class: "Lịch học", exam: "Kiểm tra", assignment: "Làm bài tập" };
const EVENT_ICONS = { class: "▣", exam: "✎", assignment: "▤" };
const DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];
const today = dateKey(new Date());

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function daysFromToday(days) {
  return shiftDate(today, days);
}

function makeSeedData() {
  const courses = [
    { id: "math", name: "Toán cao cấp", teacher: "Cô Nguyễn Thu Hà", color: "blue" },
    { id: "english", name: "Tiếng Anh", teacher: "Thầy David Nguyen", color: "violet" },
    { id: "physics", name: "Vật lý đại cương", teacher: "Thầy Trần Minh Đức", color: "mint" },
    { id: "history", name: "Lịch sử Đảng", teacher: "Cô Lê Mai Phương", color: "peach" },
  ];
  return {
    profile: { name: "Minh Anh" },
    courses,
    tasks: [
      { id: "task-1", title: "Ôn tập chương 3: Tích phân", courseId: "math", description: "Ôn lại công thức và làm bài tập cuối chương.", startDate: daysFromToday(-2), dueDate: daysFromToday(1), priority: "high", completed: false, createdAt: daysFromToday(-3) },
      { id: "task-2", title: "Hoàn thành bài luận tiếng Anh", courseId: "english", description: "Viết bài luận 500 từ về chủ đề môi trường.", startDate: daysFromToday(-1), dueDate: daysFromToday(2), priority: "medium", completed: false, createdAt: daysFromToday(-2) },
      { id: "task-3", title: "Bài tập về nhà tuần 6", courseId: "physics", description: "Giải câu 1 đến câu 8 trong giáo trình.", startDate: daysFromToday(0), dueDate: daysFromToday(4), priority: "high", completed: false, createdAt: today },
      { id: "task-4", title: "Đọc tài liệu buổi 5", courseId: "history", description: "Đọc tài liệu và ghi chú nội dung chính.", startDate: daysFromToday(-3), dueDate: daysFromToday(-1), priority: "low", completed: false, createdAt: daysFromToday(-4) },
      { id: "task-5", title: "Quiz từ vựng Unit 4", courseId: "english", description: "Ôn 30 từ vựng và luyện phát âm.", startDate: daysFromToday(-5), dueDate: today, priority: "medium", completed: true, createdAt: daysFromToday(-5) },
      { id: "task-6", title: "Bài tập giới hạn dãy số", courseId: "math", description: "Hoàn thành phiếu bài tập số 2.", startDate: daysFromToday(-6), dueDate: daysFromToday(-2), priority: "medium", completed: true, createdAt: daysFromToday(-7) },
    ],
    events: [
      { id: "event-1", title: "Giải tích 1", courseId: "math", type: "class", date: daysFromToday(0), startTime: "08:00", endTime: "09:30" },
      { id: "event-2", title: "Luyện nghe Unit 4", courseId: "english", type: "class", date: daysFromToday(0), startTime: "10:00", endTime: "11:30" },
      { id: "event-3", title: "Nộp bài luận tiếng Anh", courseId: "english", type: "assignment", date: daysFromToday(2), startTime: "14:00", endTime: "15:00" },
      { id: "event-4", title: "Kiểm tra giữa kỳ", courseId: "physics", type: "exam", date: daysFromToday(4), startTime: "09:00", endTime: "10:30" },
      { id: "event-5", title: "Vật lý đại cương", courseId: "physics", type: "class", date: daysFromToday(1), startTime: "13:00", endTime: "14:30" },
      { id: "event-6", title: "Thảo luận nhóm", courseId: "history", type: "class", date: daysFromToday(-1), startTime: "15:00", endTime: "16:30" },
    ],
  };
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    const initialData = makeSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.courses) || !Array.isArray(parsed.events) || !parsed.profile) {
      throw new Error("Dữ liệu StudyFlow không đúng định dạng.");
    }
    return parsed;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    showToast(`Không thể đọc dữ liệu đã lưu: ${error.message}. Đã khởi tạo dữ liệu mới.`, true);
    const initialData = makeSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
}

let state = loadData();
let currentPage = "dashboard";
let taskFilter = "all";
let taskQuery = "";
let taskSort = "due";
let calendarDate = new Date(`${today}T12:00:00`);
let calendarView = "month";
let timerMode = "study";
let timerRemaining = 25 * 60;
let timerInterval = null;
let toastTimeout;

const pageContent = document.querySelector("#page-content");
const taskDialog = document.querySelector("#task-dialog");
const courseDialog = document.querySelector("#course-dialog");
const eventDialog = document.querySelector("#event-dialog");
const pomodoroDialog = document.querySelector("#pomodoro-dialog");
const profileDialog = document.querySelector("#profile-dialog");

function saveState(nextState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    state = nextState;
    updateNavigation();
    return true;
  } catch (error) {
    showToast(`Không thể lưu dữ liệu: ${error.message}`, true);
    return false;
  }
}

function showToast(message, isError = false) {
  const region = document.querySelector("#toast-region");
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  region.replaceChildren(toast);
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.remove(), 3400);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(value, options = { day: "numeric", month: "short" }) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", options).format(new Date(`${value}T12:00:00`));
}

function getCourse(courseId) {
  return state.courses.find((course) => course.id === courseId);
}

function courseDot(courseId) {
  const course = getCourse(courseId);
  const color = COLOR_HEX[course?.color] || COLOR_HEX.blue;
  return `<span class="subject-dot" style="--course-color:${color}"></span>`;
}

function courseOptions(selected = "") {
  return `<option value="">${state.courses.length ? "Chọn môn học" : "Chưa có môn học"}</option>${state.courses.map((course) => `<option value="${escapeHTML(course.id)}" ${course.id === selected ? "selected" : ""}>${escapeHTML(course.name)}</option>`).join("")}`;
}

function isOverdue(task) {
  return !task.completed && task.dueDate < today;
}

function getCounts() {
  const done = state.tasks.filter((task) => task.completed).length;
  const overdue = state.tasks.filter(isOverdue).length;
  return { total: state.tasks.length, done, overdue, pending: state.tasks.length - done };
}

function updateNavigation() {
  document.querySelector("#nav-task-count").textContent = String(state.tasks.filter((task) => !task.completed).length);
  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.page === currentPage;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.querySelector(".profile-copy strong").textContent = state.profile.name;
  document.querySelector(".avatar").textContent = state.profile.name.slice(0, 1).toUpperCase();
  document.querySelector(".topbar-avatar").textContent = state.profile.name.slice(0, 1).toUpperCase();
}

function pageHeading(title, caption, button = "") {
  return `<div class="page-heading"><div><p class="eyebrow">KHÔNG GIAN HỌC TẬP</p><h1>${title}</h1><p>${caption}</p></div>${button}</div>`;
}

function metricCard(label, value, icon, tone, note) {
  return `<article class="metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon ${tone}">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-sub">${note}</div></article>`;
}

function formatDue(task) {
  const delta = Math.round((new Date(`${task.dueDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000);
  if (task.completed) return `<span class="due-label">Đã xong</span>`;
  if (delta < 0) return `<span class="due-label overdue">Trễ ${Math.abs(delta)} ngày</span>`;
  if (delta === 0) return `<span class="due-label soon">Hôm nay</span>`;
  if (delta === 1) return `<span class="due-label soon">Ngày mai</span>`;
  return `<span class="due-label">${formatDate(task.dueDate)}</span>`;
}

function renderTaskRow(task) {
  const course = getCourse(task.courseId);
  return `<div class="task-row ${task.completed ? "is-complete" : ""}">
    <button class="check-button ${task.completed ? "checked" : ""}" data-action="toggle-task" data-id="${escapeHTML(task.id)}" aria-label="${task.completed ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}">${task.completed ? "✓" : ""}</button>
    <div class="task-main"><div class="task-title">${escapeHTML(task.title)}</div><div class="task-meta">${courseDot(task.courseId)}${escapeHTML(course?.name || "Chưa phân môn")} <span>·</span> Hạn ${formatDate(task.dueDate)}</div></div>
    ${formatDue(task)}
  </div>`;
}

function renderAgendaItem(event) {
  const course = getCourse(event.courseId);
  return `<div class="agenda-item"><div class="agenda-time">${escapeHTML(event.startTime)}<br />${escapeHTML(event.endTime)}</div><div class="agenda-line ${escapeHTML(event.type)}"></div><div class="agenda-copy"><strong>${EVENT_ICONS[event.type] || "•"} ${escapeHTML(event.title)}</strong><span>${escapeHTML(course?.name || "Chưa phân môn")} · ${EVENT_TYPES[event.type] || "Sự kiện"}</span></div></div>`;
}

function getMonday(value) {
  const date = new Date(`${value}T12:00:00`);
  const day = date.getDay();
  date.setDate(date.getDate() - ((day + 6) % 7));
  return dateKey(date);
}

function weekStats() {
  const monday = getMonday(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(monday, index);
    const done = state.tasks.filter((task) => task.completed && task.dueDate === date).length;
    const open = state.tasks.filter((task) => !task.completed && task.dueDate === date).length;
    return { date, done, open, label: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index] };
  });
}

function renderWeeklyChart(large = false) {
  const stats = weekStats();
  const max = Math.max(2, ...stats.map((day) => day.done + day.open));
  return `<div class="weekly-chart ${large ? "large-chart" : ""}">${stats.map((day) => {
    const doneHeight = day.done ? Math.max(8, (day.done / max) * 112) : 4;
    const openHeight = day.open ? Math.max(8, (day.open / max) * 112) : 4;
    const isToday = day.date === today;
    return `<div class="chart-day ${isToday ? "today" : ""}"><div class="chart-bars"><span class="bar done" style="height:${doneHeight}px" title="${day.done} hoàn thành"></span><span class="bar" style="height:${openHeight}px" title="${day.open} chưa xong"></span></div><span class="chart-day-label">${day.label}${isToday ? " ·" : ""}</span></div>`;
  }).join("")}</div>`;
}

function renderCourseMiniList() {
  if (!state.courses.length) return `<div class="empty-state">Chưa có môn học nào.<br /><button class="text-link" data-action="open-course">Thêm môn học →</button></div>`;
  return `<div class="course-mini-list">${state.courses.slice(0, 4).map((course, index) => {
    const related = state.tasks.filter((task) => task.courseId === course.id);
    const done = related.filter((task) => task.completed).length;
    const symbols = ["∑", "A", "⚛", "◈", "✦"];
    return `<div class="course-mini"><span class="course-symbol ${escapeHTML(course.color)}">${symbols[index % symbols.length]}</span><div><strong>${escapeHTML(course.name)}</strong><span>${escapeHTML(course.teacher || "Chưa cập nhật giảng viên")}</span></div><span class="course-mini-count">${done}/${related.length} bài</span></div>`;
  }).join("")}</div>`;
}

function renderDashboard() {
  const counts = getCounts();
  const percentage = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  const upcoming = [...state.tasks].filter((task) => !task.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const agenda = state.events.filter((event) => event.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const name = escapeHTML(state.profile.name);
  return `<section class="welcome-banner"><div class="welcome-copy"><p class="eyebrow">HÔM NAY LÀ MỘT NGÀY TỐT ĐỂ HỌC ✨</p><h1>Chào ${name}, sẵn sàng chưa?</h1><p>Mỗi bước nhỏ hôm nay sẽ đưa bạn đến gần hơn với mục tiêu.</p><button class="button banner-button" data-action="open-task">+ Thêm công việc mới</button></div><div class="banner-art" aria-hidden="true"><span class="book-stack">📚</span><span class="sparkle sparkle-one">✦</span><span class="sparkle sparkle-two">✦</span></div></section>
    <section class="metric-grid">
      ${metricCard("Tổng công việc", counts.total, "▤", "blue", `<strong>${counts.pending} việc</strong> đang chờ bạn`)}
      ${metricCard("Đã hoàn thành", counts.done, "✓", "green", `<strong>${percentage}%</strong> tổng tiến độ`)}
      ${metricCard("Chưa hoàn thành", counts.pending, "◷", "peach", "Tiếp tục cố gắng nhé")}
      ${metricCard("Đã quá hạn", counts.overdue, "!", "rose", counts.overdue ? "Ưu tiên xử lý hôm nay" : "Bạn đang đúng tiến độ")}
    </section>
    <section class="dashboard-grid">
      <article class="panel"><div class="panel-heading"><div><h2>Tiến độ trong tuần</h2><p>Theo dõi nhịp độ học tập của bạn</p></div><div class="chart-legend"><span><i class="legend-dot"></i>Hoàn thành</span><span><i class="legend-dot pale"></i>Đang làm</span></div></div>${renderWeeklyChart()}</article>
      <article class="panel"><div class="panel-heading"><div><h2>Việc sắp đến hạn</h2><p>Đừng quên những mục tiêu của bạn</p></div><button class="text-link" data-page="tasks">Xem tất cả →</button></div>
        ${upcoming.length ? `<div class="task-list">${upcoming.map(renderTaskRow).join("")}</div>` : `<div class="empty-state"><span>🎉</span>Tuyệt vời! Bạn không còn việc nào đang chờ.</div>`}
      </article>
    </section>
    <section class="dashboard-bottom">
      <article class="panel"><div class="panel-heading"><div><h2>Lịch hôm nay</h2><p>${formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</p></div><button class="text-link" data-page="calendar">Mở lịch →</button></div>
      ${agenda.length ? `<div class="calendar-list">${agenda.map(renderAgendaItem).join("")}</div>` : `<div class="empty-state"><span>☀</span>Hôm nay chưa có lịch học.<br /><button class="text-link" data-action="open-event">Thêm sự kiện →</button></div>`}
      </article>
      <article class="panel"><div class="panel-heading"><div><h2>Môn học của tôi</h2><p>Cùng bạn chinh phục từng môn học</p></div><button class="text-link" data-page="courses">Xem tất cả →</button></div>${renderCourseMiniList()}</article>
      <article class="panel"><div class="panel-heading"><div><h2>Tổng quan hoàn thành</h2><p>Tiến độ học tập hiện tại</p></div><button class="text-link" data-page="progress">Chi tiết →</button></div><div class="completion-wrap"><div class="completion-ring" style="--progress:${percentage}%"><span>${percentage}%</span></div><div class="completion-copy"><strong>${counts.done} / ${counts.total} công việc</strong><span>${percentage >= 70 ? "Tuyệt vời! Bạn đang giữ nhịp học tập rất tốt." : "Hoàn thành thêm một việc nhỏ để tiến gần mục tiêu nhé."}</span></div></div></article>
      <article class="pomodoro-inline"><div><h2>⏱ Đã đến lúc tập trung?</h2><p>25 phút tập trung, 5 phút nghỉ ngơi — bắt đầu ngay nhé.</p></div><button class="button" data-action="open-pomodoro">Bắt đầu phiên học →</button></article>
    </section>`;
}

function renderTaskTable() {
  const query = taskQuery.trim().toLocaleLowerCase("vi");
  let tasks = state.tasks.filter((task) => {
    const matchesText = !query || task.title.toLocaleLowerCase("vi").includes(query) || (getCourse(task.courseId)?.name || "").toLocaleLowerCase("vi").includes(query);
    const matchesFilter = taskFilter === "all" ||
      (taskFilter === "active" && !task.completed && !isOverdue(task)) ||
      (taskFilter === "done" && task.completed) ||
      (taskFilter === "overdue" && isOverdue(task));
    return matchesText && matchesFilter;
  });
  if (taskSort === "priority") {
    const weight = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => weight[a.priority] - weight[b.priority] || a.dueDate.localeCompare(b.dueDate));
  } else {
    tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }
  if (!tasks.length) return `<div class="task-table-empty">Không tìm thấy công việc phù hợp với lựa chọn của bạn.</div>`;
  return tasks.map((task) => {
    const course = getCourse(task.courseId);
    const status = task.completed ? ["done", "Hoàn thành"] : isOverdue(task) ? ["late", "Quá hạn"] : ["todo", "Đang làm"];
    return `<div class="table-task">
      <div class="table-task-name"><button class="check-button ${task.completed ? "checked" : ""}" data-action="toggle-task" data-id="${escapeHTML(task.id)}" aria-label="Đổi trạng thái">${task.completed ? "✓" : ""}</button><div><strong>${escapeHTML(task.title)}</strong><span>${escapeHTML(task.description || "Không có mô tả")}</span></div></div>
      <span class="table-course">${courseDot(task.courseId)}${escapeHTML(course?.name || "Chưa phân môn")}</span>
      <span class="priority ${escapeHTML(task.priority)}">${PRIORITIES[task.priority] || "Trung bình"}</span>
      <span>${formatDate(task.dueDate, { day: "numeric", month: "short", year: "numeric" })}</span>
      <div class="row-actions"><span class="status-pill ${status[0]}">${status[1]}</span><button class="icon-button" data-action="edit-task" data-id="${escapeHTML(task.id)}" aria-label="Sửa công việc">✎</button><button class="icon-button" data-action="delete-task" data-id="${escapeHTML(task.id)}" aria-label="Xóa công việc">×</button></div>
    </div>`;
  }).join("");
}

function renderTasks() {
  const tabs = [["all", "Tất cả"], ["active", "Đang làm"], ["done", "Hoàn thành"], ["overdue", "Quá hạn"]];
  return `${pageHeading("Công việc học tập", "Gom mọi mục tiêu vào một nơi và hoàn thành từng việc một.", `<button class="button button-primary" data-action="open-task">＋ Thêm công việc</button>`)}
    <div class="toolbar"><div class="filter-group">${tabs.map(([key, label]) => `<button class="filter-button ${taskFilter === key ? "active" : ""}" data-action="filter-task" data-filter="${key}">${label}${key === "all" ? ` (${state.tasks.length})` : ""}</button>`).join("")}</div><select class="sort-select" aria-label="Sắp xếp công việc"><option value="due" ${taskSort === "due" ? "selected" : ""}>Sắp xếp: Hạn gần nhất</option><option value="priority" ${taskSort === "priority" ? "selected" : ""}>Sắp xếp: Ưu tiên cao</option></select></div>
    <section class="task-table"><div class="table-head"><span>Công việc</span><span>Môn học</span><span>Ưu tiên</span><span>Hạn hoàn thành</span><span>Trạng thái</span></div><div id="task-table-body">${renderTaskTable()}</div></section>`;
}

function eventsForDate(date) {
  return state.events.filter((event) => event.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function renderMonthCalendar() {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1, 12);
  const offset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - offset, 12);
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    const events = eventsForDate(key);
    return `<div class="calendar-cell ${date.getMonth() === month ? "" : "muted"} ${key === today ? "today" : ""} ${key === dateKey(calendarDate) ? "selected" : ""}" data-action="select-date" data-date="${key}"><span class="calendar-date">${date.getDate()}</span>${events.slice(0, 3).map((event) => `<div class="calendar-event ${escapeHTML(event.type)}" title="${escapeHTML(event.title)}">${escapeHTML(event.startTime)} ${escapeHTML(event.title)}</div>`).join("")}${events.length > 3 ? `<div class="calendar-event">+${events.length - 3} lịch khác</div>` : ""}</div>`;
  });
  return `<div class="calendar-grid">${DAY_NAMES.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}${cells.join("")}</div>`;
}

function renderDayCalendar() {
  const date = dateKey(calendarDate);
  const events = eventsForDate(date);
  return `<div class="agenda-date-heading">${formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div><div class="day-list">${events.length ? events.map((event) => `<div class="week-event"><span class="week-event-date">${event.startTime} – ${event.endTime}</span><div class="week-event-copy"><strong>${escapeHTML(event.title)}</strong><span>${EVENT_TYPES[event.type]} · ${escapeHTML(getCourse(event.courseId)?.name || "Chưa phân môn")}</span></div><span class="status-pill ${event.type === "exam" ? "late" : "todo"}">${EVENT_TYPES[event.type]}</span></div>`).join("") : `<div class="empty-state"><span>☀</span>Ngày này chưa có sự kiện nào.<br /><button class="text-link" data-action="open-event">Thêm sự kiện →</button></div>`}</div>`;
}

function renderWeekCalendar() {
  const monday = getMonday(dateKey(calendarDate));
  const events = Array.from({ length: 7 }, (_, index) => shiftDate(monday, index)).flatMap((date) =>
    eventsForDate(date).map((event) => ({ ...event, day: date })),
  );
  return `<div class="week-list">${events.length ? events.map((event) => `<div class="week-event"><span class="week-event-date">${formatDate(event.day, { weekday: "short", day: "numeric", month: "short" })}<br />${event.startTime} – ${event.endTime}</span><div class="week-event-copy"><strong>${escapeHTML(event.title)}</strong><span>${EVENT_TYPES[event.type]} · ${escapeHTML(getCourse(event.courseId)?.name || "Chưa phân môn")}</span></div><span class="status-pill ${event.type === "exam" ? "late" : "todo"}">${EVENT_TYPES[event.type]}</span></div>`).join("") : `<div class="empty-state"><span>🗓</span>Tuần này chưa có lịch. Thêm một sự kiện để lên kế hoạch nhé.</div>`}</div>`;
}

function renderCalendar() {
  let title;
  if (calendarView === "day") title = formatDate(dateKey(calendarDate), { day: "numeric", month: "long", year: "numeric" });
  else if (calendarView === "week") title = `Tuần ${formatDate(getMonday(dateKey(calendarDate)), { day: "numeric", month: "short" })}`;
  else title = `${MONTH_NAMES[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`;
  const content = calendarView === "month" ? renderMonthCalendar() : calendarView === "week" ? renderWeekCalendar() : renderDayCalendar();
  return `${pageHeading("Thời gian biểu", "Sắp xếp lịch học, bài tập và những ngày kiểm tra quan trọng.", `<button class="button button-primary" data-action="open-event">＋ Thêm lịch</button>`)}
    <section class="panel calendar-panel"><div class="panel-heading"><div class="calendar-controls"><button class="icon-button" data-action="calendar-prev" aria-label="Trước">‹</button><button class="icon-button" data-action="calendar-today">•</button><button class="icon-button" data-action="calendar-next" aria-label="Tiếp">›</button><span class="calendar-month">${title}</span></div><div class="view-switch">${[["day", "Ngày"], ["week", "Tuần"], ["month", "Tháng"]].map(([key, label]) => `<button class="${calendarView === key ? "active" : ""}" data-action="calendar-view" data-view="${key}">${label}</button>`).join("")}</div></div>${content}</section>
    <div class="toolbar"><span class="panel-heading"><span style="color:#526078;font-size:10px;font-weight:700">Chú thích</span></span><div class="chart-legend"><span><i class="legend-dot"></i>Lịch học</span><span><i class="legend-dot" style="background:#f0aa8c"></i>Kiểm tra</span><span><i class="legend-dot" style="background:#5fc3a2"></i>Bài tập</span></div></div>`;
}

function renderCourses() {
  const symbols = ["∑", "A", "⚛", "◈", "✦", "▣"];
  const cards = state.courses.map((course, index) => {
    const tasks = state.tasks.filter((task) => task.courseId === course.id);
    const done = tasks.filter((task) => task.completed).length;
    const percentage = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return `<article class="course-card"><div class="course-card-top"><div class="course-card-title"><span class="course-symbol ${escapeHTML(course.color)}">${symbols[index % symbols.length]}</span><div><h3>${escapeHTML(course.name)}</h3><p>${escapeHTML(course.teacher || "Chưa cập nhật giảng viên")}</p></div></div><div class="row-actions"><button class="icon-button" data-action="edit-course" data-id="${escapeHTML(course.id)}" aria-label="Sửa môn học">✎</button><button class="icon-button" data-action="delete-course" data-id="${escapeHTML(course.id)}" aria-label="Xóa môn học">×</button></div></div><p class="course-card-description">${tasks.length ? `Bạn có ${tasks.length} công việc trong môn học này. Cố gắng duy trì nhịp học nhé!` : "Chưa có công việc nào. Thêm một mục tiêu để bắt đầu."}</p><div class="course-progress"><span style="width:${percentage}%"></span></div><div class="course-card-footer"><span>${done} / ${tasks.length} công việc hoàn thành</span><strong>${percentage}%</strong></div></article>`;
  }).join("");
  return `${pageHeading("Môn học của tôi", "Mỗi môn học là một hành trình nhỏ — hãy tiến bộ mỗi ngày.", `<button class="button button-primary" data-action="open-course">＋ Thêm môn học</button>`)}<section class="course-grid">${cards || `<div class="panel empty-state"><span>📚</span>Chưa có môn học nào.<br />Hãy thêm môn học đầu tiên nhé.</div>`}</section>`;
}

function renderProgress() {
  const counts = getCounts();
  const percentage = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;
  const thisWeek = weekStats().reduce((sum, day) => sum + day.done, 0);
  const activeCourses = state.courses.filter((course) => state.tasks.some((task) => task.courseId === course.id)).length;
  const courseRows = state.courses.map((course) => {
    const tasks = state.tasks.filter((task) => task.courseId === course.id);
    const done = tasks.filter((task) => task.completed).length;
    const value = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return `<div class="subject-progress-row"><span class="subject-progress-name">${courseDot(course.id)} ${escapeHTML(course.name)}</span><div class="subject-progress-track"><span style="width:${value}%;background:${COLOR_HEX[course.color] || COLOR_HEX.blue}"></span></div><span class="subject-progress-value">${value}%</span></div>`;
  }).join("");
  const doneAngle = (counts.total ? (counts.done / counts.total) : 0) * 100;
  const lateAngle = (counts.total ? (counts.overdue / counts.total) : 0) * 100;
  return `${pageHeading("Tiến độ học tập", "Nhìn lại hành trình của bạn và tự hào về từng bước tiến nhỏ.", `<button class="button button-quiet" data-page="tasks">Xem công việc →</button>`)}
    <section class="progress-summary"><div class="progress-stat"><span class="metric-icon green">✓</span><div><strong>${counts.done}</strong><span>Đã hoàn thành</span></div></div><div class="progress-stat"><span class="metric-icon blue">▤</span><div><strong>${thisWeek}</strong><span>Hoàn thành trong tuần</span></div></div><div class="progress-stat"><span class="metric-icon peach">◫</span><div><strong>${activeCourses}</strong><span>Môn học đang theo dõi</span></div></div></section>
    <section class="progress-charts"><article class="panel"><div class="panel-heading"><div><h2>Nhịp độ học tập theo tuần</h2><p>Số công việc đến hạn trong tuần hiện tại</p></div><div class="chart-legend"><span><i class="legend-dot"></i>Hoàn thành</span><span><i class="legend-dot pale"></i>Đang làm</span></div></div>${renderWeeklyChart(true)}</article>
    <article class="panel"><div class="panel-heading"><div><h2>Tỷ lệ hoàn thành</h2><p>Toàn bộ công việc của bạn</p></div></div><div class="progress-donut-wrap"><div class="progress-donut" style="--done:${doneAngle}%;--end:${Math.min(100, doneAngle + lateAngle)}%"><div class="progress-donut-copy"><strong>${percentage}%</strong><span>hoàn thành</span></div></div><div class="donut-legend"><span><i class="legend-dot"></i>Đã xong <strong>${counts.done}</strong></span><span><i class="legend-dot" style="background:#f0aa8c"></i>Quá hạn <strong>${counts.overdue}</strong></span><span><i class="legend-dot pale"></i>Còn lại <strong>${Math.max(0, counts.total - counts.done - counts.overdue)}</strong></span></div></div></article></section>
    <section class="panel" style="margin-top:16px"><div class="panel-heading"><div><h2>Tiến độ theo môn học</h2><p>Mỗi môn học đang ở đâu trên hành trình của bạn?</p></div></div><div class="subject-progress-list">${courseRows || `<div class="empty-state">Thêm môn học để theo dõi tiến độ chi tiết.</div>`}</div></section>
    <section class="pomodoro-inline"><div><h2>🍅 Một phiên Pomodoro cho mục tiêu tiếp theo?</h2><p>Chia nhỏ thời gian, giữ sự tập trung và cho bản thân nghỉ ngơi đúng lúc.</p></div><button class="button" data-action="open-pomodoro">Mở đồng hồ →</button></section>`;
}

function render() {
  document.querySelector("#breadcrumb-current").textContent = PAGE_LABELS[currentPage] || PAGE_LABELS.dashboard;
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "numeric", month: "short" }).format(new Date());
  updateNavigation();
  const pages = { dashboard: renderDashboard, tasks: renderTasks, calendar: renderCalendar, courses: renderCourses, progress: renderProgress };
  pageContent.innerHTML = pages[currentPage]();
}

function showTaskDialog(task = null) {
  const form = document.querySelector("#task-form");
  form.reset();
  form.elements.id.value = task?.id || "";
  form.elements.title.value = task?.title || "";
  form.elements.courseId.innerHTML = courseOptions(task?.courseId || "");
  form.elements.priority.value = task?.priority || "medium";
  form.elements.startDate.value = task?.startDate || today;
  form.elements.dueDate.value = task?.dueDate || today;
  form.elements.description.value = task?.description || "";
  document.querySelector("#task-dialog-title").textContent = task ? "Chỉnh sửa công việc" : "Thêm công việc";
  taskDialog.showModal();
}

function showCourseDialog(course = null) {
  const form = document.querySelector("#course-form");
  form.reset();
  form.elements.id.value = course?.id || "";
  form.elements.name.value = course?.name || "";
  form.elements.teacher.value = course?.teacher || "";
  form.elements.color.value = course?.color || "blue";
  document.querySelector("#course-dialog-title").textContent = course ? "Chỉnh sửa môn học" : "Thêm môn học";
  courseDialog.showModal();
}

function showEventDialog() {
  const form = document.querySelector("#event-form");
  form.reset();
  form.elements.courseId.innerHTML = courseOptions();
  form.elements.date.value = dateKey(calendarDate);
  form.elements.startTime.value = "09:00";
  form.elements.endTime.value = "10:30";
  eventDialog.showModal();
}

function toggleTask(id) {
  const tasks = state.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  if (saveState({ ...state, tasks })) {
    showToast(tasks.find((task) => task.id === id).completed ? "Tuyệt vời! Công việc đã hoàn thành." : "Đã cập nhật trạng thái công việc.");
    render();
  }
}

function openPage(page) {
  if (!PAGE_LABELS[page]) return;
  currentPage = page;
  if (location.protocol !== "about:" && location.hash !== `#${page}`) {
    history.pushState(null, "", `#${page}`);
  }
  document.querySelector("#sidebar").classList.remove("open");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openPomodoro() {
  renderTimer();
  pomodoroDialog.showModal();
}

function renderTimer() {
  const minutes = String(Math.floor(timerRemaining / 60)).padStart(2, "0");
  const seconds = String(timerRemaining % 60).padStart(2, "0");
  const time = `${minutes}:${seconds}`;
  document.querySelector("#pomodoro-clock").textContent = time;
  document.querySelector("#mini-timer").textContent = time;
  document.querySelector("#pomodoro-mode").textContent = timerMode === "study" ? "Thời gian học" : "Thời gian nghỉ";
  document.querySelector(".timer-start").textContent = timerInterval ? "Ⅱ Tạm dừng" : "▶ Bắt đầu";
  const elapsed = timerMode === "study" ? (1500 - timerRemaining) / 1500 : (300 - timerRemaining) / 300;
  document.querySelector(".timer-ring").style.background = `conic-gradient(#6f8ced ${Math.max(0, Math.min(100, elapsed * 100))}%, #e8edfb ${Math.max(0, Math.min(100, elapsed * 100))}%)`;
}

function stopTimer() {
  if (timerInterval) window.clearInterval(timerInterval);
  timerInterval = null;
}

document.addEventListener("click", (event) => {
  const pageLink = event.target.closest("[data-page]");
  if (pageLink) {
    event.preventDefault();
    openPage(pageLink.dataset.page);
    return;
  }
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) return;
  const { action, id } = actionElement.dataset;
  if (action === "open-task") showTaskDialog();
  else if (action === "open-course") showCourseDialog();
  else if (action === "open-event") showEventDialog();
  else if (action === "open-pomodoro") openPomodoro();
  else if (action === "close-dialog") actionElement.closest("dialog").close();
  else if (action === "toggle-task") toggleTask(id);
  else if (action === "edit-task") showTaskDialog(state.tasks.find((task) => task.id === id));
  else if (action === "delete-task") {
    if (window.confirm("Bạn có chắc muốn xóa công việc này?")) {
      if (saveState({ ...state, tasks: state.tasks.filter((task) => task.id !== id) })) {
        showToast("Đã xóa công việc.");
        render();
      }
    }
  } else if (action === "filter-task") {
    taskFilter = actionElement.dataset.filter;
    render();
  } else if (action === "edit-course") showCourseDialog(state.courses.find((course) => course.id === id));
  else if (action === "delete-course") {
    const assigned = state.tasks.some((task) => task.courseId === id) || state.events.some((item) => item.courseId === id);
    if (assigned) showToast("Không thể xóa môn học đang được gắn với công việc hoặc lịch.", true);
    else if (window.confirm("Bạn có chắc muốn xóa môn học này?")) {
      if (saveState({ ...state, courses: state.courses.filter((course) => course.id !== id) })) {
        showToast("Đã xóa môn học.");
        render();
      }
    }
  } else if (action === "calendar-view") {
    calendarView = actionElement.dataset.view;
    render();
  } else if (action === "calendar-prev" || action === "calendar-next") {
    const amount = action === "calendar-prev" ? -1 : 1;
    if (calendarView === "month") calendarDate.setMonth(calendarDate.getMonth() + amount);
    else calendarDate.setDate(calendarDate.getDate() + amount * (calendarView === "week" ? 7 : 1));
    render();
  } else if (action === "calendar-today") {
    calendarDate = new Date(`${today}T12:00:00`);
    render();
  } else if (action === "select-date") {
    calendarDate = new Date(`${actionElement.dataset.date}T12:00:00`);
    calendarView = "day";
    render();
  } else if (action === "toggle-timer") {
    if (timerInterval) stopTimer();
    else timerInterval = window.setInterval(() => {
      timerRemaining -= 1;
      if (timerRemaining <= 0) {
        stopTimer();
        timerMode = timerMode === "study" ? "break" : "study";
        timerRemaining = timerMode === "study" ? 25 * 60 : 5 * 60;
        showToast(timerMode === "break" ? "Bạn đã hoàn thành phiên học! Nghỉ ngơi 5 phút nhé 🍅" : "Hết giờ nghỉ rồi, sẵn sàng tập trung nào!");
      }
      renderTimer();
    }, 1000);
    renderTimer();
  } else if (action === "reset-timer") {
    stopTimer();
    timerMode = "study";
    timerRemaining = 25 * 60;
    renderTimer();
  } else if (action === "toggle-sidebar") document.querySelector("#sidebar").classList.toggle("open");
  else if (action === "edit-profile") {
    const form = document.querySelector("#profile-form");
    form.elements.name.value = state.profile.name;
    profileDialog.showModal();
  }
});

document.querySelector("#task-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  if (values.get("dueDate") < values.get("startDate")) {
    showToast("Hạn hoàn thành không thể trước ngày bắt đầu.", true);
    return;
  }
  if (!state.courses.some((course) => course.id === values.get("courseId"))) {
    showToast("Vui lòng chọn một môn học hợp lệ.", true);
    return;
  }
  const id = values.get("id") || `task-${crypto.randomUUID()}`;
  const existing = state.tasks.find((task) => task.id === id);
  const task = {
    id,
    title: String(values.get("title")).trim(),
    courseId: values.get("courseId"),
    priority: values.get("priority"),
    startDate: values.get("startDate"),
    dueDate: values.get("dueDate"),
    description: String(values.get("description")).trim(),
    completed: existing?.completed || false,
    createdAt: existing?.createdAt || today,
  };
  const tasks = existing ? state.tasks.map((item) => item.id === id ? task : item) : [...state.tasks, task];
  if (saveState({ ...state, tasks })) {
    taskDialog.close();
    showToast(existing ? "Đã cập nhật công việc." : "Đã thêm công việc mới.");
    render();
  }
});

document.querySelector("#course-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const id = values.get("id") || `course-${crypto.randomUUID()}`;
  const course = { id, name: String(values.get("name")).trim(), teacher: String(values.get("teacher")).trim(), color: values.get("color") };
  const exists = state.courses.some((item) => item.id === id);
  const courses = exists ? state.courses.map((item) => item.id === id ? course : item) : [...state.courses, course];
  if (saveState({ ...state, courses })) {
    courseDialog.close();
    showToast(exists ? "Đã cập nhật môn học." : "Đã thêm môn học mới.");
    render();
  }
});

document.querySelector("#event-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  if (values.get("endTime") <= values.get("startTime")) {
    showToast("Thời gian kết thúc cần sau thời gian bắt đầu.", true);
    return;
  }
  if (!state.courses.some((course) => course.id === values.get("courseId"))) {
    showToast("Vui lòng chọn một môn học hợp lệ.", true);
    return;
  }
  const item = {
    id: `event-${crypto.randomUUID()}`,
    title: String(values.get("title")).trim(),
    type: values.get("type"),
    courseId: values.get("courseId"),
    date: values.get("date"),
    startTime: values.get("startTime"),
    endTime: values.get("endTime"),
  };
  if (saveState({ ...state, events: [...state.events, item] })) {
    eventDialog.close();
    showToast("Đã thêm sự kiện vào lịch.");
    render();
  }
});

document.querySelector("#profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const name = String(values.get("name")).trim();
  if (!name) return;
  if (saveState({ ...state, profile: { ...state.profile, name } })) {
    profileDialog.close();
    showToast("Đã cập nhật tên hiển thị.");
    render();
  }
});

document.querySelector("#global-search").addEventListener("input", (event) => {
  taskQuery = event.currentTarget.value;
  if (taskQuery && currentPage !== "tasks") openPage("tasks");
  else if (currentPage === "tasks") render();
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".sort-select")) {
    taskSort = event.target.value;
    render();
  }
});

window.addEventListener("hashchange", () => {
  const page = location.hash.slice(1);
  if (PAGE_LABELS[page]) {
    currentPage = page;
    render();
  }
});
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.querySelector("#global-search").focus();
  }
});
window.addEventListener("pagehide", stopTimer);

if (PAGE_LABELS[location.hash.slice(1)]) currentPage = location.hash.slice(1);
render();
