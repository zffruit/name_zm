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
    
    // 自定义字体上传相关元素
    const customFontInput = document.getElementById('custom-font-input');
    const customFontBtn = document.getElementById('custom-font-btn');
    const selectedFontName = document.getElementById('selected-font-name');
    
    // 存储自定义字体对象
    let customFontList = [];
    let currentCustomFontIndex = -1;
    
    // 更新字体大小显示
    sizeRange.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
    });
    
    // 自定义字体按钮点击事件
    customFontBtn.addEventListener('click', function() {
        customFontInput.click();
    });
    
    // 自定义字体文件选择事件
    customFontInput.addEventListener('change', handleFontUpload);
    
    // 处理字体上传功能
    function handleFontUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
        const fileName = file.name;
        const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        if (!validExtensions.includes(fileExt)) {
            showMessage('请上传有效的字体文件（TTF、OTF、WOFF、WOFF2格式）', 'error');
            return;
        }
        
        // 更新选中的字体名称显示
        const displayName = fileName.substring(0, fileName.lastIndexOf('.'));
        selectedFontName.textContent = displayName;
        
        // 读取字体文件
        const reader = new FileReader();
        reader.onload = function(e) {
            const fontData = e.target.result;
            
            // 创建一个字体名称，使用时间戳确保唯一性
            const fontName = `custom-font-${Date.now()}`;
            
            // 使用FontFace API加载字体
            const customFont = new FontFace(fontName, fontData);
            
            customFont.load().then(function(loadedFace) {
                // 添加字体到文档
                document.fonts.add(loadedFace);
                
                // 保存字体信息到自定义字体列表
                const fontInfo = {
                    name: fontName,
                    displayName: displayName,
                    fontFace: loadedFace
                };
                
                customFontList.push(fontInfo);
                currentCustomFontIndex = customFontList.length - 1;
                
                // 添加到字体选择下拉菜单
                const option = document.createElement('option');
                option.value = fontName;
                option.textContent = `自定义: ${displayName}`;
                option.selected = true;
                fontSelect.appendChild(option);
                
                showMessage(`字体 "${displayName}" 已成功加载！`, 'success');
                
                // 预览该字体（可选）
                previewCustomFont(fontName);
            }).catch(function(error) {
                showMessage('字体加载失败: ' + error.message, 'error');
            });
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    // 预览自定义字体
    function previewCustomFont(fontName) {
        // 设置预览字体
        nameInput.style.fontFamily = fontName;
        
        // 如果名称输入框为空，添加示例文本
        if (!nameInput.value.trim()) {
            nameInput.placeholder = "使用自定义字体预览效果";
        }
    }
    
    // 生成签名按钮点击事件
    generateBtn.addEventListener('click', generateSignature);
    
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