// 通知負責 BD，原信轉到留底
function notify_and_record_alert_mail(db_spreadsheet_id, db_sheet_name, alert_tag, destination_label, tg_token){

  const alert_label = GmailApp.getUserLabelByName(alert_tag);
  const threads = alert_label.getThreads();

  // If no emails match the condition or threads is not an array, log an error message and exit
  if (!threads || !Array.isArray(threads)) {
    Logger.log("No emails matching the condition found.");
    return;
  }

  threads.forEach(function(thread) {
    const messages = thread.getMessages();
    const body = messages[messages.length - 1].getPlainBody();
    const subject = thread.getFirstMessageSubject();

    let uid;
    let cloud;
    switch (alert_tag){
      case 'ali_alert':
        cloud = '阿里雲';
        uid = get_ali_uid(subject);
        break;
      case 'tencent_alert':
        cloud = '騰訊雲';
        uid = get_tencent_uid(body);
        break;
      case 'huawei_alert':
        cloud = '華為雲';
        uid = get_huawei_uid();
        break;
      default:
        break;
    };

    const customer_info = get_customer_data(uid, db_spreadsheet_id, db_sheet_name);

    if (customer_info){
      notify_bd_by_tg(uid, cloud, customer_info, tg_token);

      // Remove the source label
      thread.removeLabel(alert_label);

      // Add the destination label
      thread.addLabel(destination_label);

      // Remove the thread from the inbox
      GmailApp.moveThreadToArchive(thread);
    }
  });

  // Clear emails in the source label
  const threadsToRemove = alert_label.getThreads();
  threadsToRemove.forEach(function(thread) {
    alert_label.removeFromThread(thread);
  });
};


function notify_bd_by_tg(uid, cloud, customer_info, tg_token) {
  // 通知用的 TG 群 ID
  var chatId = customer_info.bd_group; 
  var replyText = '[' + customer_info.bd_name + '](tg://user?id=' + customer_info.bdId + '): ' + '代號: ' + customer_info.customer_id 
  + ' 雲平台: ' + cloud + ' UID: ' + uid  +', 額度預警囉~';
  sendMessage(chatId, replyText, tg_token);
}


function sendMessage(chatId, text, tg_token) {
  var url = 'https://api.telegram.org/bot' + tg_token + '/sendMessage';
  var payload = {
    'chat_id': chatId,
    'text': text,
    'parse_mode': 'Markdown'
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}


// 從阿里告警郵件標題得到 UID
function get_ali_uid(subject){
  // 定義正則表達式模式來匹配並捕獲帳戶 ID
  var subjectPattern = /Account ID:(\d+)/;
  
  // 使用正則表達式匹配並提取帳戶 ID
  var match = subject.match(subjectPattern);
  
  // 如果找到匹配，返回帳戶 ID，否則返回 null
  if (match) {
    return match[1];
  } else {
    return null;
  }
}


function get_customer_data(uid, db_spreadsheet_id, db_sheet_name) {
  var sheet = SpreadsheetApp.openById(db_spreadsheet_id).getSheetByName(db_sheet_name);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    // UID 在表的第 1 欄
    if (data[i][0] == uid) {
      return {
        // 
        bd_name: data[i][2],
        // 客編
        customer_id: data[i][1],
        // BD 的 TG ID 在表的第 4 欄
        bd_id: data[i][3],
        // 通知用的 TG 群 ID 在表的第 6 欄
        bd_group: data[i][5]
      };
    }
  }
  return null;
}


function get_bd_by_uid(uid, db_spreadsheet_id, db_sheet_name) {
  const spreadsheet = SpreadsheetApp.openById(db_spreadsheet_id);
  const sheet = spreadsheet.getSheetByName(db_sheet_name);

  // Get UIDs only (first column, skip header)
  const uids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();

  // Find index of matching UID using findIndex
  const index = uids.findIndex(row => row[0] === uid);

  // Return birthdate if UID found, otherwise return undefined
  return index !== -1 ? sheet.getRange(index + 2, 3).getValue() : undefined;
}


function get_huawei_uid(){
  // 從華為告警信，提取出UID
  // 樣本太少，先 pass
  return ''
}

// 從騰訊告警內文得到UID
function get_tencent_uid(body){
  // Use a regular expression to match the ID
  const regex = /账号\sID：(\d+)/;
  const match = body.match(regex);

  if (match && match.length > 1) {
    // Match successful, return the ID
    return match[1];
  } else {
    // Match failed, return null
    return null;
  }
}


function deal_with_credit_alert_email(db_spreadsheet_id, db_sheet_name, alert_tag_list, destination_tag, tg_token){
  const destination_label = GmailApp.getUserLabelByName(destination_tag);

  // 依照 阿里 -> 騰訊 -> 華為 的順序，一次處理一家雲的告警
  alert_tag_list.forEach(function(alert_tag){
    notify_and_record_alert_mail(db_spreadsheet_id, db_sheet_name, alert_tag, destination_label, tg_token);    
  });
};


function main(){
  // TG Bot Token
  const tg_token = get_tg_bot_token();

  // 中國雲告警用-customer-bd 表ID
  const db_spreadsheet_id = '1jIJzWjiiBB-ZQhRsihfjOKcu9QImOE2cWPdvrTNEvVs'
  const db_sheet_name = 'sheet1'

  // 原始告警信標籤
  const alert_tag_list = ['ali_alert', 'tencent_alert', 'huawei_alert'];
  
  // 告警信轉寄後，移到這個標籤留底
  const destination_tag = '額度告警轉發留底';

  deal_with_credit_alert_email(db_spreadsheet_id, db_sheet_name, alert_tag_list, destination_tag, tg_token);
  Logger.log('Forwarded.');
};
