<template>
  <div style="display: flex;">
    <div style="height: 800px;width: 200px;flex: none;padding-left: 20px;padding-top: 20px;border-right: 1px solid #ccc;">
      <div style="margin-bottom: 20px;padding-bottom: 20px;border-bottom: 1px solid #ccc;">
        <el-button @click="clickAssociative"  type="primary" round size="large"
        >管理表关联</el-button>
      </div>
      <el-button @click="dialogVisible = true" style="margin-bottom: 20px;">新增目录</el-button>

<!--      <div style="">-->
<!--        <el-button @click="clickAllExpand" style="margin-bottom: 20px;">展开</el-button>-->
<!--        <el-button @click="clickAllCollapse" style="margin-bottom: 20px;">收起</el-button>-->
<!--      </div>-->
      <el-tree
          :expand-on-click-node="false"
          style="max-width: 600px"
          :data="menuTree"
          node-key="id"
          :highlight-current="true"
          :current-node-key="selectedMenuId"
          @nodeExpand="treeNodeExpand"
          @nodeCollapse="treeNodeCollapse"
          :default-expanded-keys="expandedKeys"
          :props="{ children: 'children',  label: 'name' }"
          @node-click="handleNodeClick"
      ></el-tree>
    </div>

    <!--  表格  -->
    <div style="padding: 0px 20px;">
      <div style="background: #ddd;height: 100px;display: flex;align-items: center;padding-left: 20px;">
        <el-button @click="clickAdd"  type="primary" round size="large"
        >新增接口</el-button>
      </div>

      <div style="">
        <!-- 接口列表 -->
        <el-table
            max-height="800"
            :data="interfaceList"
            @cell-click="selectTableCellIndex = -1"
            style="width: 100%">
          <el-table-column
              prop="menuName"
              label="目录"
              width="160">
            <template #default="scope">
              <el-select
                  v-if="selectTableCellIndex == scope.$index"
                  v-model="scope.row.menuId"
                  placeholder="Select"
                  size="large"
                  @change="changeInterfaceMenu"
                  style="width: 120px"
              >
                <el-option
                    v-for="item in originMenuList"
                    :label="item.name"
                    :value="item.id"
                />
              </el-select>
              <span v-else @click="clickEditInterfaceMenu(scope)" style="cursor: pointer;color:#539FFF;font-weight: bolder;">{{ scope.row.menuName }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="url"
              label="ID/路径"
              width="380">
            <template #default="scope">
              <el-button @click="clickCopyText(scope.row.id)" style="margin-bottom: 4px;margin-left: 10px;">{{scope.row.id}}</el-button>
              <el-button @click="clickCopyText(scope.row.url)" style="" type="primary" round
              >{{scope.row.url}}</el-button>
            </template>

          </el-table-column>
          <el-table-column
              align="center"
              label="关联表"
              width="280">
            <template #default="scope">
              <div style="display: flex;flex-direction: column;align-items: center">
                <div style="margin-bottom: 4px;font-size: 12px;" v-for="table in scope.row.tables"
                >{{ table }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
              prop="mark"
              label="备注"
              width="280">
          </el-table-column>
          <el-table-column
              prop="mark"
              label="操作"
              width="320">
            <template #default="scope">
              <el-button
                  @click="clickEdit(scope.row)"
                  type="success" plain>修改</el-button>
              <el-button @click="clickCopy(scope.row)">复制</el-button>
              <el-button @click="clickDelete(scope.row)" type="danger" plain>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>



    <el-dialog
        v-model="dialogVisible"
        title="新建目录"
        width="500"
    >
      <el-input v-model="newMenuName" placeholder="请输入目录名"></el-input>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addMenu">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<script setup>
import {onMounted, ref} from "vue";
import router from "../src/router/router.js";

import { ElMessage, ElMessageBox } from 'element-plus'
import {onBeforeRouteUpdate} from "vue-router";

const expandedKeys = ref([])

const dialogVisible = ref(false)
const inputValue = ref("")

const newMenuName = ref("")



// 默认根目录
const selectedMenuId = ref("1")

// 判断有没有缓存目录
if(localStorage.getItem('selectedMenuId')) {
  selectedMenuId.value = localStorage.getItem('selectedMenuId')
}

// 点击目录节点
const handleNodeClick = (menu) => {
  selectedMenuId.value = menu.id
  localStorage.setItem('selectedMenuId', menu.id);
  requestList()
}


// 触发: 全展开
function clickAllExpand(){
  for(let item of originMenuList.value){
    const list = []
    debugger
    if(item.children && item.children.length > 0){
      list.push(item)
    }
  }
  expandedKeys.value = list
  localStorage.setItem('myTree',list.join(","));
}

// 触发: 全收起
function clickAllCollapse(){
  console.log("收起1",expandedKeys.value)
  // localStorage.setItem('myTree',['1'].join(","));
  expandedKeys.value = [1]
  // console.log("收起2",expandedKeys.value)
}

// 展开目录
function treeNodeExpand(e){
  let myTree = localStorage.getItem('myTree');
  if(!myTree) myTree = ""
  const id = e.id
  myTree = myTree.split(",")
  myTree.push(id)
  // 新增
  localStorage.setItem('myTree',myTree.join(","));
}

// 收起目录
function treeNodeCollapse(e){
  let myTree = localStorage.getItem('myTree');
  if(!myTree) return
  myTree = myTree.split(",")
  const id = e.id

  function deleteTree(){
    const index = myTree.indexOf("" + id)
    console.log("判断是否存在删除",index,myTree, id)
    if(index == -1) return
    myTree.splice(index, 1)
    deleteTree()
  }
  deleteTree()
  // 删除
  localStorage.setItem('myTree', myTree.join(","));
}

function listToTree(list) {
  const map = {};
  const tree = [];

  list.forEach(item => {
    map[item.id] = { ...item, children: map[item.id] && map[item.id].children };
    if (item.parentId) {
      map[item.parentId] = map[item.parentId] || { children: [] };
      map[item.parentId].children = map[item.parentId].children || [];
      map[item.parentId].children.push(map[item.id]);
      map[item.parentId].hasChildren = true;
    } else {
      tree.push(map[item.id]);
    }
  });
  return tree;
}




onMounted(()=>{
  requestList()
})
function clickEdit(row){
  console.log("点击", row)
  router.push("saveTable?id=" + row.id)
}


// 点击复制
function clickCopy(row){
  console.log("点击", row)
  ElMessageBox.confirm(
      '你是否确认复制?',
      '提示',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '复制',
        cancelButtonText: '取消',
      }
  ).then(() => {
        requestCopy(row.id)
      })

}

// 点击删除
function clickDelete(row){
  console.log("点击", row)
  ElMessageBox.confirm(
      '你是否确认删除?',
      '提示',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }
  ).then(() => {
    requestDelete(row.id)
  })
}


// 点击添加接口
function clickAdd(){
  if(selectedMenuId) {
    router.push("saveTable?menuId=" + selectedMenuId.value)
  } else {
    router.push("saveTable")
  }
}
// 点击表关联管理
function clickAssociative(){
  router.push("associative")
}



const selectTableCellIndex = ref(-1)
// 点击修改接口目录
function clickEditInterfaceMenu(scope){
  console.log("点击", scope.$index)
  selectTableCellIndex.value =  scope.$index
}
// 修改接口目录
function changeInterfaceMenu(menuId){
  console.log("修改",menuId)
  requestChangeInterfaceMenu(menuId)
}


// ==================================  网络请求  ===============================

function requestChangeInterfaceMenu(menuId){
  debugger
  postRequest(window.baseURL + "/admin/updateInterfaceMenu", {
    id: interfaceList.value[selectTableCellIndex.value].id,
    menuId,
  }).then(res => {
    $message({
      message: '更新成功',
      type: 'success'
    });
    requestList()
  })
}

// 复制接口
function requestCopy(id){
  postRequest(window.baseURL + "/admin/copy", {id}).then(res => {
    requestList()
    $message({
      message: '复制ID成功',
      type: 'success'
    });
  })
}

// 删除接口
function requestDelete(id){
  postRequest(window.baseURL + "/admin/delete", {id}).then(res => {
    requestList()
    $message({
      message: '删除成功',
      type: 'success'
    });
  })
}


const menuTree = ref([])
const originMenuList = ref([])

// 获取目录
function getMenu(){
  getRequest(window.baseURL + `/admin/getMenu`).then(list=> {
    originMenuList.value = list
    menuTree.value = listToTree(list)

    // 设置初始化展开
    // 判断是否有缓存
    let myTree = localStorage.getItem('myTree');
    console.log('缓存myTree',myTree)
    if(myTree){
      expandedKeys.value = myTree.split(",")
    } else {
      expandedKeys.value = [1]
    }
  })
}
getMenu()

// 添加目录
function addMenu(){
  postRequest(window.baseURL + `/admin/addMenu`,{
    name: newMenuName.value,
    parentId: selectedMenuId.value
  }).then(()=> {
    dialogVisible.value = false
    newMenuName.value = ""
    getMenu()
  })
}

// 获取接口列表
const interfaceList = ref([])
function requestList(){
  getRequest(window.baseURL + `/admin/getInterface/${selectedMenuId.value}`).then(list=> {
    interfaceList.value = list.map(item=>{
      selectTableCellIndex.value = -1
      item.tables = JSON.parse(item.tables)
      return item
    })
  })
}


// 点击复制
function clickCopyText(text){
  copyTextToClipboard(text)
  ElMessage({
    message: '复制成功',
    type: 'success'
  });
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // 避免在页面不可见的地方显示textarea
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);

  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? '成功复制到剪贴板！' : '无法复制到剪贴板！';
    console.log(msg);
  } catch (err) {
    console.log('无法复制到剪贴板！');
  }

  document.body.removeChild(textArea);
}

</script>

<style scoped>

</style>