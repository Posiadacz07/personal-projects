// Array where we will store our tasks
let tasks = [
    // { text: "Zaprogramować minimalną aplikację todoist", completed: true },
    // { text: "Nauczyć się nowej metody w JavaScript", completed: false },
    // { text: "Przetestować sortowanie zadań", completed: false },
    // { text: "Dodać wykres do aplikacji", completed: false }
];

// Get DOM elements (connecting JavaScript to HTML)
const taskList = document.getElementById('taskList');
const addTaskForm = document.getElementById('addTaskForm');
const taskInput = document.getElementById('taskInput');
const chartOverlay = document.getElementById('chart-svg-overlay'); 
const progressImage = document.getElementById('progressImage'); 

// Global variable for the Chart instance
let taskChart; 

// Paths for images with progress
const progressImages = {
    0: 'images/flower.png',
    20: 'images/progress1.png',
    40: 'images/progress2.png',
    60: 'images/progress3.png',
    80: 'images/progress4.png',
    100: 'images/progress5.png',
};

/**
 * Chart.js plugin to dynamically position and size the HTML overlay element
 * based on the chart's inner radius (cutout).
 */
const centerImagePlugin = {
    id: 'centerImage',
    // Executed after chart rendered
    afterDraw(chart) {
        // Calculate chart size and position
        const { chartArea } = chart;
        
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        
        const innerRadius = chart.getDatasetMeta(0).data[0].innerRadius;
        
        // Image size
        const diameter = innerRadius * 2 * 0.8;
        
        if (chartOverlay) {
            chartOverlay.style.width = `${diameter}px`;
            chartOverlay.style.height = `${diameter}px`;
            
            chartOverlay.style.left = `${centerX - diameter/2}px`;
            chartOverlay.style.top = `${centerY - diameter/2}px`;
        }
    }
};

/**
 * Calculates the number of completed and uncompleted tasks and the completion percentage.
 * @returns {object} Object with properties: completedCount, uncompletedCount, and percentage.
 */
function getChartData() {
    const completedCount = tasks.filter(task => task.completed).length;
    const uncompletedCount = tasks.length - completedCount;
    const totalCount = tasks.length;
    
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return { completedCount, uncompletedCount, percentage };
}

/**
 * Updates the image source based on the current completion percentage.
 */
function updateProgressImage() {
    if (!progressImage) return; 

    const { percentage } = getChartData();
    let imageKey = 0;

    // Logic for choosing image
    if (percentage == 100) {
        imageKey = 100; 
    } else if (percentage >= 80) {
        imageKey = 80; 
    } else if (percentage >= 60) {
        imageKey = 60; 
    } else if (percentage >= 40) {
        imageKey = 40; 
    } else if (percentage >= 20) {
        imageKey = 20; 
    } else {
        imageKey = 0; 
    }
    
    // Change src to new file path
    progressImage.src = progressImages[imageKey];
}


/**
 * Initializes the Doughnut Chart using Chart.js.
 */
function initChart() {
    const ctx = document.getElementById('taskChart').getContext('2d');
    const { completedCount, uncompletedCount } = getChartData();
    
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Todo'], 
            datasets: [{
                data: [completedCount, uncompletedCount],
                backgroundColor: ['#5cb85c', '#ffc107'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%', 
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Progress' }
            }
        },
        // Add dynamic image scaling
        plugins: [centerImagePlugin] 
    });
}

/**
 * Updates the chart data based on the current state of the 'tasks' array.
 */
function updateChart() {
    if (!taskChart) return;

    const { completedCount, uncompletedCount } = getChartData();
    
    taskChart.data.datasets[0].data = [completedCount, uncompletedCount];
    
    // Update image
    updateProgressImage(); 
    
    // CUpdate chart with image
    taskChart.update(); 
}

/**
 * Function to sort tasks: uncompleted tasks go to the top, completed tasks go to the bottom.
 */
function sortTasks() {
    tasks.sort((a, b) => {
        if (a.completed && !b.completed) { return 1; }
        if (!a.completed && b.completed) { return -1; }
        return 0;
    });
}

/**
 * Function responsible for rendering (displaying) the entire task list.
 */
function renderTasks() {
    sortTasks(); 
    taskList.innerHTML = ''; 

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'taskItem';
        if (task.completed) { listItem.classList.add('completed'); }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        
        checkbox.addEventListener('change', () => { toggleTaskStatus(index); });
        
        const taskText = document.createElement('span');
        taskText.className = 'taskText';
        taskText.textContent = task.text;

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        taskList.appendChild(listItem);
    });
    
    updateChart();
}

/**
 * Function for adding a new task.
 */
function addTask(text) {
    if (text.trim() === "") return;
    tasks.push({ text: text, completed: false }); 
    renderTasks(); 
}

/**
 * Function for updating a task's status (completed/uncompleted).
 */
function toggleTaskStatus(index) {
    tasks[index].completed = !tasks[index].completed; 
    renderTasks();
}

// 1. Handle the task adding form submission
addTaskForm.addEventListener('submit', (event) => {
    event.preventDefault(); 
    addTask(taskInput.value); 
    taskInput.value = ''; 
});

// 2. Initial rendering and chart initialization when the page loads
initChart(); 
renderTasks();