import { file, serve } from "bun";

// 文件存储路径
// const FILE_PATH = "./data/example.txt";
const FILE_PATH = process.env.FILE_PATH || `${import.meta.dir}/data/example.txt`;

const FILE_ROOT = process.env.FILE_ROOT || `${import.meta.dir}/data`;

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
  Match(req: Request): boolean {
    const url = new URL(req.url);
    // return url.pathname === this.pathname;
    // return url.pathname.startsWith(this.pathname);
    // 判断匹配头部，支持 RESTful 风格的路径
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
    const apiParts = this.pathname.split("/").filter((part) => part.length > 0);
    // if (pathParts.length !== apiParts.length) {
    //   return false;
    // }
    for (let i = 0; i < apiParts.length; i++) {
      //debug
      if (apiParts[i].startsWith(":")) {
        continue;
      } else if (!pathParts[i] || apiParts[i] !== pathParts[i]) {
        return false;
      }
    }
    return true;
  }

  GetVariables(req: Request): Record<string, string> {
    // 从请求中提取变量，使用 RESTful 风格的路径
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter((part) => part.length > 0);
    const apiParts = this.pathname.split("/").filter((part) => part.length > 0);
    const variables: Record<string, string> = {};
    // if (pathParts.length !== apiParts.length) {
    //   return variables;
    // }
    for (let i = 0; i < apiParts.length; i++) {
      if (apiParts[i].startsWith(":")) {
        const key = apiParts[i].substring(1);
        variables[key] = pathParts[i] || "";
      } else if (apiParts[i] !== pathParts[i]) {
        return variables;
      }
    }
    return variables;
  }
  async Execute(req: Request): Promise<Response> {
    const variables = this.GetVariables(req);
    console.log("获得到变量", variables);
    if (!this.Match(req)) {
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
  new ServerAPI("/file/:filename", async (req) => {
    const file = Bun.file(FILE_PATH);
    console.log("读取文件", file, file.type);
    return new Response(file);
  }, async (req) => {
    const body = await req.text();
    await Bun.write(FILE_PATH, body);
    return new Response("文件保存成功");
  })
);

const imgAPI = new ServerAPI("/image/:folder/:filename", async (req) => {
  const url = new URL(req.url);
  let { folder, filename } = imgAPI.GetVariables(req);


  let filePath : string;
  if (!folder) {
    folder = 'default.png';
  }
  if (!filename) {
    filePath = `${FILE_ROOT}/${folder}`; 
  }else {
    filePath = `${FILE_ROOT}/${folder}/${filename}`;
  }
  const imgFile = Bun.file(filePath);
  console.log("读取文件", imgFile, imgFile.type);
  return new Response(imgFile);
}, async (req) => {
  const url = new URL(req.url);
  let { folder, filename } = imgAPI.GetVariables(req);
  const body = await req.arrayBuffer();

  let filePath : string;
  if (!folder) {
    folder = 'default.png';
  }
  if (!filename) {
    filePath = `${FILE_ROOT}/${folder}`; 
  }else {
    filePath = `${FILE_ROOT}/${folder}/${filename}`;
  }

  console.log("保存文件", filePath, body);
  
  await Bun.write(filePath, body);
  return new Response("文件保存成功");
})
serverAPIs.push(imgAPI);

serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);

    //debug
    console.log("获得到请求", req.method, url.pathname);

    // 遍历所有 API，检查是否匹配
    for (const api of serverAPIs) {
      if (api.Match(req)) {
        return await api.Execute(req);
      }
    }

    return new Response("Bun 后端运行中，请使用 GET/POST 访问", { status: 404 });
  },
});

console.log("Bun 后端运行在 http://localhost:3001");