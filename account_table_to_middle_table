// 將資料寫入中間表
function write_data_to_middle_table(middle_table_spread_sheet_id, middle_table_sheet_name_list, new_data_lists){
  const middle_table_spreadsheet = SpreadsheetApp.openById(middle_table_spread_sheet_id);

  for (let i = 0 ; i < new_data_lists.length ; i++){
    if (new_data_lists[i].length > 0){
      let middle_table_sheet = middle_table_spreadsheet.getSheetByName(middle_table_sheet_name_list[i]);
      let target_data = middle_table_sheet.getDataRange().getValues();

      let lastRow = middle_table_sheet.getLastRow();
      let newData = new_data_lists[i];

      middle_table_sheet.getRange(lastRow + 1, 1, newData.length, newData[0].length).setValues(newData);
    }
  }
}

// 清除舊資料，確保資料同步
function clear_old_data(middle_table_spread_sheet_id, middle_table_sheet_name_list){
  let spreadsheet = SpreadsheetApp.openById(middle_table_spread_sheet_id);

  middle_table_sheet_name_list.forEach(function(sheet_name){
    let sheet = spreadsheet.getSheetByName(sheet_name);

    // 检查是否找到了指定名称的 Sheet
    if (sheet !== null) {
      // 获取当前 Sheet 的范围
      let range = sheet.getDataRange();
      let numRows = range.getNumRows();
    
      // 如果行数大于1，即至少有一行数据（除了表头）
      if (numRows > 1) {
        // 清除除了第一行（表头）之外的所有数据
        sheet.deleteRows(2, numRows - 1);
      }
    } else {
      Logger.log("找不到名称为 '" + sheetName + "' 的工作表");
    }
  })
}

// 主邏輯
function check_technical_account_table(tech_table_spread_sheet_id, middle_table_spread_sheet_id, tech_sheet_name_list, middle_table_sheet_name_list){
  // 先清除DB 表舊資料，確保程式完成後資料會是同步
  clear_old_data(middle_table_spread_sheet_id, middle_table_sheet_name_list);

  const tech_table_spreadsheet = SpreadsheetApp.openById(tech_table_spread_sheet_id);

  tech_sheet_name_list.forEach(function(tech_sheet_name){
    let source_data = tech_table_spreadsheet.getSheetByName(tech_sheet_name).getDataRange().getValues();  
    let headers = source_data[0];

    // 0:AWS, 1:GCP, 2:Azure, 3:Ali, 0:Tencent, 0:Huawei
    let new_data_lists = [[], [], [], [], [], []]

    for (let i = 1; i < source_data.length ; i++){
      let row = source_data[i];
      
      // '預儲值' 欄位值是 'Y'，才繼續處裡
      if (row[headers.indexOf('預儲值')] == 'Y'){
        // 先只寫入AWS、GCP、Azure
        let cloud = row[headers.indexOf('雲平台')];

        switch (cloud){
          case 'AWS':
            new_data_lists[0].push([row[headers.indexOf('代號')], row[headers.indexOf('負責商務')], row[headers.indexOf('雲平台代理')], row[headers.indexOf('UID/錢包專案')], row[headers.indexOf('商務查帳連結')], row[headers.indexOf('user')], row[headers.indexOf('password')], row[headers.indexOf('備註')]]);
            break;
          case 'GCP':
            new_data_lists[1].push([row[headers.indexOf('代號')], row[headers.indexOf('負責商務')], row[headers.indexOf('雲平台代理')], row[headers.indexOf('UID/錢包專案')], row[headers.indexOf('商務查帳連結')], row[headers.indexOf('user')], row[headers.indexOf('password')], row[headers.indexOf('備註')]]);
            break;
          case 'Azure':
            new_data_lists[2].push([row[headers.indexOf('代號')], row[headers.indexOf('負責商務')], row[headers.indexOf('雲平台代理')], row[headers.indexOf('UID/錢包專案')], row[headers.indexOf('商務查帳連結')], row[headers.indexOf('user')], row[headers.indexOf('password')], row[headers.indexOf('備註')]]);
            break;
            
          default:
            break;
        }
      }
    }
    write_data_to_middle_table(middle_table_spread_sheet_id, middle_table_sheet_name_list, new_data_lists);
  })

  Logger.log('同步完成')
}

function main() {
  // 技術部帳密表 ID
  const tech_table_spread_sheet_id = '1adMHrhi1rOlols87WmrAJCX_0GTM1ke2pPpULnbWjqA';
  // 隔離用中間表 ID
  const middle_table_spread_sheet_id = '1zOSbifA6jv7ye5C-61hUnjM2eR83fY159t-Deaqoyro';
  // 技術部帳密表 sheet 名
  const tech_sheet_name_list = ['CO&F', 'K', 'M', 'HK'];
  // 隔離用中間表 sheet 名
  const middle_table_sheet_name_list = ['AWS', 'GCP', 'Azure'];

  check_technical_account_table(tech_table_spread_sheet_id, middle_table_spread_sheet_id, tech_sheet_name_list, middle_table_sheet_name_list);
};
