document.addEventListener('DOMContentLoaded', function () {
    // 固定的开销数据
    const data = [
        { name: "Entertainment", color: "#f94144", amount: 300 },
        { name: "Rent", color: "#f3722c", amount: 700 },
        { name: "Diet", color: "#90be6d", amount: 200 },
        { name: "Other fees", color: "#577590", amount: 100 }
    ];

    // 详细的开销数据
    const expenseDetails = {
        "Entertainment": [
            { date: "2024-10-01", amount: 80, description: "Movie tickets" },
            { date: "2024-10-05", amount: 120, description: "Concert tickets" },
            { date: "2024-10-12", amount: 100, description: "Amusement park visit" }
        ],
        "Rent": [
            { date: "2024-10-01", amount: 700, description: "Monthly rent payment" }
        ],
        "Diet": [
            { date: "2024-10-02", amount: 50, description: "Groceries" },
            { date: "2024-10-06", amount: 80, description: "Dining out" },
            { date: "2024-10-09", amount: 70, description: "Groceries" }
        ],
        "Other fees": [
            { date: "2024-10-03", amount: 40, description: "Internet bill" },
            { date: "2024-10-07", amount: 60, description: "Utility bill" }
        ]
    };

    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

    // 生成饼图和更新详情列表的函数
    updatePieChart(data, totalAmount);
    updateDetailsList(data);

    // 保存详细的开销数据到 localStorage
    localStorage.setItem('expenseDetails', JSON.stringify(expenseDetails));

    // Upload 按钮点击后跳转到上传页面
    const uploadButton = document.getElementById('upload-button');
    if (uploadButton) {
        uploadButton.addEventListener('click', function() {
            window.location.href = 'upload.html';  // 跳转到上传页面
        });
    }

    // 生成饼图函数
    function updatePieChart(data, totalAmount) {
        const containerWidth = 600;
        const containerHeight = 600;
        const width = 350;
        const height = 350;
        const radius = Math.min(width, height) / 2 - 30;

        const pie = d3.pie().value(d => d.amount).sort(null);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const labelArc = d3.arc().innerRadius(radius + 20).outerRadius(radius + 20);

        const svg = d3.select('#pie-chart')
            .attr('width', containerWidth)
            .attr('height', containerHeight)
            .append('g')
            .attr('transform', `translate(${containerWidth / 2}, ${containerHeight / 2})`);

        const arcs = svg.selectAll('arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .transition()  // 添加这行
            .duration(750)  // 添加这行
            .attrTween('d', function(d) {  // 添加这个函数
              var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
              return function(t) {
                return arc(interpolate(t));
              };
            });

        arcs.append('text')
            .attr('transform', function(d) {
                return `translate(${labelArc.centroid(d)})`;
            })
            .attr('dy', '0.35em')
            .attr('text-anchor', function(d) {
                return (d.endAngle + d.startAngle) / 2 > Math.PI ? 'end' : 'start';
            })
            .text(function(d) {
                const percentage = ((d.data.amount / totalAmount) * 100).toFixed(2);
                return `${d.data.name} ${percentage}%`;
            })
            .style('font-size', '12px')
            .style('fill', '#000');
    }

    // 更新详情列表函数
    function updateDetailsList(data) {
        const detailsList = document.getElementById('details-list');
        detailsList.innerHTML = '';  // 清空现有的列表内容
        data.forEach(d => {
            const listItem = document.createElement('li');
            listItem.innerText = `${d.name}: $${d.amount.toFixed(2)}`;
            listItem.style.cursor = 'pointer';  // 设置为可点击

            // 添加点击事件跳转到详细页面
            listItem.addEventListener('click', () => {
                localStorage.setItem('category', d.name);  // 将类别存储到 localStorage
                window.location.href = 'expense-details.html';  // 跳转到详细页面
            });

            detailsList.appendChild(listItem);
        });
    }

    document.querySelector('.file-upload-container form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('expenseFile');
        const file = fileInput.files[0];
        
        if (file) {
            const formData = new FormData();
            formData.append('expenseFile', file);
    
            fetch('/upload-expense-file', {  // 替换为您的服务器端点
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert('File uploaded successfully!');
                // 处理响应，例如显示上传的数据或清除表单
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while uploading the file.');
            });
        } else {
            alert('Please select a file to upload.');
        }
    });
});