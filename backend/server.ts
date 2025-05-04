import { serve } from "bun";

// 文件存储路径
// const FILE_PATH = "./data/example.txt";
const FILE_PATH = process.env.FILE_PATH || `${import.meta.dir}/data/example.txt`;

type RequestHandler = (req: Request) => Promise<Response> | Response;
class ServerAPI {
  pathname: string;
  GetFunction?: RequestHandler;
  PostFunction?: RequestHandler;
  constructor(pathname: string, GetFunction?: RequestHandler, PostFunction?: RequestHandler) {
    this.pathname = pathname;
    this.GetFunction = GetFunction;
    this.PostFunction = PostFunction;
  }
  Check(req: Request): boolean {
    const url = new URL(req.url);
    return url.pathname === this.pathname;
  }
  async Execute(req: Request): Promise<Response> {
    if (!this.Check(req)) {
      return new Response("Not Found", { status: 404 });
    }
    if (req.method === "GET" && this.GetFunction) {
      return await this.GetFunction(req);
    } else if (req.method === "POST" && this.PostFunction) {
      return await this.PostFunction(req);
    } else {
      return new Response("Method Not Allowed", { status: 405 });
    }
  }
}

const serverAPIs: ServerAPI[] = [];

serverAPIs.push(
  new ServerAPI("/health", async (req) => {
    return new Response("Bun 后端运行正常", { status: 200 });
  })
);

serverAPIs.push(
  new ServerAPI("/file", async (req) => {
    const file = Bun.file(FILE_PATH);
    console.log("读取文件", file, file.type);
    return new Response(file);
  }, async (req) => {
    const body = await req.text();
    await Bun.write(FILE_PATH, body);
    return new Response("文件保存成功");
  })
);

serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    //debug
    console.log("获得到请求", req.method, url.pathname);

    // 遍历所有 API，检查是否匹配
    for (const api of serverAPIs) {
      if (api.Check(req)) {
        return await api.Execute(req);
      }
    }

    return new Response("Bun 后端运行中，请使用 GET/POST 访问", { status: 404 });
  },
});

console.log("Bun 后端运行在 http://localhost:3001");