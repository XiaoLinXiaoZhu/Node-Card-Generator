

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// 后端数据支持
// 从后端加载文件
export async function loadFile(fileName: string) {
    const res = await fetch("/api/file/" + fileName);
    if (!res.ok) {
        console.error("Failed to load file:", res.statusText);
        return;
    }
    const fileContent = await res.text();
    console.log("文件内容：", fileContent);
    return fileContent;
}

// 保存文件到后端
export async function saveFile(fileName: string, fileContent: string) {
    await fetch("/api/file/" + fileName, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: fileContent,
    });
    // alert("文件已保存！");
    console.log("文件已保存！", fileName, fileContent);
}

// 加载图片/保存图片
export async function loadImage(imgPath: string = "test.png") {
    const res = await fetch("/api/image/" + imgPath);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    return url;
}

export async function randomDraw() {
    // const canvas = document.getElementById("mycanvas") as HTMLCanvasElement;
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    // 设置画布大小
    canvas.width = 800;
    canvas.height = 600;


    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 随机绘制一个矩形
    ctx.fillStyle = "red";
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 50, 50);

    // 随机绘制一个圆形
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 25, 0, Math.PI * 2);
    ctx.fill();

    // 随机绘制一条线
    ctx.strokeStyle = "green";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();

    // 随机绘制一段文字
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Hello, World!", Math.random() * canvas.width, Math.random() * canvas.height);

    // 导出为 Data URL
    const dataURL = canvas.toDataURL("image/png");
    return dataURL;
}

export async function saveImage(dataURL: string) {
    const blob = await fetch(dataURL).then((res) => res.blob());
    if (!blob) return;

    await fetch("/api/image/test.png", {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
    });
    // alert("图片已保存！");
}
