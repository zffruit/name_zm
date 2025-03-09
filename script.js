// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const nameInput = document.getElementById('name-input');
    const fontSelect = document.getElementById('font-select');
    const colorInput = document.getElementById('color-input');
    const sizeRange = document.getElementById('size-range');
    const sizeValue = document.getElementById('size-value');
    const styleSelect = document.getElementById('style-select');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const canvas = document.getElementById('signature-canvas');
    const ctx = canvas.getContext('2d');
    
    // 文件上传相关元素
    const customFontInput = document.getElementById('custom-font-input');
    const customFontBtn = document.getElementById('custom-font-btn');
    const selectedFontName = document.getElementById('selected-font-name');
    
    // 文件夹上传相关元素
    const fontFolderInput = document.getElementById('font-folder-input');
    const fontFolderBtn = document.getElementById('font-folder-btn');
    const loadedFontsCount = document.getElementById('loaded-fonts-count');
    const loadedFontsList = document.getElementById('loaded-fonts-list');
    
    // 创建模式切换相关元素
    const textModeTab = document.getElementById('text-mode-tab');
    const handwritingModeTab = document.getElementById('handwriting-mode-tab');
    const textInputPanel = document.getElementById('text-input-panel');
    const handwritingPanel = document.getElementById('handwriting-panel');
    
    // 手写签名相关元素
    const handwritingCanvas = document.getElementById('handwriting-canvas');
    const handwritingCtx = handwritingCanvas.getContext('2d');
    const penColor = document.getElementById('pen-color');
    const penSize = document.getElementById('pen-size');
    const penSizeValue = document.getElementById('pen-size-value');
    const handwritingStyle = document.getElementById('handwriting-style');
    const clearHandwritingBtn = document.getElementById('clear-handwriting');
    const applyHandwritingBtn = document.getElementById('apply-handwriting');
    
    // 切换选项卡相关元素
    const fileTabBtn = document.getElementById('file-tab-btn');
    const folderTabBtn = document.getElementById('folder-tab-btn');
    const fileUploadPanel = document.getElementById('file-upload-panel');
    const folderUploadPanel = document.getElementById('folder-upload-panel');
    
    // 存储自定义字体对象
    let customFontList = [];
    let currentCustomFontIndex = -1;
    
    // 手写相关变量
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let handwritingPoints = []; // 存储所有绘制点
    let handwritingData = null; // 存储最终的手写图像数据
    
    // 更新字体大小显示
    sizeRange.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
    });
    
    // 更新笔触大小显示
    penSize.addEventListener('input', function() {
        penSizeValue.textContent = this.value + 'px';
        
        // 更新手写画笔预览
        updatePenPreview();
    });
    
    // 绘制手写画笔预览函数
    function updatePenPreview() {
        // 暂时不实现预览，如果需要可以添加一个小的预览元素
    }
    
    // 模式切换事件
    textModeTab.addEventListener('click', function() {
        switchCreationMode('text');
    });
    
    handwritingModeTab.addEventListener('click', function() {
        switchCreationMode('handwriting');
        setupHandwritingCanvas(); // 初始化手写画布
    });
    
    // 切换创建模式函数
    function switchCreationMode(mode) {
        if (mode === 'text') {
            textModeTab.classList.add('active');
            handwritingModeTab.classList.remove('active');
            textInputPanel.classList.add('active');
            handwritingPanel.classList.remove('active');
        } else if (mode === 'handwriting') {
            handwritingModeTab.classList.add('active');
            textModeTab.classList.remove('active');
            handwritingPanel.classList.add('active');
            textInputPanel.classList.remove('active');
        }
    }
    
    // 选项卡切换事件
    fileTabBtn.addEventListener('click', function() {
        switchTab('file');
    });
    
    folderTabBtn.addEventListener('click', function() {
        switchTab('folder');
    });
    
    // 切换选项卡函数
    function switchTab(tabName) {
        if (tabName === 'file') {
            fileTabBtn.classList.add('active');
            folderTabBtn.classList.remove('active');
            fileUploadPanel.classList.add('active');
            folderUploadPanel.classList.remove('active');
        } else if (tabName === 'folder') {
            folderTabBtn.classList.add('active');
            fileTabBtn.classList.remove('active');
            folderUploadPanel.classList.add('active');
            fileUploadPanel.classList.remove('active');
        }
    }
    
    // 单个字体文件按钮点击事件
    customFontBtn.addEventListener('click', function() {
        customFontInput.click();
    });
    
    // 字体文件夹按钮点击事件
    fontFolderBtn.addEventListener('click', function() {
        fontFolderInput.click();
    });
    
    // 单个字体文件选择事件
    customFontInput.addEventListener('change', handleFontUpload);
    
    // 字体文件夹选择事件
    fontFolderInput.addEventListener('change', handleFolderUpload);
    
    // 处理字体文件夹上传
    function handleFolderUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        // 过滤出字体文件
        const fontFiles = Array.from(files).filter(file => {
            const fileName = file.name.toLowerCase();
            return fileName.endsWith('.ttf') || 
                   fileName.endsWith('.otf') || 
                   fileName.endsWith('.woff') || 
                   fileName.endsWith('.woff2');
        });
        
        if (fontFiles.length === 0) {
            showMessage('在选定的文件夹中未找到字体文件', 'warning');
            return;
        }
        
        // 更新字体计数显示
        loadedFontsCount.textContent = `正在加载 ${fontFiles.length} 个字体文件...`;
        
        // 显示字体列表容器
        loadedFontsList.classList.add('active');
        
        // 清空字体列表
        loadedFontsList.innerHTML = '';
        
        // 加载每个字体文件
        let loadedCount = 0;
        let failedCount = 0;
        
        fontFiles.forEach(file => {
            loadFont(file)
                .then(fontInfo => {
                    // 添加字体到列表
                    addFontToList(fontInfo);
                    loadedCount++;
                    updateFontLoadingStatus(loadedCount, failedCount, fontFiles.length);
                })
                .catch(error => {
                    failedCount++;
                    updateFontLoadingStatus(loadedCount, failedCount, fontFiles.length);
                    console.error(`加载字体失败: ${file.name}`, error);
                });
        });
    }
    
    // 更新字体加载状态
    function updateFontLoadingStatus(loadedCount, failedCount, totalCount) {
        const totalProcessed = loadedCount + failedCount;
        
        if (totalProcessed === totalCount) {
            if (failedCount > 0) {
                loadedFontsCount.textContent = `已加载 ${loadedCount} 个字体, ${failedCount} 个加载失败`;
                showMessage(`成功加载 ${loadedCount} 个字体, ${failedCount} 个加载失败`, 'info');
            } else {
                loadedFontsCount.textContent = `已成功加载 ${loadedCount} 个字体`;
                showMessage(`成功加载 ${loadedCount} 个字体`, 'success');
            }
        } else {
            loadedFontsCount.textContent = `正在加载... (${totalProcessed}/${totalCount})`;
        }
    }
    
    // 将字体添加到字体列表显示
    function addFontToList(fontInfo) {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        fontItem.dataset.fontName = fontInfo.name;
        
        // 显示字体信息和预览
        fontItem.innerHTML = `
            <span class="font-item-name">${fontInfo.displayName}</span>
            <span class="font-item-preview" style="font-family: '${fontInfo.name}'">预览文字</span>
            <div class="font-item-actions">
                <button class="use-btn" data-font="${fontInfo.name}">使用</button>
                <button class="delete-btn" data-font="${fontInfo.name}">删除</button>
            </div>
        `;
        
        // 添加事件监听器
        fontItem.querySelector('.use-btn').addEventListener('click', function() {
            selectFont(fontInfo.name);
        });
        
        fontItem.querySelector('.delete-btn').addEventListener('click', function() {
            removeFont(fontInfo.name);
            fontItem.remove();
        });
        
        // 添加到列表
        loadedFontsList.appendChild(fontItem);
    }
    
    // 选择使用指定字体
    function selectFont(fontName) {
        // 在下拉菜单中选择该字体
        for (let i = 0; i < fontSelect.options.length; i++) {
            if (fontSelect.options[i].value === fontName) {
                fontSelect.selectedIndex = i;
                showMessage(`已选择字体: ${getFontDisplayName(fontName)}`, 'success');
                return;
            }
        }
        
        // 如果下拉菜单中没有该字体，则添加
        const option = document.createElement('option');
        option.value = fontName;
        option.textContent = `自定义: ${getFontDisplayName(fontName)}`;
        option.selected = true;
        fontSelect.appendChild(option);
        
        showMessage(`已选择字体: ${getFontDisplayName(fontName)}`, 'success');
    }
    
    // 从列表中获取字体显示名称
    function getFontDisplayName(fontName) {
        const font = customFontList.find(f => f.name === fontName);
        return font ? font.displayName : fontName;
    }
    
    // 移除字体
    function removeFont(fontName) {
        // 从列表中移除
        customFontList = customFontList.filter(font => font.name !== fontName);
        
        // 从下拉菜单中移除
        for (let i = 0; i < fontSelect.options.length; i++) {
            if (fontSelect.options[i].value === fontName) {
                fontSelect.remove(i);
                break;
            }
        }
        
        showMessage(`已移除字体: ${getFontDisplayName(fontName)}`, 'info');
    }
    
    // 处理单个字体上传功能
    function handleFontUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
        const fileName = file.name.toLowerCase();
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExt)) {
            showMessage('请上传有效的字体文件（TTF、OTF、WOFF、WOFF2格式）', 'error');
            return;
        }
        
        // 更新选中的字体名称显示
        const displayName = fileName.substring(0, fileName.lastIndexOf('.'));
        selectedFontName.textContent = displayName;
        
        // 加载字体
        loadFont(file)
            .then(fontInfo => {
                // 自动选中该字体
                selectFont(fontInfo.name);
                showMessage(`字体 "${displayName}" 已成功加载！`, 'success');
            })
            .catch(error => {
                showMessage('字体加载失败: ' + error.message, 'error');
            });
    }
    
    // 加载字体的通用函数
    function loadFont(file) {
        return new Promise((resolve, reject) => {
            // 提取字体名称
            const fileName = file.name;
            const displayName = fileName.substring(0, fileName.lastIndexOf('.'));
            
            // 创建一个字体名称，使用时间戳确保唯一性
            const fontName = `custom-font-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // 使用FileReader读取文件
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const fontData = e.target.result;
                    
                    // 使用FontFace API加载字体
                    const customFont = new FontFace(fontName, fontData);
                    
                    customFont.load().then(function(loadedFace) {
                        // 添加字体到文档
                        document.fonts.add(loadedFace);
                        
                        // 保存字体信息到自定义字体列表
                        const fontInfo = {
                            name: fontName,
                            displayName: displayName,
                            fontFace: loadedFace,
                            originalFile: fileName
                        };
                        
                        customFontList.push(fontInfo);
                        resolve(fontInfo);
                    }).catch(function(error) {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('文件读取失败'));
            };
            
            // 读取字体文件
            reader.readAsArrayBuffer(file);
        });
    }
    
    // 设置手写画布
    function setupHandwritingCanvas() {
        // 确保画布尺寸适应容器
        const container = handwritingCanvas.parentElement;
        const containerWidth = container.clientWidth;
        // 保持原始高宽比
        const ratio = handwritingCanvas.height / handwritingCanvas.width;
        
        // 设置画布大小
        handwritingCanvas.width = containerWidth;
        handwritingCanvas.height = containerWidth * ratio;
        
        // 清除现有内容
        clearHandwritingCanvas();
        
        // 添加事件监听器
        handwritingCanvas.addEventListener('mousedown', startDrawing);
        handwritingCanvas.addEventListener('mousemove', draw);
        handwritingCanvas.addEventListener('mouseup', stopDrawing);
        handwritingCanvas.addEventListener('mouseout', stopDrawing);
        
        // 触摸设备支持
        handwritingCanvas.addEventListener('touchstart', handleTouchStart);
        handwritingCanvas.addEventListener('touchmove', handleTouchMove);
        handwritingCanvas.addEventListener('touchend', handleTouchEnd);
        
        // 更新画笔预览
        updatePenPreview();
    }
    
    // 开始绘制
    function startDrawing(e) {
        isDrawing = true;
        
        // 获取鼠标相对于画布的位置
        const rect = handwritingCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        
        // 添加起始点
        handwritingPoints.push({
            x: lastX,
            y: lastY,
            color: penColor.value,
            size: parseInt(penSize.value),
            isStart: true
        });
        
        // 在起始点绘制一个点
        handwritingCtx.beginPath();
        handwritingCtx.fillStyle = penColor.value;
        handwritingCtx.arc(lastX, lastY, parseInt(penSize.value) / 2, 0, Math.PI * 2);
        handwritingCtx.fill();
    }
    
    // 绘制
    function draw(e) {
        if (!isDrawing) return;
        
        // 获取鼠标位置
        const rect = handwritingCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // 设置绘制样式
        handwritingCtx.strokeStyle = penColor.value;
        handwritingCtx.lineWidth = parseInt(penSize.value);
        handwritingCtx.lineCap = 'round';
        handwritingCtx.lineJoin = 'round';
        
        // 绘制线条
        handwritingCtx.beginPath();
        handwritingCtx.moveTo(lastX, lastY);
        handwritingCtx.lineTo(currentX, currentY);
        handwritingCtx.stroke();
        
        // 存储当前点
        handwritingPoints.push({
            x: currentX,
            y: currentY,
            color: penColor.value,
            size: parseInt(penSize.value),
            isStart: false
        });
        
        // 更新最后的位置
        lastX = currentX;
        lastY = currentY;
    }
    
    // 停止绘制
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            
            // 保存手写图像数据
            handwritingData = handwritingCtx.getImageData(0, 0, handwritingCanvas.width, handwritingCanvas.height);
        }
    }
    
    // 处理触摸开始事件
    function handleTouchStart(e) {
        e.preventDefault(); // 防止滚动
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            startDrawing(mouseEvent);
        }
    }
    
    // 处理触摸移动事件
    function handleTouchMove(e) {
        e.preventDefault(); // 防止滚动
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            draw(mouseEvent);
        }
    }
    
    // 处理触摸结束事件
    function handleTouchEnd(e) {
        e.preventDefault();
        stopDrawing();
    }
    
    // 清除手写画布
    function clearHandwritingCanvas() {
        handwritingCtx.clearRect(0, 0, handwritingCanvas.width, handwritingCanvas.height);
        handwritingPoints = [];
        handwritingData = null;
    }
    
    // 手写样式处理
    function applyHandwritingStyle(style) {
        if (!handwritingData) return;
        
        // 清除画布
        handwritingCtx.clearRect(0, 0, handwritingCanvas.width, handwritingCanvas.height);
        
        // 首先恢复原始图像
        handwritingCtx.putImageData(handwritingData, 0, 0);
        
        // 应用不同的效果
        if (style === 'smooth') {
            // 平滑处理
            // 这里可以添加平滑算法，比如贝塞尔曲线平滑
            smoothHandwriting();
        } else if (style === 'artistic') {
            // 艺术效果
            artisticHandwriting();
        }
        // 原始样式不需要处理
    }
    
    // 平滑手写函数
    function smoothHandwriting() {
        // 这里实现简单的平滑处理
        // 实际应用中可以使用更复杂的算法如贝塞尔曲线
        if (handwritingPoints.length < 3) return;
        
        handwritingCtx.clearRect(0, 0, handwritingCanvas.width, handwritingCanvas.height);
        
        // 遍历所有点，进行平滑处理
        for (let i = 0; i < handwritingPoints.length; i++) {
            const point = handwritingPoints[i];
            
            if (point.isStart || i === 0) {
                // 如果是新线条的起始点
                handwritingCtx.beginPath();
                handwritingCtx.moveTo(point.x, point.y);
            } else if (i < handwritingPoints.length - 1) {
                // 使用当前点和下一个点的中点作为控制点
                const nextPoint = handwritingPoints[i + 1];
                const xc = (point.x + nextPoint.x) / 2;
                const yc = (point.y + nextPoint.y) / 2;
                
                // 设置样式
                handwritingCtx.strokeStyle = point.color;
                handwritingCtx.lineWidth = point.size;
                
                // 绘制平滑曲线
                handwritingCtx.quadraticCurveTo(point.x, point.y, xc, yc);
                handwritingCtx.stroke();
            }
        }
    }
    
    // 艺术效果处理
    function artisticHandwriting() {
        // 添加艺术效果，比如笔触纹理、墨水扩散效果等
        if (!handwritingData) return;
        
        // 简单实现：添加阴影效果
        handwritingCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        handwritingCtx.shadowBlur = 5;
        handwritingCtx.shadowOffsetX = 2;
        handwritingCtx.shadowOffsetY = 2;
        
        // 重新绘制所有点
        handwritingCtx.clearRect(0, 0, handwritingCanvas.width, handwritingCanvas.height);
        
        for (let i = 0; i < handwritingPoints.length; i++) {
            const point = handwritingPoints[i];
            
            if (point.isStart || i === 0) {
                // 如果是新线条的起始点
                handwritingCtx.beginPath();
                handwritingCtx.moveTo(point.x, point.y);
                
                // 绘制起始点
                handwritingCtx.fillStyle = point.color;
                handwritingCtx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
                handwritingCtx.fill();
            } else {
                // 设置样式
                handwritingCtx.strokeStyle = point.color;
                handwritingCtx.lineWidth = point.size;
                
                // 绘制线段
                handwritingCtx.lineTo(point.x, point.y);
                handwritingCtx.stroke();
                
                // 重新开始路径，保持连续性
                handwritingCtx.beginPath();
                handwritingCtx.moveTo(point.x, point.y);
            }
        }
    }
    
    // 将手写应用到最终签名
    function applyHandwritingToSignature() {
        if (!handwritingData) {
            showMessage('请先在手写区域书写您的签名', 'warning');
            return;
        }
        
        // 清除结果画布
        resetCanvas();
        
        // 获取当前选择的效果样式
        const effectStyle = handwritingStyle.value;
        
        // 应用手写效果到临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = handwritingCanvas.width;
        tempCanvas.height = handwritingCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 首先将原始数据绘制到临时画布
        tempCtx.putImageData(handwritingData, 0, 0);
        
        // 根据选择的效果应用不同的处理
        if (effectStyle === 'smooth') {
            // 如果上面的smoothHandwriting函数已经可以正常工作
            // 这里可以直接调用它，但需要确保它不会直接修改原始handwritingCtx
        } else if (effectStyle === 'artistic') {
            // 添加艺术效果
            tempCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            tempCtx.shadowBlur = 5;
            tempCtx.shadowOffsetX = 2;
            tempCtx.shadowOffsetY = 2;
            // 重新绘制
            tempCtx.drawImage(handwritingCanvas, 0, 0);
        }
        
        // 计算缩放因子以适应结果画布
        const scaleX = canvas.width / handwritingCanvas.width;
        const scaleY = canvas.height / handwritingCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        
        // 计算居中位置
        const x = (canvas.width - handwritingCanvas.width * scale) / 2;
        const y = (canvas.height - handwritingCanvas.height * scale) / 2;
        
        // 绘制到结果画布，保持比例
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 
                     x, y, tempCanvas.width * scale, tempCanvas.height * scale);
        
        // 启用下载按钮
        downloadBtn.disabled = false;
        
        showMessage('手写签名已应用！', 'success');
    }
    
    // 生成签名按钮点击事件
    generateBtn.addEventListener('click', generateSignature);
    
    // 清除手写按钮点击事件
    clearHandwritingBtn.addEventListener('click', function() {
        clearHandwritingCanvas();
        showMessage('手写内容已清除', 'info');
    });
    
    // 应用手写签名按钮点击事件
    applyHandwritingBtn.addEventListener('click', applyHandwritingToSignature);
    
    // 手写样式选择事件
    handwritingStyle.addEventListener('change', function() {
        applyHandwritingStyle(this.value);
    });
    
    // 重置按钮点击事件
    resetBtn.addEventListener('click', resetCanvas);
    
    // 下载按钮点击事件
    downloadBtn.addEventListener('click', downloadSignature);
    
    // 生成签名函数
    function generateSignature() {
        // 获取用户输入的姓名
        const name = nameInput.value.trim();
        
        // 验证姓名是否为空
        if (!name) {
            showMessage('请输入您的姓名', 'error');
            nameInput.focus();
            return;
        }
        
        // 获取用户选择的字体和样式
        const fontFamily = fontSelect.value;
        const textColor = colorInput.value;
        const fontSize = sizeRange.value;
        const decorationStyle = styleSelect.value;
        
        // 重置画布
        resetCanvas();
        
        // 设置文本样式
        ctx.font = `${fontSize}px "${fontFamily}"`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 计算画布中心位置
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 绘制装饰效果（在文字之前绘制背景装饰）
        if (decorationStyle === 'shadow') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
        }
        
        if (decorationStyle === 'circle') {
            // 计算文本宽度以确定圆的半径
            const textWidth = ctx.measureText(name).width;
            const radius = textWidth / 1.5;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        if (decorationStyle === 'box') {
            // 计算文本宽度以确定方框大小
            const textWidth = ctx.measureText(name).width;
            const padding = 30;
            
            ctx.beginPath();
            ctx.rect(centerX - textWidth/2 - padding, centerY - fontSize/2 - padding/2, 
                    textWidth + padding*2, fontSize + padding);
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 绘制文本
        ctx.fillText(name, centerX, centerY);
        
        // 绘制下划线装饰（在文字之后绘制）
        if (decorationStyle === 'underline') {
            const textWidth = ctx.measureText(name).width;
            const lineY = centerY + fontSize/2 + 10;
            
            ctx.beginPath();
            ctx.moveTo(centerX - textWidth/2, lineY);
            ctx.lineTo(centerX + textWidth/2, lineY);
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 启用下载按钮
        downloadBtn.disabled = false;
        
        // 显示成功消息
        showMessage('签名生成成功！', 'success');
    }
    
    // 重置画布函数
    function resetCanvas() {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 禁用下载按钮
        downloadBtn.disabled = true;
    }
    
    // 下载签名函数
    function downloadSignature() {
        // 创建临时链接
        const link = document.createElement('a');
        // 设置下载文件名
        link.download = '我的艺术签名.png';
        // 将画布内容转换为数据URL
        link.href = canvas.toDataURL('image/png');
        // 触发点击事件
        link.click();
        
        showMessage('签名已下载！', 'success');
    }
    
    // 显示消息函数
    function showMessage(text, type = 'success') {
        // 检查是否已有消息元素
        let messageEl = document.querySelector('.message');
        
        if (!messageEl) {
            // 创建消息元素
            messageEl = document.createElement('div');
            messageEl.className = 'message';
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.left = '50%';
            messageEl.style.transform = 'translateX(-50%)';
            messageEl.style.padding = '10px 20px';
            messageEl.style.color = '#fff';
            messageEl.style.borderRadius = '4px';
            messageEl.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)';
            messageEl.style.zIndex = '9999';
            document.body.appendChild(messageEl);
        }
        
        // 根据消息类型设置背景颜色
        if (type === 'success') {
            messageEl.style.backgroundColor = '#67c23a';
        } else if (type === 'error') {
            messageEl.style.backgroundColor = '#f56c6c';
        } else if (type === 'warning') {
            messageEl.style.backgroundColor = '#e6a23c';
        } else if (type === 'info') {
            messageEl.style.backgroundColor = '#909399';
        }
        
        // 设置消息内容
        messageEl.textContent = text;
        
        // 显示消息
        messageEl.style.display = 'block';
        
        // 3秒后隐藏消息
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 3000);
    }
    
    // 添加艺术字体预加载
    function preloadFonts() {
        // 创建测试元素
        const testElement = document.createElement('span');
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        testElement.style.top = '-9999px';
        testElement.style.left = '-9999px';
        testElement.textContent = 'Font Test';
        
        // 预加载多种字体
        const fontsToPreload = [
            'Ma Shan Zheng',
            'ZCOOL QingKe HuangYou',
            'ZCOOL XiaoWei',
            'Noto Serif SC'
        ];
        
        fontsToPreload.forEach(font => {
            testElement.style.fontFamily = font;
            document.body.appendChild(testElement);
        });
        
        // 移除测试元素
        setTimeout(() => {
            document.body.removeChild(testElement);
        }, 100);
    }
    
    // 调用字体预加载
    preloadFonts();
    
    // 在页面加载时重置画布
    resetCanvas();
}); 