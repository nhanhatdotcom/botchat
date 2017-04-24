"use strict";

const http = require('http');
const url = require('url');
const config = require('config');
const request = require('request');
var fbbot = require('./fbbot.js').fbbot;
var bot = new fbbot();

http.createServer(
  (req, res) => {
    let urlObj = url.parse(req.url, true);

    if (urlObj.pathname === '/webhook/') {
      //GET
      if (req.method === 'GET') {
        //Verfy
        if (urlObj.query['hub.verify_token'] == config.validationToken) {
          res.end(urlObj.query['hub.challenge']);
        } else {
          res.statusCode = 403;
        }
      }
      //END-GET


      if (req.method === 'POST') {
        let body = [];

        req.on('data', (chunk) => {

          body.push(chunk);

        }).on('end', () => {

          body = Buffer.concat(body).toString();
          body = JSON.parse(body);

          // Xử lý req từ đây.
          if (body.object === 'page') {

            body.entry.forEach(pageEntry => {

              let pageId = pageEntry.id; //nếu bạn có nhiều page xài chung 1 app. Tự thêm xử lý bằng cách bắt pageId này nhé.
              let timeOfEvent = pageEntry.time;

              pageEntry.messaging.forEach(msg => {

                /*
                * msg chính là (chỉ chỉ xuống dưới 2 dòng), trong đây chúng ta sẽ phân loại và xử lý.
                *
                  messaging: [{
                    sender: { id: '1143639809025650' },
                    recipient: { id: 'PAGE_ID' },
                    timestamp: 1469039706825,

                    abc

                  }]
                * msg == messaging
                */

                // Ở đây mình dùng 1 function nhé

                kipalog(msg);

              });

            });
          }
        });

      }

    } else {
      res.statusCode = 404;
    }

    res.end();
  }
).listen('1335');
console.log('Ứng dụng đang chạy tại: http://localhost:1335');

function kipalog(msg) {

  var reqId = msg.sender.id;
  //Thông tin mặc định 
    var defaultRes = {
    text: 'Hãy chọn một trong các mục sau:',
    quick_replies: [{
      "content_type": "text",
      "title": "Thông tin",
      "payload": "QR_PICK_TEXT"
    }, {
      "content_type": "text",
      "title": "Hội Nhóm",
      "payload": "QR_PICK_GENERIC"
    }, {
      "content_type": "text",
      "title": "Máy Tính",
      "payload": "QR_PICK_BTN"
    }, {
      "content_type": "text",
      "title": "Giải trí",
      "payload": "QR_PICK_QUICKREPLY"
    }]
  }

  var defaultText = {
    text: "	Thông tin về Trường THPT Cẩm Thủy 2: \n Trường THPT Cẩm Thuỷ 2 được thành lập theo quyết định số 714-TC\UBTH ngày 02 tháng 08 năm 1984 của Uỷ ban nhân dân tỉnh Thanh Hoá.\n Mã Trường: 047 \n Mã Tỉnh: 28 \n Mã Huyện: 14 \nToàn Huyện Thuộc Khu Vực I "
  }
  var defaultGeneric = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Hội Nhóm Của Trường",
          image_url: "https://scontent.fhan2-1.fna.fbcdn.net/v/t1.0-9/486628_393491110750113_339607559_n.jpg?oh=c56f0cfec5a38d211559cffebbaa1ecc&oe=59952BE3",
          subtitle: "Đây là hội nhóm của Trường mình nhé. Hãy bấm tham gia để cùng giao lưu và kết bạn nào",
          buttons: [{
            type: "web_url",
            url: "https://www.facebook.com/groups/CamThuy2.vn/",
            title: "THPT Cẩm Thủy 2"
          }, {
            type: "postback",
            title: "Tùy chọn khác",
            payload: "HELP"
          }]
        }]
      }
    }
  }
  var defaultBtn = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Đây chỉ là dòng chữ và button phía dưới",
        buttons: [{
          type: "web_url",
          url: "http://kipalog.com/",
          title: "Kipalog site"
        }, {
          type: "postback",
          title: "Bắt đầu lại",
          payload: "HELP"
        }]
      }
    }
  }
  var defaultQR = {
    text: "Bạn muốn chơi trò gì? hãy chọn một nhé",
    quick_replies: [{
      content_type: "text",
      title: "Ai là triệu phú",
      payload: "QR_PICK_RED"
	  }, {
      content_type: "text",
      title: "Chiếc nón kỳ diệu",
      payload: "QR_PICK_GREEN"
    }]
  }


  if (msg.optin) {

    var ref = msg.optin.ref;
    if (ref) {
      switch (ref) {
        case 'FB_MAIN_WEB_BTN':
          bot.sendMsg(reqId, defaultRes);
          break;
        default:
          bot.sendMsg(reqId, defaultRes);
      }
    }

  } else if (msg.message) {
    var msgText = msg.message.text;
    if (typeof msgText === 'string') msgText = msgText.trim().toLowerCase();
    if (msg.message.hasOwnProperty('is_echo')) return;

    //Xử lý Quick Reply
    if (msg.message.quick_reply) {
      if (msg.message.quick_reply.hasOwnProperty('payload')) {
        var payload = msg.message.quick_reply.payload;
        var reg = /QR_PICK_(.*)/i;

        var regex = null;
        if (regex = reg.exec(payload)) {
          switch (regex[1]) {
            case 'Ai là triệu phú':
              bot.sendMsg(reqId, {
                text: "Chào mừng bạn tham gia ALTP"
              });
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
              break;
            case 'Chiếc nón kỳ diệu':
              bot.sendMsg(reqId, {
                text: "Chào mừng bạn tham gia Chiếc Nón Kỳ Diệu"
              });
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
              break;
            case 'TEXT':
              bot.sendMsg(reqId, defaultText);
              break;
            case 'BTN':
              bot.sendMsg(reqId, defaultBtn);
              break;
            case 'GENERIC':
              bot.sendMsg(reqId, defaultGeneric);
              break;
            case 'QUICKREPLY':
              bot.sendMsg(reqId, defaultQR);
              break;
            default:
              setTimeout(() => {
                bot.sendMsg(reqId, defaultRes)
              }, 700);
          }
        }

      }
      return;
    }
    //Xử lý text
    switch (msgText) {
      case 'text':
        bot.sendMsg(reqId, defaultText);
        break;
      case 'generic':
        bot.sendMsg(reqId, defaultGeneric);
        break;
      case 'button':
        bot.sendMsg(reqId, defaultBtn);
        break;
      case 'quick_reply':
        bot.sendMsg(reqId, defaultQR);
        break;
      case 'quick reply':
        bot.sendMsg(reqId, defaultQR);
        break;
      default:
        bot.sendMsg(reqId, defaultRes);
    }

    return;

  } else if (msg.delivery) {

    console.log('deli');

  }
  // Xử lý payload
  else if (msg.postback) {
    var msgPayload = msg.postback.payload;

    switch (msgPayload) {
      case 'GET_STARTED_BUTTON':
        bot.sendMsg(reqId, defaultRes);
        break;
      case 'HELP':
        bot.sendMsg(reqId, defaultRes);
        break;
      default:
        bot.sendMsg(reqId, defaultRes);
    }


  } else if (msg.read) {

    console.log('read');

  } else {
    console.log("Webhook received unknown messagingEvent: ", msg);
  }

}
