// 預設食物清單
const DEFAULT_FOODS = [
    '便當', '披薩', '漢堡', '炒飯', '麵條',
    '壽司', '火鍋', '燒烤', '中餐', '日餐',
    '泰菜', '印度菜', '義大利麵', '咖哩飯', '雞腿飯',
    '牛丼', '海鮮', '素食', '小籠包', '滷肉飯'
];

// 應用狀態
let appState = {
    defaultFoods: [...DEFAULT_FOODS],
    customFoods: [],
    selectedItems: new Set()
};

// 初始化應用
function init() {
    loadFromLocalStorage();
    renderFoodLists();
    setupEventListeners();
}

// 設置事件監聽
function setupEventListeners() {
    // 抽選按鈕
    document.getElementById('pickBtn').addEventListener('click', pickFoods);
    
    // 新增食物
    document.getElementById('addBtn').addEventListener('click', addFood);
    document.getElementById('foodInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addFood();
    });

    // 標籤頁切換
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // 重設按鈕
    document.getElementById('resetBtn').addEventListener('click', resetAll);
}

// 切換標籤頁
function switchTab(tabName) {
    // 移除所有活躍狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // 添加新的活躍狀態
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 隨機抽選食物
function pickFoods() {
    const selectCount = Math.max(1, parseInt(document.getElementById('selectCount').value) || 1);
    const allFoods = [...appState.defaultFoods, ...appState.customFoods];

    if (allFoods.length === 0) {
        showResults(['沒有可用的食物，請添加食物清單']);
        return;
    }

    // 從可用食物中隨機抽選
    const count = Math.min(selectCount, allFoods.length);
    const shuffled = [...allFoods].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    showResults(selected);
}

// 顯示結果
function showResults(foods) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = foods.map(food => 
        `<div class="result-item">🍽️ ${food}</div>`
    ).join('');
}

// 新增食物
function addFood() {
    const input = document.getElementById('foodInput');
    const food = input.value.trim();

    if (!food) {
        alert('請輸入食物名稱');
        return;
    }

    if (appState.customFoods.includes(food)) {
        alert('此食物已存在');
        return;
    }

    appState.customFoods.push(food);
    input.value = '';
    renderFoodLists();
    saveToLocalStorage();
}

// 刪除食物
function removeFood(type, index) {
    if (type === 'custom') {
        appState.customFoods.splice(index, 1);
    } else {
        appState.defaultFoods.splice(index, 1);
    }
    renderFoodLists();
    saveToLocalStorage();
}

// 切換食物選擇狀態
function toggleFood(type, index) {
    const foods = type === 'custom' ? appState.customFoods : appState.defaultFoods;
    const foodName = foods[index];
    const key = `${type}-${index}`;

    if (appState.selectedItems.has(key)) {
        appState.selectedItems.delete(key);
    } else {
        appState.selectedItems.add(key);
    }

    renderFoodLists();
}

// 渲染食物清單
function renderFoodLists() {
    // 渲染預設食物
    const defaultList = document.getElementById('defaultList');
    defaultList.innerHTML = appState.defaultFoods.map((food, index) => {
        const key = `default-${index}`;
        const isSelected = appState.selectedItems.has(key);
        return `
            <div class="food-item ${isSelected ? 'selected' : ''}">
                <span class="food-name">${food}</span>
                <button class="food-toggle" onclick="toggleFood('default', ${index})">${isSelected ? '✓' : '○'}</button>
            </div>
        `;
    }).join('');

    // 渲染自訂食物
    const customList = document.getElementById('customList');
    customList.innerHTML = appState.customFoods.map((food, index) => {
        const key = `custom-${index}`;
        const isSelected = appState.selectedItems.has(key);
        return `
            <div class="food-item ${isSelected ? 'selected' : ''}">
                <span class="food-name">${food}</span>
                <button class="food-toggle" onclick="toggleFood('custom', ${index})">${isSelected ? '✓' : '○'}</button>
                <button class="food-delete" onclick="removeFood('custom', ${index})">✕</button>
            </div>
        `;
    }).join('');
}

// 重設應用
function resetAll() {
    if (confirm('確定要重設所有自訂食物嗎？')) {
        appState.customFoods = [];
        appState.selectedItems.clear();
        document.getElementById('results').innerHTML = '<p class="placeholder">點擊「抽選食物」按鈕開始</p>';
        renderFoodLists();
        saveToLocalStorage();
    }
}

// 保存到本地儲存
function saveToLocalStorage() {
    const data = {
        customFoods: appState.customFoods,
        defaultFoods: appState.defaultFoods
    };
    localStorage.setItem('foodPickerData', JSON.stringify(data));
}

// 從本地儲存讀取
function loadFromLocalStorage() {
    const data = localStorage.getItem('foodPickerData');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            if (parsed.customFoods) {
                appState.customFoods = parsed.customFoods;
            }
            if (parsed.defaultFoods) {
                appState.defaultFoods = parsed.defaultFoods;
            }
        } catch (e) {
            console.error('讀取本地儲存失敗', e);
        }
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', init);
