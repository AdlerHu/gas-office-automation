// 將資料寫入 db 表格
function write_data_to_db(target_spread_sheet_id, target_sheet_name, new_data_list){
  for ( i=0 ; i < new_data_list.length ; i++ ){
    if (new_data_list[i].length >0){
      let target_spread_sheet = SpreadsheetApp.openById(target_spread_sheet_id)
      let target_sheet = target_spread_sheet.getSheetByName(target_sheet_name)      
      let target_data = target_sheet.getDataRange().getValues()

      target_sheet.getRange(target_data.length + 1, 1, new_data_list[i].length, new_data_list[i][0].length).setValues(new_data_list[i])
    }
  };
};

// 寫入前清空舊資料，確保資料同步
function clear_old_data(target_spread_sheet_id, target_sheet_name){
  // 获取目标 Spreadsheet 对象
  let spreadsheet = SpreadsheetApp.openById(target_spread_sheet_id);
  let sheet = spreadsheet.getSheetByName(target_sheet_name);
  
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
};


function check_technical_account_table(source_spread_sheet_id, target_spread_sheet_id, source_sheet_name_list, target_sheet_name){

  // 先清除DB 表舊資料，確保程式完成後資料會是同步
  clear_old_data(target_spread_sheet_id, target_sheet_name);

  source_sheet_name_list.forEach(function(source_sheet_name){
    let source_data = SpreadsheetApp.openById(source_spread_sheet_id).getSheetByName(source_sheet_name).getDataRange().getValues();
    let headers = source_data[0]

    // 0: Ali, 1: Tencent, 2:Huawei
    let new_data_list = [[], [], []];

    for (var i = 1 ; i < source_data.length ; i++){
      let row = source_data[i];
      let uid = row[headers.indexOf('UID/錢包專案')];

      let cloud = row[headers.indexOf('雲平台')]

      switch (cloud){
        case '阿里雲':
          new_data_list[0].push([uid, row[headers.indexOf('代號')], row[headers.indexOf('告警 Email')]]);
          break;
        case '騰訊雲':
          new_data_list[1].push([uid, row[headers.indexOf('代號')], row[headers.indexOf('告警 Email')]]);
          break;
        case '華為雲':
          new_data_list[2].push([uid, row[headers.indexOf('代號')], row[headers.indexOf('告警 Email')]]);
          break;
        default:
          break;
      }
    };
    write_data_to_db(target_spread_sheet_id, target_sheet_name, new_data_list);
  })
  Logger.log('同步完成')
};

function main(){
  // 技術用帳密表ID
  const source_spread_sheet_id = '1adMHrhi1rOlols87WmrAJCX_0GTM1ke2pPpULnbWjqA';
  // 中國雲 customer-bd表ID
  const target_spread_sheet_id = '1GhvvMVowXtwY5mZfEJsTsFBK3EIorgk2W5sLRNpKkAo';
  // 帳密表的 sheet 名
  const source_sheet_name_list = ['CO&F', 'K', 'M', 'HK'];
  // 中國雲告警用 customer-bd表 sheet名
  const target_sheet_name = 'sheet1'

  check_technical_account_table(source_spread_sheet_id, target_spread_sheet_id, source_sheet_name_list, target_sheet_name);
}
