
<template>
<div style="padding: 10px;display: flex;">

  <div style="padding: 30px;">
    <el-button @click="$router.back()" style="margin-bottom: 10px;">返回</el-button>

    <!-- 新增 -->
    <div style="display: flex;flex-direction: column;align-items: center;">
      <div style="display: flex">
        <div style="display: flex;flex-direction: column;border: 1px solid #ccc;padding: 10px;">
          <div style="width: 200px;">
            关联表1
            <el-select
                style="margin-top: 10px;"
                v-model="form.tableFirst"
                @change="requestGetAllFieldsForTables(1, form.tableFirst)"
                filterable
                default-first-option
                placeholder="请选择对应的表">
              <el-option
                  v-for="item in tableOptions"
                  :key="item"
                  :label="item"
                  :value="item">
              </el-option>
            </el-select>
          </div>
          <div style="width: 150px;margin-top: 10px;">
            关联字段1
            <el-select
                style="margin-top: 10px;"
                v-model="form.associativeFieldFirst"
                filterable
                default-first-option
                placeholder="请选择对应的表">
              <el-option
                  style="margin-top: 10px;"
                  v-for="item in feildList1"
                  :key="item"
                  :label="item.Field"
                  :value="item.Field">
                {{item.Field}}
              </el-option>
            </el-select>
          </div>
        </div>

        <div style="margin: auto 20px;">
          <el-icon><Switch /></el-icon>
        </div>
        <div style="display: flex;flex-direction: column;border: 1px solid #ccc;padding: 10px;">

          <div style="width: 200px;">
            关联表2
            <el-select
                style="margin-top: 10px;"
                v-model="form.tableSecond"
                @change="requestGetAllFieldsForTables(2, form.tableSecond)"
                filterable
                default-first-option
                placeholder="请选择对应的表">
              <el-option
                  v-for="item in tableOptions"
                  :key="item"
                  :label="item"
                  :value="item">
              </el-option>
            </el-select>
          </div>
          <div style="width: 150px;margin-top: 10px;">
            关联字段2
            <el-select
                style="margin-top: 10px;"
                v-model="form.associativeFieldSecond"
                filterable
                default-first-option
                placeholder="请选择对应的表">
              <el-option
                  v-for="item in feildList2"
                  :key="item"
                  :label="item.Field"
                  :value="item.Field">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <el-button type="success" plain @click="clickAdd" style="margin-top: 20px;">新增</el-button>
    </div>
  </div>

  <div style="margin-left: 30px;padding-left: 30px;border-left: 1px solid #ccc;">
    <div style="display: flex;align-items: center;margin: 20px 0;">
      搜索
      <el-input @input="searchChange"  v-model="searchValue" style="width: 200px;margin-left: 10px;"></el-input>
    </div>
    <!-- 关联表 -->
    <div style="color: #539FFF;">关联表:</div>
    <div style="display: flex;flex-direction: column;width: 800px;height: 800px;overflow: scroll;border:1px solid #ccc;border-radius: 8px;margin-top: 20px;padding: 20px;">
      <div style="display: flex;border-bottom: 1px solid #ccc" v-for="item in showTableData">
        <div class="table-item" >
          <el-button type="primary"  style="margin-bottom: 10px;" @click="clickCopy(item.tableFirst)">{{item.tableFirst}}</el-button>
          <div style="margin-bottom: 10px;">{{item.tableFirstName}}</div>
          <div style="color:#F8A500;">{{item.associativeFieldFirst}}</div>
        </div>
        <div style="margin: auto">
          <el-icon><Switch /></el-icon>
        </div>
        <div class="table-item" >
          <el-button type="primary"  style="margin-bottom: 10px;" @click="clickCopy(item.tableSecond)">{{item.tableSecond}}</el-button>
          <div style="margin-bottom: 10px;">{{item.tableSecondName}}</div>
          <div style="color:#F8A500;">{{item.associativeFieldSecond}}</div>
        </div>
        <div style="margin: auto;cursor:pointer;" @click="clickDelete(item.id)">
          <el-icon style="color: red;"><DeleteFilled /></el-icon>
        </div>
      </div>
    </div>

  </div>
</div>

</template>

<script setup>
import {ref} from "vue";

const tableData = ref([])

const showTableData = ref([])
const form = ref({})

import { ElMessage, ElMessageBox } from 'element-plus'

function requestList(){
  getRequest(window.baseURL + "/admin/getAssociativeTable").then(res => {
    tableData.value = res
    searchChange()
  })
}
requestList()

function clickAdd(){

  postRequest(window.baseURL + "/admin/associativeTable/insertAndUpdate", form.value).then(res => {
    requestList()
    ElMessage({
      message: '添加成功',
      type: 'success'
    });
  })
}

const searchValue = ref("")
function searchChange(){
  if(searchValue.value){
    let newList = []
    tableData.value.find(item => {
      if(item.tableFirst.indexOf(searchValue.value) != -1){
        newList.push(item)
      }
      else if(item.tableSecond.indexOf(searchValue.value) != -1){
        newList.push(item)
      }
    })
    showTableData.value = newList
  } else {
    showTableData.value = tableData.value
  }
}


const tableOptions =ref([])
// 1.获取所有表格
function requestGetAllTables() {
  getRequest(window.baseURL + "/admin/getAllTables").then(res => {
    tableOptions.value = res
  })
}
requestGetAllTables()

const feildList1 = ref([])
const feildList2 = ref([])
// 2.获取表的所有字段
function requestGetAllFieldsForTables(num, tableName) {
  const params = {
    "table": tableName
  }
  postRequest(window.baseURL + "/admin/getAllFieldsForTables", params).then(res => {
    // 将表字段 转为 选项
    if(num == 1) {
      feildList1.value = res
    }
    else if(num == 2) {
      feildList2.value = res
    }
  })
}

// 点击复制
function clickCopy(text){
  copyTextToClipboard(text)
  ElMessage({
    message: '复制成功',
    type: 'success'
  });
}

function clickDelete(id){
  ElMessageBox.confirm(
      '你是否确认删除?',
      '提示',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '删除',
        cancelButtonText: '取消',
      }
  ).then(() => {
    postRequest(window.baseURL + "/admin/associativeTable/batchDelete", [id]).then(res => {
      requestList()
      ElMessage({
        message: '删除成功',
        type: 'success'
      });
    })
  })

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
.table-item{
  width: 300px;
  margin: 20px;display: flex;flex-direction: column;align-items: center;
}
</style>