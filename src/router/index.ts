import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import NodeEditor from "../pages/NodeEditor.vue";
import CardEditor from "../pages/CardEditor.vue";
import FileEditor from "../pages/FileEditor.vue";

export default createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomePage,
    },
    {
      path: "/node-editor",
      name: "NodeEditor",
      component: NodeEditor,
    },
    {
      path: "/file-editor",
      name: "FileEditor",
      component: FileEditor,
    },{
      path: "/card-editor",
      name: "CardEditor",
      component: CardEditor,
    }
  ],
});
