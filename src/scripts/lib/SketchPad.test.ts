import { SketchPad, type SketchPadOptions } from "./SketchPad";

// 这里是一个测试用的函数链
const sketchPad = new SketchPad();
// 增加白底
sketchPad.addElement({
    uid: "white-bg",
    type: "text",
    content: "",
    style: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        backgroundColor: "black"
    }
});
sketchPad.then(async (env: SketchPadOptions) => {
    await env.renderer.composeHtmlAndCanvas();
});
sketchPad.addElement({
    uid: "test",
    type: "text",
    content: "Hello World",
    style: {
        position: "absolute",
        top: "50px",
        left: "50px",
        width: "100px",
        height: "100px",
        backgroundColor: "red",
        fontWeight: "bold",
        fontSize: "20px",
    }
});
sketchPad.addCardEffect({
    uid: "test-card-effect",
    value: "opacity: 0.5;filter: blur(1px);",
    name: "test-card-effect",
});
sketchPad.addPixelEffect({
    uid: "test-pixel-effect",
    fn: (ctx: CanvasRenderingContext2D, args: any) => {
        // 这里是添加像素特效的逻辑
        // 处理每个像素，将其颜色反向
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // R
            data[i + 1] = 255 - data[i + 1]; // G
            data[i + 2] = 255 - data[i + 2]; // B
            // data[i + 3] = 255; // A
        }
        ctx.putImageData(imageData, 0, 0);
    },
    args: [],
});

const sketchPad2 = new SketchPad();
sketchPad2.addElement({
    uid: "gray-bg",
    type: "text",
    content: "",
    style: {
        position: "absolute",
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        backgroundColor: "gray"
    }
});
sketchPad2.then(async (env: SketchPadOptions) => {
    await env.renderer.composeHtmlAndCanvas();
});
sketchPad2.addElement({
    uid: "test2",
    type: "text",
    content: "Hello World",
    style: {
        position: "absolute",
        bottom: "50px",
        right: "50px",
        width: "100px",
        height: "100px",
        backgroundColor: "blue",
        color: "white",
        fontWeight: "bold",
        fontSize: "20px",
    }
});
sketchPad2.addCardEffect({
    uid: "test-card-effect2",
    value: "filter: drop-shadow(16px 16px 20px #0000FF50) invert(20%);",
    name: "test-card-effect2",
});
sketchPad2.addPixelEffect({
    uid: "test-pixel-effect2",
    fn: (ctx: CanvasRenderingContext2D, args: any) => {
        // 这里使用像素处理ctx：
        // 将图像添加更明显的杂色（类似于雪花屏效果），通过 strength 控制强度
        const strength = 50; // 增加强度为 50
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // 随机改变每个像素的颜色，按强度调整
            data[i] = Math.min(255, Math.max(0, data[i] + (Math.random() * 2 - 1) * strength));     // R
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (Math.random() * 2 - 1) * strength)); // G
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (Math.random() * 2 - 1) * strength)); // B
            data[i + 3] = 152; // A
        }
        ctx.putImageData(imageData, 0, 0);
    },
    args: [],
});


sketchPad.addSketchPad(sketchPad2);

sketchPad.render().then(async (env) => {
    await env.renderer.exportPNG();

    sketchPad.clear();
    sketchPad2.clear();
})
