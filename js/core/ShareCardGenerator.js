/**
 * ShareCardGenerator.js
 * Canvas分享卡片生成器
 */
class ShareCardGenerator {
  constructor() {
    this.width = 750;
    this.height = 1000;
  }

  /**
   * 生成分享卡片
   * @param {Object} data - 卡片数据
   * @returns {string} base64图片
   */
  generate(data) {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    
    // 背景
    this.drawBackground(ctx);
    
    // 标题区
    this.drawTitle(ctx, data);
    
    // 属性雷达图
    this.drawRadarChart(ctx, data.attributes);
    
    // 关键事件时间轴
    this.drawTimeline(ctx, data.keyEvents);
    
    // 评分
    this.drawScore(ctx, data);
    
    // 底部
    this.drawFooter(ctx, data);
    
    return canvas.toDataURL('image/png');
  }

  drawBackground(ctx) {
    // 深色渐变背景
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(0.5, '#16213e');
    grad.addColorStop(1, '#0f3460');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // 装饰圆点
    ctx.fillStyle = 'rgba(255, 230, 109, 0.03)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * this.width, Math.random() * this.height, Math.random() * 30 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawTitle(ctx, data) {
    // 游戏标题
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('人生模拟器', this.width / 2, 60);
    
    // 副标题
    ctx.fillStyle = '#aaa';
    ctx.font = '18px sans-serif';
    ctx.fillText('重开你的人生，体验无限可能', this.width / 2, 90);
    
    // 分隔线
    ctx.strokeStyle = 'rgba(255, 230, 109, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 110);
    ctx.lineTo(this.width - 100, 110);
    ctx.stroke();
    
    // 称号
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(data.title, this.width / 2, 150);
    
    // 存活年龄
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '20px sans-serif';
    ctx.fillText(`享年 ${data.age} 岁`, this.width / 2, 180);
  }

  drawRadarChart(ctx, attributes) {
    const centerX = this.width / 2;
    const centerY = 330;
    const radius = 100;
    const labels = ['颜值', '智力', '体质', '家境', '情商', '运气'];
    const values = [
      (attributes.appearance || 5) / 10,
      (attributes.intelligence || 5) / 10,
      (attributes.constitution || 5) / 10,
      (attributes.family || 5) / 10,
      (attributes.eq || 5) / 10,
      (attributes.luck || 5) / 10
    ];
    const sides = 6;
    
    // 背景网格
    for (let ring = 1; ring <= 5; ring++) {
      const r = radius * ring / 5;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 数据多边形
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = centerX + radius * val * Math.cos(angle);
      const y = centerY + radius * val * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(78, 205, 196, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 标签
    ctx.fillStyle = '#ccc';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
      const x = centerX + (radius + 25) * Math.cos(angle);
      const y = centerY + (radius + 25) * Math.sin(angle) + 5;
      ctx.fillText(labels[i], x, y);
    }
  }

  drawTimeline(ctx, keyEvents) {
    const startY = 470;
    const maxHeight = 250;
    
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe66d';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('人生轨迹', this.width / 2, startY);
    
    const events = keyEvents.slice(-5);
    if (events.length === 0) return;
    
    const step = Math.min(maxHeight / (events.length + 1), 50);
    const lineX = this.width / 2;
    
    // 时间线
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineX, startY + 20);
    ctx.lineTo(lineX, startY + 20 + events.length * step);
    ctx.stroke();
    
    events.forEach((evt, i) => {
      const y = startY + 25 + i * step;
      
      // 圆点
      ctx.beginPath();
      ctx.arc(lineX, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6b6b';
      ctx.fill();
      
      // 年龄
      ctx.fillStyle = '#4ecdc4';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(evt.age + '岁', lineX - 60, y + 5);
      
      // 事件名
      ctx.fillStyle = '#ddd';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(evt.title, lineX + 15, y + 5);
      ctx.textAlign = 'center';
    });
  }

  drawScore(ctx, data) {
    const y = 770;
    
    // 分隔线
    ctx.strokeStyle = 'rgba(255, 230, 109, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(this.width - 100, y);
    ctx.stroke();
    
    // 分数
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(data.score + '分', this.width / 2, y + 65);
    
    // 标签
    const tags = data.tags || [];
    if (tags.length > 0) {
      const tagText = tags.join(' · ');
      ctx.fillStyle = '#aaa';
      ctx.font = '16px sans-serif';
      ctx.fillText(tagText, this.width / 2, y + 95);
    }
    
    // 种子码
    if (data.seedCode) {
      ctx.fillStyle = '#666';
      ctx.font = '13px sans-serif';
      ctx.fillText('挑战种子码: ' + data.seedCode, this.width / 2, y + 120);
    }
  }

  drawFooter(ctx, data) {
    ctx.fillStyle = '#555';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('扫码或搜索「人生模拟器」来挑战我的分数', this.width / 2, this.height - 50);
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('Generated by Life Simulator', this.width / 2, this.height - 25);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareCardGenerator;
}
