export function applyEffects(ctx, effects) {
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
  
    effects.forEach(effect => {
      switch(effect.name) {
        case 'noise':
          addNoise(pixels, effect.value || 10);
          break;
        case 'hue':
          adjustHue(pixels, effect.value || 0);
          break;
      }
    });
  
    ctx.putImageData(imageData, 0, 0);
  }
  
  function addNoise(pixels, intensity) {
    for (let i = 0; i < pixels.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity;
      pixels[i] += noise;     // R
      pixels[i+1] += noise;   // G
      pixels[i+2] += noise;   // B
    }
  }
  
  function adjustHue(pixels, degrees) {
    // 简化的色相旋转（实际项目建议用完整的矩阵计算）
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = [pixels[i], pixels[i+1], pixels[i+2]];
      pixels[i] = r * 0.8 + g * 0.2;   // 模拟色相变化
      pixels[i+1] = g * 0.7 + b * 0.3;
      pixels[i+2] = b * 0.6 + r * 0.4;
    }
  }