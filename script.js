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
    
    // 更新字体大小显示
    sizeRange.addEventListener('input', function() {
        sizeValue.textContent = this.value + 'px';
    });
    
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
            alert('请输入您的姓名');
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
        showMessage('签名生成成功！');
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
        
        showMessage('签名已下载！');
    }
    
    // 显示消息函数
    function showMessage(text) {
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
            messageEl.style.backgroundColor = '#67c23a';
            messageEl.style.color = '#fff';
            messageEl.style.borderRadius = '4px';
            messageEl.style.boxShadow = '0 2px 12px 0 rgba(0, 0, 0, 0.1)';
            messageEl.style.zIndex = '9999';
            document.body.appendChild(messageEl);
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