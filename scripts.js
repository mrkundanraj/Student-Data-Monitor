// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.add('active');
    
    // Find and activate the corresponding button
    const button = Array.from(document.querySelectorAll('.nav-button'))
        .find(btn => btn.textContent.toLowerCase().includes(sectionId));
    if (button) {
        button.classList.add('active');
    }

    // Refresh charts if showing dashboard
    if (sectionId === 'dashboard') {
        setTimeout(() => {
            const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
            const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
            updateDashboardCharts(students, attendance);
        }, 100);
    }
}

// Student management functions
function showStudentForm() {
    const form = document.getElementById('student-form');
    if (!form) {
        console.error('Student form not found');
        return;
    }
    
    // Reset the form
    const formElement = document.getElementById('studentForm');
    if (formElement) {
        formElement.reset();
        formElement.removeAttribute('data-editing-id');
    }
    
    // Show the form
    form.style.display = 'block';
    
    // Scroll to the form
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideStudentForm() {
    const form = document.getElementById('student-form');
    if (form) {
        form.style.display = 'none';
    }
}

// Storage keys
const STORAGE_KEYS = {
    STUDENTS: 'epr_students',
    ATTENDANCE: 'epr_attendance',
    MARKS: 'epr_marks'
};

// Add these loading functions at the top of the file
function showLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.opacity = '1';
    }
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.style.opacity = '0';
    }
}

// Initialize data store
function initializeDataStore() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MARKS)) {
        localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify({}));
    }
    loadStoredData();
    loadAttendanceTable();
    loadAttendanceRecords();
}

// Update the loadStoredData function
function loadStoredData() {
    showLoading();
    try {
        const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
        const tbody = document.querySelector('#student-list tbody');
        
        // Clear existing content
        tbody.innerHTML = '';
        
        // Add sample data if no students exist
        if (students.length === 0) {
            const sampleStudents = generateSampleData();
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sampleStudents));
            
            // Initialize marks for sample students
            const sampleMarks = generateSampleMarks(sampleStudents);
            localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(sampleMarks));
            
            // Initialize attendance for sample students
            const sampleAttendance = generateSampleAttendance(sampleStudents);
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(sampleAttendance));
        }
        
        // Get the updated students list
        const updatedStudents = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
        
        // Populate the table
        updatedStudents.forEach(student => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${student.contact}</td>
                <td>${student.course}</td>
                <td>${student.gender}</td>
                <td>${formatDate(student.dob)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editStudent('${student.id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
                    </div>
                </td>
            `;
        });
        
        updateDashboardStats();
        updateDashboardCharts(updatedStudents, JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'));
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading student data. Please refresh the page.');
    } finally {
        setTimeout(hideLoading, 500);
    }
}

// Add these helper functions for sample data generation
function generateSampleData() {
    const sampleStudents = [];
    const courses = ["Computer Science", "Electrical Engineering", "Mechanical Engineering"];
    const genders = ["male", "female"];
    
    // Generate 50 sample students
    for (let i = 1; i <= 50; i++) {
        const studentId = `2023${i.toString().padStart(3, '0')}`;
        const course = courses[Math.floor(Math.random() * courses.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const firstName = gender === "male" ? 
            ["Harpreet", "Gurpreet", "Manpreet", "Jaspreet", "Sukhpreet"][Math.floor(Math.random() * 5)] :
            ["Simran", "Harleen", "Navpreet", "Jasmeet", "Kiranpreet"][Math.floor(Math.random() * 5)];
        const lastName = ["Singh", "Kaur", "Sharma", "Kumar", "Verma"][Math.floor(Math.random() * 5)];
        
        sampleStudents.push({
            id: studentId,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            course: course,
            gender: gender,
            dob: `200${Math.floor(Math.random() * 5)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-${(Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0')}`,
            address: generateAddress(studentId)
        });
    }
    return sampleStudents;
}

function generateSampleMarks(students) {
    const marks = {};
    students.forEach(student => {
        marks[student.id] = {
            assignment1: Math.floor(Math.random() * 6 + 20).toString(), // 20-25
            assignment2: Math.floor(Math.random() * 6 + 20).toString(), // 20-25
            midsem1: Math.floor(Math.random() * 6 + 20).toString(),    // 20-25
            midsem2: Math.floor(Math.random() * 6 + 20).toString()     // 20-25
        };
    });
    return marks;
}

function generateSampleAttendance(students) {
    const attendance = [];
    const today = new Date();
    
    // Generate attendance for last 5 days
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        students.forEach(student => {
            attendance.push({
                date: dateString,
                studentId: student.id,
                studentName: student.name,
                course: student.course,
                status: Math.random() > 0.2 ? "present" : "absent" // 80% attendance rate
            });
        });
    }
    return attendance;
}

// Add this function to generate random addresses
function generateAddress(studentId) {
    const punjabStreets = [
        'Mall Road, Amritsar',
        'Lawrence Road, Amritsar',
        'GT Road, Amritsar',
        'Queens Road, Amritsar',
        'Hall Bazaar, Amritsar'
    ];

    const biharCities = [
        'Patna',
        'Gaya',
        'Muzaffarpur',
        'Bhagalpur',
        'Darbhanga'
    ];

    const otherStates = [
        'Delhi',
        'Mumbai, Maharashtra',
        'Bangalore, Karnataka',
        'Chennai, Tamil Nadu',
        'Kolkata, West Bengal'
    ];

    const studentNum = parseInt(studentId.slice(-3));

    // First 20 students (001-020) get Punjab address
    if (studentNum <= 20) {
        const street = punjabStreets[Math.floor(Math.random() * punjabStreets.length)];
        return `${Math.floor(Math.random() * 100 + 1)}, ${street}, Punjab`;
    }
    // Next 15 students (021-035) get Bihar address
    else if (studentNum <= 35) {
        const city = biharCities[Math.floor(Math.random() * biharCities.length)];
        return `${Math.floor(Math.random() * 100 + 1)}, ${city}, Bihar`;
    }
    // Last 15 students (036-050) get random state addresses
    else {
        const state = otherStates[Math.floor(Math.random() * otherStates.length)];
        return `${Math.floor(Math.random() * 100 + 1)}, ${state}`;
    }
}

// Update the addStudent function to include address generation
function addStudent(event) {
    showLoading();
    event.preventDefault();
    const form = event.target;
    
    const studentData = {
        id: form.querySelector('input[name="student-id"]').value,
        name: form.querySelector('input[name="full-name"]').value,
        email: form.querySelector('input[name="email"]').value,
        contact: formatPhoneNumber(form.querySelector('input[name="contact"]').value),
        dob: form.querySelector('input[name="dob"]').value,
        gender: form.querySelector('select[name="gender"]').value,
        course: form.querySelector('select[name="course"]').value,
        address: generateAddress(form.querySelector('input[name="student-id"]').value)
    };

    // Get marks data
    const marksInputs = form.querySelectorAll('.marks-edit-grid input[type="number"]');
    const marksData = {
        assignment1: marksInputs[0].value || '0',
        assignment2: marksInputs[1].value || '0',
        midsem1: marksInputs[2].value || '0',
        midsem2: marksInputs[3].value || '0'
    };

    // Validate data
    if (!validateStudentData(studentData)) {
        return;
    }

    // Save to localStorage
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
    
    // Check for duplicate ID
    if (students.some(student => student.id === studentData.id)) {
        alert('Student ID already exists!');
        return;
    }

    students.push(studentData);
    marks[studentData.id] = marksData;

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));

    // Reset form and refresh display
    form.reset();
    document.getElementById('student-form').style.display = 'none';
    loadStoredData();
    alert('Student added successfully!');
    setTimeout(hideLoading, 500);
}

// Helper functions
function formatPhoneNumber(number) {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // Check if number already has country code
    if (cleaned.startsWith('91')) {
        return `+${cleaned}`;
    }
    
    // Add country code if it's a 10-digit number
    if (cleaned.length === 10) {
        return `+91${cleaned}`;
    }
    
    return cleaned; // Return as is if validation fails
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function validateStudentData(data) {
    if (!data.id || !data.name || !data.email || !data.contact || !data.course || !data.gender || !data.dob || !data.address) {
        alert('Please fill all required fields');
        return false;
    }

    // Remove +91 and any non-digit characters for validation
    const contactNumber = data.contact.replace(/^\+91/, '').replace(/\D/g, '');
    
    if (contactNumber.length !== 10) {
        alert('Please enter a valid 10-digit contact number');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address');
        return false;
    }

    // Validate date of birth
    const dob = new Date(data.dob);
    const today = new Date();
    if (dob >= today) {
        alert('Please enter a valid date of birth');
        return false;
    }

    return true;
}

// Delete student function
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
        const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
        
        const filteredStudents = students.filter(student => student.id !== studentId);
        delete marks[studentId];

        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filteredStudents));
        localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));
        
        loadStoredData();
        alert('Student deleted successfully!');
    }
}

// Update dashboard stats
function updateDashboardStats() {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');

    // Update basic stats
    document.getElementById('total-students').textContent = students.length;

    // Calculate attendance percentage
    const presentCount = attendance.filter(record => record.status === 'present').length;
    const totalAttendance = attendance.length;
    const attendancePercentage = totalAttendance > 0 
        ? Math.round((presentCount / totalAttendance) * 100) 
        : 0;
    document.getElementById('avg-attendance').textContent = `${attendancePercentage}%`;

    // Update charts
    updateDashboardCharts(students, attendance);
}

// Update the updateDashboardCharts function
function updateDashboardCharts(students, attendance) {
    // Common chart options for professional 3D pie charts
    const commonOptions = {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0,
                depth: 50,
                viewDistance: 25
            },
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                    [0, '#f8f9fa'],
                    [1, '#ffffff']
                ]
            }
        },
        title: {
            text: '',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 45,
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                    style: {
                        color: '#333',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        textOutline: 'none'
                    },
                    distance: 20,
                    connectorWidth: 1,
                    connectorColor: '#666'
                },
                showInLegend: true,
                startAngle: 0,
                endAngle: 360,
                center: ['50%', '50%'],
                borderWidth: 0,  // Remove borders between segments
                edgeWidth: 0,    // Remove edge lines
                edgeColor: 'none' // Remove edge color
            }
        },
        legend: {
            enabled: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
                fontSize: '11px',
                fontWeight: 'normal',
                color: '#666666'
            },
            itemHoverStyle: {
                color: '#000000'
            },
            itemDistance: 8,
            padding: 10,
            symbolPadding: 10,
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 6
        },
        tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
                        'Count: <b>{point.y}</b><br/>' +
                        'Percentage: <b>{point.percentage:.1f}%</b>',
            style: {
                fontSize: '12px'
            }
        },
        credits: {
            enabled: false
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                distance: 10,
                                style: {
                                    fontSize: '10px'
                                }
                            }
                        }
                    },
                    legend: {
                        itemStyle: {
                            fontSize: '10px'
                        }
                    }
                }
            }]
        }
    };

    // Course Distribution Chart
    const courseCounts = students.reduce((acc, student) => {
        acc[student.course] = (acc[student.course] || 0) + 1;
        return acc;
    }, {});

    const courseData = Object.entries(courseCounts).map(([name, y]) => ({
        name,
        y,
        color: name === 'Computer Science' ? '#4285f4' :
               name === 'Electrical Engineering' ? '#34a853' :
               '#fbbc05'
    }));

    const courseChart = new Highcharts.Chart('courseDistributionChart', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0,
                depth: 45,
                viewDistance: 25
            },
            backgroundColor: {
                linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                stops: [
                    [0, '#f8f9fa'],
                    [1, '#ffffff']
                ]
            },
            height: '100%'
        },
        title: {
            text: null
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 45,
                innerSize: '50%',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b><br>{point.percentage:.1f}%',
                    style: {
                        color: '#333',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        textOutline: 'none'
                    },
                    distance: 20,
                    connectorWidth: 1,
                    connectorColor: '#666'
                },
                showInLegend: true,
                startAngle: 0,
                endAngle: 360,
                center: ['50%', '50%'],
                borderWidth: 0,  // Remove borders between segments
                edgeWidth: 0,    // Remove edge lines
                edgeColor: 'none' // Remove edge color
            }
        },
        series: [{
            name: 'Course Distribution',
            data: courseData.map(item => ({
                name: item.name,
                y: item.y,
                color: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [
                        [0, item.name === 'Computer Science' ? '#4285f4' : 
                            item.name === 'Electrical Engineering' ? '#34a853' : '#fbbc05'],
                        [1, item.name === 'Computer Science' ? '#1a73e8' : 
                            item.name === 'Electrical Engineering' ? '#2d8544' : '#f2a103']
                    ]
                },
                selected: false,
                sliced: false
            }))
        }],
        tooltip: {
            headerFormat: '',
            pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b><br/>' +
                        'Students: <b>{point.y}</b><br/>' +
                        'Percentage: <b>{point.percentage:.1f}%</b>',
            style: {
                fontSize: '12px'
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderWidth: 0,
            shadow: true
        },
        legend: {
            enabled: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            itemStyle: {
                fontSize: '11px',
                fontWeight: 'normal',
                color: '#666666'
            },
            itemHoverStyle: {
                color: '#000000'
            },
            itemDistance: 8,
            padding: 10,
            symbolPadding: 10,
            symbolHeight: 12,
            symbolWidth: 12,
            symbolRadius: 6
        },
        credits: {
            enabled: false
        },
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                distance: 10,
                                style: {
                                    fontSize: '10px'
                                }
                            }
                        }
                    },
                    legend: {
                        itemStyle: {
                            fontSize: '10px'
                        }
                    }
                }
            }]
        }
    });

    // Add smooth rotation
    let dragStart = null;
    let startAlpha = 45;
    let startBeta = 0;

    courseChart.container.addEventListener('mousedown', function(e) {
        e.preventDefault();
        dragStart = {
            x: e.clientX,
            y: e.clientY
        };
    });

    document.addEventListener('mousemove', function(e) {
        if (dragStart) {
            e.preventDefault();
            
            const dragEnd = {
                x: e.clientX,
                y: e.clientY
            };

            const dx = dragEnd.x - dragStart.x;
            const dy = dragEnd.y - dragStart.y;

            // Smoother rotation with limited angles
            const beta = Math.min(Math.max(startBeta + (dx / 100), -45), 45);
            const alpha = Math.min(Math.max(startAlpha + (dy / 100), 0), 90);

            courseChart.update({
                chart: {
                    options3d: {
                        alpha: alpha,
                        beta: beta
                    }
                }
            }, false);
        }
    });

    document.addEventListener('mouseup', function() {
        if (dragStart) {
            startAlpha = courseChart.options.chart.options3d.alpha;
            startBeta = courseChart.options.chart.options3d.beta;
            dragStart = null;
        }
    });

    // Overall Attendance Chart
    const presentCount = attendance.filter(record => record.status === 'present').length;
    const absentCount = attendance.filter(record => record.status === 'absent').length;

    const attendanceChart = new Highcharts.Chart('overallAttendanceChart', {
        ...commonOptions,
        plotOptions: {
            pie: {
                ...commonOptions.plotOptions.pie,
                depth: 45,
                innerSize: '50%'
            }
        },
        series: [{
            name: 'Attendance',
            data: [
                { name: 'Present', y: presentCount, color: '#4CAF50' },
                { name: 'Absent', y: absentCount, color: '#f44336' }
            ]
        }]
    });

    // Gender Distribution Chart
    const genderCounts = students.reduce((acc, student) => {
        acc[student.gender] = (acc[student.gender] || 0) + 1;
        return acc;
    }, {});

    const genderData = Object.entries(genderCounts).map(([name, y]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        y,
        color: name === 'male' ? '#2196F3' : '#E91E63'
    }));

    const genderChart = new Highcharts.Chart('genderDistributionChart', {
        ...commonOptions,
        plotOptions: {
            pie: {
                ...commonOptions.plotOptions.pie,
                innerSize: '45%'
            }
        },
        series: [{
            name: 'Gender Distribution',
            data: genderData
        }]
    });

    // City Distribution Chart
    const cityDistribution = students.reduce((acc, student) => {
        if (!student.address) return acc;
        const state = student.address.split(',').pop().trim();
        acc[state] = (acc[state] || 0) + 1;
        return acc;
    }, {});

    const cityColors = {
        'Punjab': '#4285f4',
        'Bihar': '#34a853',
        'Maharashtra': '#fbbc05',
        'Karnataka': '#ea4335',
        'Tamil Nadu': '#46bdc6',
        'West Bengal': '#db4437',
        'Delhi': '#f4b400'
    };

    const cityData = Object.entries(cityDistribution).map(([name, y]) => ({
        name,
        y,
        color: cityColors[name] || '#808080'
    }));

    const cityChart = new Highcharts.Chart('stateDistributionChart', {
        ...commonOptions,
        title: {
            text: 'State-wise Student Distribution',
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        plotOptions: {
            pie: {
                ...commonOptions.plotOptions.pie,
                depth: 45,
                innerSize: '40%'
            }
        },
        series: [{
            name: 'Students',
            data: cityData
        }]
    });

    // Add back the Monthly Attendance Trend Chart
    const attendanceTrendChart = new Highcharts.Chart('attendanceTrendChart', {
        chart: {
            type: 'column',
            options3d: {
                enabled: true,
                alpha: 15,
                beta: 15,
                depth: 50,
                viewDistance: 25
            }
        },
        title: { text: null },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            labels: { style: { fontSize: '11px' } }
        },
        yAxis: {
            title: { text: 'Attendance %' },
            max: 100
        },
        plotOptions: {
            column: {
                depth: 25,
                colorByPoint: true
            }
        },
        series: [{
            name: 'Monthly Attendance',
            data: [85, 88, 92, 87, 90, 93],
            colors: ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#4285f4', '#34a853']
        }]
    });

    // Update the interactive rotation array to include the new chart
    [courseChart, attendanceChart, genderChart, cityChart, attendanceTrendChart].forEach(chart => {
        let dragStart;
        let startAlpha;
        let startBeta;

        chart.container.addEventListener('mousedown', function(e) {
            dragStart = {
                x: e.clientX,
                y: e.clientY
            };
            startAlpha = chart.options.chart.options3d.alpha;
            startBeta = chart.options.chart.options3d.beta;
        });

        document.addEventListener('mousemove', function(e) {
            if (dragStart) {
                e.preventDefault();
                const dragEnd = {
                    x: e.clientX,
                    y: e.clientY
                };

                const dx = dragEnd.x - dragStart.x;
                const dy = dragEnd.y - dragStart.y;

                const beta = startBeta + (dx / 50);
                const alpha = startAlpha + (dy / 50);

                chart.update({
                    chart: {
                        options3d: {
                            alpha: alpha,
                            beta: beta
                        }
                    }
                }, false);
            }
        });

        document.addEventListener('mouseup', function() {
            dragStart = null;
        });
    });

    // Add this after creating both charts
    window.addEventListener('resize', function() {
        courseChart.reflow();
        attendanceChart.reflow();
    });
}

// Helper function to calculate average marks
function calculateAverage(studentId) {
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}')[studentId] || {};
    const values = Object.values(marks).map(Number);
    return values.length ? values.reduce((a, b) => a + b) / values.length : 0;
}

// Helper function to get performance colors
function getPerformanceColor(range, stop) {
    const colors = {
        '90-100%': ['#4CAF50', '#388E3C'],
        '80-89%': ['#8BC34A', '#689F38'],
        '70-79%': ['#FFC107', '#FFA000'],
        '60-69%': ['#FF9800', '#F57C00'],
        'Below 60%': ['#F44336', '#D32F2F']
    };
    return colors[range][stop];
}

// Add these attendance management functions
function loadAttendanceTable() {
    const courseFilter = document.getElementById('course-filter').value;
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const tbody = document.querySelector('#attendance-marking tbody');
    tbody.innerHTML = '';
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-date').value = today;
    
    // Filter students by course
    const filteredStudents = courseFilter 
        ? students.filter(student => student.course === courseFilter)
        : students;
    
    filteredStudents.forEach(student => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.course}</td>
            <td>
                <div class="status-toggle">
                    <label>
                        <input type="radio" name="status-${student.id}" value="present" checked>
                        Present
                    </label>
                    <label>
                        <input type="radio" name="status-${student.id}" value="absent">
                        Absent
                    </label>
                </div>
            </td>
        `;
    });
}

function markAttendance() {
    showLoading();
    const date = document.getElementById('attendance-date').value;
    if (!date) {
        alert('Please select a date');
        return;
    }

    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const courseFilter = document.getElementById('course-filter').value;
    
    // Filter students by course
    const filteredStudents = courseFilter 
        ? students.filter(student => student.course === courseFilter)
        : students;

    const newRecords = [];
    filteredStudents.forEach(student => {
        const status = document.querySelector(`input[name="status-${student.id}"]:checked`).value;
        newRecords.push({
            date: date,
            studentId: student.id,
            studentName: student.name,
            course: student.course,
            status: status
        });
    });

    // Remove existing attendance for this date and course
    const updatedAttendance = attendance.filter(record => {
        if (courseFilter) {
            return record.date !== date || record.course !== courseFilter;
        }
        return record.date !== date;
    });

    // Add new attendance records
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, 
        JSON.stringify([...updatedAttendance, ...newRecords])
    );

    loadAttendanceRecords();
    updateDashboardStats();
    alert('Attendance marked successfully!');
    setTimeout(hideLoading, 500);
}

function loadAttendanceRecords() {
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    const courseFilter = document.getElementById('records-course-filter').value;
    const dateFilter = document.getElementById('records-date-filter').value;
    
    let filteredRecords = attendance;
    
    if (courseFilter) {
        filteredRecords = filteredRecords.filter(record => record.course === courseFilter);
    }
    if (dateFilter) {
        filteredRecords = filteredRecords.filter(record => record.date === dateFilter);
    }

    const tbody = document.querySelector('#attendance-records tbody');
    tbody.innerHTML = '';
    
    filteredRecords
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(record => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${formatDate(record.date)}</td>
                <td>${record.studentId}</td>
                <td>${record.studentName}</td>
                <td>${record.course}</td>
                <td class="status-${record.status}">${
                    record.status.charAt(0).toUpperCase() + record.status.slice(1)
                }</td>
            `;
        });
}

// Update the searchAndShowProfile function
function searchAndShowProfile() {
    const studentId = document.getElementById('profile-search').value;
    if (!studentId) {
        alert('Please enter a Student ID');
        return;
    }

    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
    const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found');
        return;
    }

    // Show profile content
    document.querySelector('.profile-content').style.display = 'block';

    // Fill basic information
    document.getElementById('profile-name').textContent = student.name;
    document.getElementById('profile-id').textContent = student.id;
    document.getElementById('profile-course').textContent = student.course;
    document.getElementById('profile-gender').textContent = student.gender.charAt(0).toUpperCase() + student.gender.slice(1);
    document.getElementById('profile-email').textContent = student.email;
    document.getElementById('profile-contact').textContent = student.contact;
    document.getElementById('profile-address').textContent = student.address;

    // Get student marks
    const studentMarks = marks[studentId] || {
        assignment1: '0',
        assignment2: '0',
        midsem1: '0',
        midsem2: '0'
    };

    // Calculate total marks and attendance
    const totalMarks = Object.values(studentMarks).reduce((sum, mark) => sum + (parseInt(mark) || 0), 0);
    const studentAttendance = attendance.filter(record => record.studentId === studentId);
    const presentCount = studentAttendance.filter(record => record.status === 'present').length;
    const totalAttendance = studentAttendance.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // Update the performance summary
    document.getElementById('total-marks').textContent = totalMarks;
    document.getElementById('attendance-rate').textContent = attendanceRate;

    // Create a table for Internal Assessment
    const marksTable = `
        <table class="marks-table">
            <thead>
                <tr>
                    <th>Assessment</th>
                    <th>Marks (out of 25)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Assignment 1</td>
                    <td>${studentMarks.assignment1 || '0'}</td>
                </tr>
                <tr>
                    <td>Assignment 2</td>
                    <td>${studentMarks.assignment2 || '0'}</td>
                </tr>
                <tr>
                    <td>Mid Sem 1</td>
                    <td>${studentMarks.midsem1 || '0'}</td>
                </tr>
                <tr>
                    <td>Mid Sem 2</td>
                    <td>${studentMarks.midsem2 || '0'}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>${totalMarks}</strong></td>
                </tr>
            </tbody>
        </table>
    `;

    // Create a table for Attendance Overview
    const attendanceTable = `
        <table class="attendance-table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                <tr class="present-row">
                    <td>Present</td>
                    <td>${presentCount}</td>
                    <td>${attendanceRate}%</td>
                </tr>
                <tr class="absent-row">
                    <td>Absent</td>
                    <td>${totalAttendance - presentCount}</td>
                    <td>${100 - attendanceRate}%</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total Classes</strong></td>
                    <td><strong>${totalAttendance}</strong></td>
                    <td><strong>100%</strong></td>
                </tr>
            </tbody>
        </table>
    `;

    // Update the content of chart boxes
    document.getElementById('marksChart').innerHTML = marksTable;
    document.getElementById('attendanceChart').innerHTML = attendanceTable;
}

// Add this function for editing students
function editStudent(studentId) {
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
        alert('Student not found');
        return;
    }

    // Show the form
    const form = document.getElementById('student-form');
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });

    // Fill the form with student data
    const formElements = form.querySelector('form');
    formElements.querySelector('input[name="full-name"]').value = student.name;
    formElements.querySelector('input[name="student-id"]').value = student.id;
    formElements.querySelector('input[name="email"]').value = student.email;
    formElements.querySelector('input[name="contact"]').value = student.contact.replace(/^\+91/, '');
    formElements.querySelector('input[name="dob"]').value = student.dob;
    formElements.querySelector('select[name="gender"]').value = student.gender;
    formElements.querySelector('select[name="course"]').value = student.course;
    formElements.querySelector('textarea[name="address"]').value = student.address || '';

    // Fill marks data
    const studentMarks = marks[studentId] || {};
    formElements.querySelector('input[name="assignment1"]').value = studentMarks.assignment1 || '';
    formElements.querySelector('input[name="assignment2"]').value = studentMarks.assignment2 || '';
    formElements.querySelector('input[name="midsem1"]').value = studentMarks.midsem1 || '';
    formElements.querySelector('input[name="midsem2"]').value = studentMarks.midsem2 || '';

    // Change form submit behavior
    const submitButton = formElements.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Student';
    
    // Store original student ID for reference
    formElements.setAttribute('data-editing-id', studentId);
    
    // Change form submission handler
    formElements.onsubmit = updateStudentData;
}

// Add function to handle student update
function updateStudentData(event) {
    event.preventDefault();
    const form = event.target;
    const originalId = form.getAttribute('data-editing-id');

    const studentData = {
        id: form.querySelector('input[name="student-id"]').value,
        name: form.querySelector('input[name="full-name"]').value,
        email: form.querySelector('input[name="email"]').value,
        contact: formatPhoneNumber(form.querySelector('input[name="contact"]').value),
        dob: form.querySelector('input[name="dob"]').value,
        gender: form.querySelector('select[name="gender"]').value,
        course: form.querySelector('select[name="course"]').value,
        address: form.querySelector('textarea[name="address"]').value
    };

    // Get marks data
    const marksData = {
        assignment1: form.querySelector('input[name="assignment1"]').value || '0',
        assignment2: form.querySelector('input[name="assignment2"]').value || '0',
        midsem1: form.querySelector('input[name="midsem1"]').value || '0',
        midsem2: form.querySelector('input[name="midsem2"]').value || '0'
    };

    // Validate data
    if (!validateStudentData(studentData)) {
        return;
    }

    // Update in localStorage
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');

    // Check if new ID already exists (except for the current student)
    if (studentData.id !== originalId && students.some(s => s.id === studentData.id)) {
        alert('Student ID already exists!');
        return;
    }

    // Update student data
    const studentIndex = students.findIndex(s => s.id === originalId);
    if (studentIndex !== -1) {
        students[studentIndex] = studentData;
        
        // Update marks data
        delete marks[originalId];
        marks[studentData.id] = marksData;

        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));

        // Reset form and update display
        form.reset();
        form.removeAttribute('data-editing-id');
        form.onsubmit = addStudent;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Save Student';
        document.getElementById('student-form').style.display = 'none';
        
        loadStoredData();
        alert('Student updated successfully!');
    }
}

// Add an input event listener for the contact field
document.addEventListener('DOMContentLoaded', function() {
    const contactInput = document.querySelector('input[name="contact"]');
    if (contactInput) {
        contactInput.addEventListener('input', function(e) {
            // Remove any non-digit characters
            let value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            // Update input value
            e.target.value = value;
        });
    }
});

// Update the initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Remove Chart.js initialization since we're using Highcharts
    initializeDataStore();
    showSection('dashboard');
    
    // Add form submission handler
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleStudentSubmit);
    }
});

// Add this function to clear attendance history
function clearAttendanceHistory() {
    if (confirm('Are you sure you want to clear all attendance records? This action cannot be undone.')) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
        loadAttendanceRecords();
        updateDashboardStats();
        alert('Attendance history cleared successfully');
    }
}

// Update the export attendance function
function exportAttendance() {
    // Show loading state
    const exportBtn = document.querySelector('.btn-export');
    exportBtn.classList.add('loading');
    
    try {
        const attendance = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
        if (attendance.length === 0) {
            alert('No attendance records to export');
            return;
        }

        // Get filter values
        const courseFilter = document.getElementById('records-course-filter').value;
        const dateFilter = document.getElementById('records-date-filter').value;

        if (!courseFilter && !dateFilter) {
            alert('Please select a course and date to export');
            return;
        }

        // Filter records
        let recordsToExport = attendance;

        if (courseFilter) {
            recordsToExport = recordsToExport.filter(record => record.course === courseFilter);
        }
        if (dateFilter) {
            recordsToExport = recordsToExport.filter(record => record.date === dateFilter);
        }

        if (recordsToExport.length === 0) {
            alert('No attendance records found for selected filters');
            return;
        }

        // Sort records by student name
        recordsToExport.sort((a, b) => a.studentName.localeCompare(b.studentName));

        // Create worksheet data
        const wsData = [
            ['Attendance Report'],
            [`Course: ${courseFilter || 'All Courses'}`],
            [`Date: ${dateFilter ? formatDate(dateFilter) : 'All Dates'}`],
            [], // Empty row for spacing
            ['Student ID', 'Student Name', 'Course', 'Status', 'Date'] // Headers
        ];

        // Add records
        recordsToExport.forEach(record => {
            wsData.push([
                record.studentId,
                record.studentName,
                record.course,
                record.status.charAt(0).toUpperCase() + record.status.slice(1),
                formatDate(record.date)
            ]);
        });

        // Add summary
        const presentCount = recordsToExport.filter(r => r.status === 'present').length;
        const totalCount = recordsToExport.length;
        const attendanceRate = Math.round((presentCount / totalCount) * 100);

        wsData.push(
            [], // Empty row
            ['Summary'],
            ['Total Students', totalCount],
            ['Present', presentCount],
            ['Absent', totalCount - presentCount],
            ['Attendance Rate', `${attendanceRate}%`]
        );

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = [
            { wch: 12 }, // Student ID
            { wch: 25 }, // Student Name
            { wch: 20 }, // Course
            { wch: 10 }, // Status
            { wch: 12 }  // Date
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');

        // Generate filename
        const dateStr = dateFilter ? `_${dateFilter}` : '';
        const courseStr = courseFilter ? `_${courseFilter.replace(/\s+/g, '_')}` : '';
        const filename = `attendance_report${dateStr}${courseStr}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);
        
        alert('Attendance report exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting attendance records. Please try again.');
    } finally {
        // Remove loading state
        exportBtn.classList.remove('loading');
    }
}

// Update the handleStudentSubmit function
function handleStudentSubmit(event) {
    event.preventDefault();
    showLoading();
    
    try {
        const form = event.target;
        const editingId = form.getAttribute('data-editing-id');
        
        // If we have an editing ID, we're updating an existing student
        if (editingId) {
            updateStudentData(event);
            return;
        }
        
        // Otherwise, we're adding a new student
        const studentData = {
            id: form.querySelector('input[name="student-id"]').value.trim(),
            name: form.querySelector('input[name="full-name"]').value.trim(),
            email: form.querySelector('input[name="email"]').value.trim(),
            contact: formatPhoneNumber(form.querySelector('input[name="contact"]').value.trim()),
            dob: form.querySelector('input[name="dob"]').value,
            gender: form.querySelector('select[name="gender"]').value,
            course: form.querySelector('select[name="course"]').value,
            address: form.querySelector('textarea[name="address"]').value.trim()
        };

        // Get marks data
        const marksData = {
            assignment1: form.querySelector('input[name="assignment1"]').value || '0',
            assignment2: form.querySelector('input[name="assignment2"]').value || '0',
            midsem1: form.querySelector('input[name="midsem1"]').value || '0',
            midsem2: form.querySelector('input[name="midsem2"]').value || '0'
        };

        // Validate data
        if (!validateStudentData(studentData)) {
            return;
        }

        // Save to localStorage
        const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
        const marks = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKS) || '{}');
        
        // Check for duplicate ID
        if (students.some(student => student.id === studentData.id)) {
            alert('Student ID already exists!');
            return;
        }

        // Add new student and marks
        students.push(studentData);
        marks[studentData.id] = marksData;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks));

        // Reset form and refresh display
        form.reset();
        hideStudentForm();
        loadStoredData();
        alert('Student added successfully!');
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Error saving student. Please try again.');
    } finally {
        hideLoading();
    }
}