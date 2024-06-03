// 轉寄並留底
function forward_and_record_alert_mail(recipients, db_spreadsheet_id, db_sheet_name, alert_tag, destination_label){

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
    switch (alert_tag){
      case 'ali_alert':
        uid = get_ali_uid(subject);
        break;
      case 'tencent_alert':
        uid = get_tencent_uid(body);
        break;
      case 'huawei_alert':
        uid = get_huawei_uid();
        break;
      default:
        break;
    };

    const bd = get_bd_by_uid(uid, db_spreadsheet_id, db_sheet_name);

    if (bd){
      // Send the email
      recipients.forEach(function(recipient) {
        GmailApp.sendEmail(recipient, subject, body);
      });

      GmailApp.sendEmail(bd, subject, body);

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

function get_bd_by_uid(uid, db_spreadsheet_id, db_sheet_name){
  const spreadsheet = SpreadsheetApp.openById(db_spreadsheet_id);
  const sheet = spreadsheet.getSheetByName(db_sheet_name);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) { // Start from index 1 to skip header row
    if (data[i][0] == uid) {
      return data[i][2];
    }
  }
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


function deal_with_credit_alert_email(db_spreadsheet_id, db_sheet_name, alert_tag_list, destination_tag){

  const recipients = getRecipients();
  const destination_label = GmailApp.getUserLabelByName(destination_tag);

  // 依照 阿里 -> 騰訊 -> 華為 的順序，一次處理一家雲的告警
  alert_tag_list.forEach(function(alert_tag){
    forward_and_record_alert_mail(recipients, db_spreadsheet_id, db_sheet_name, alert_tag, destination_label);    
  });

}


function main(){
  // 中國雲告警用-customer-bd 表ID
  const db_spreadsheet_id = '1GhvvMVowXtwY5mZfEJsTsFBK3EIorgk2W5sLRNpKkAo'
  const db_sheet_name = 'sheet1'
  // 原始告警信標籤
  const alert_tag_list = ['ali_alert', 'tencent_alert', 'huawei_alert'];
  // 告警信轉寄後，移到這個標籤留底
  const destination_tag = '額度告警轉發留底';

  deal_with_credit_alert_email(db_spreadsheet_id, db_sheet_name, alert_tag_list, destination_tag);
  Logger.log('Forwarded.');
};
