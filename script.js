// const host = 'http://127.0.0.1:9211';
const host = 'https://82.156.12.45:9204';

let results = undefined;
async function setClipboard(txt, html) {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([txt], { type: "text/plain" }),
      "text/html": new Blob([html], { type: "text/html" })
    }),
  ]);
}

function updateHint(t) {
  $("#hint").css("opacity", '1');
  $("#hint").html(t);
}

async function translate() {
  const clipboardContents = await navigator.clipboard.read();
  for (const item of clipboardContents) {
    console.log(item.types);
    let txt, html;
    try {
      txt = await item.getType("text/plain");
      html = item.types.includes("text/html") ? await item.getType("text/html") : "";
    } catch (error) {
      updateHint("好像没复制东西诶");
      return;
    }
    function sendRequest(t, v) {
      $('#loading-anim').css("visibility", "visible");
      updateHint("小熊思考…");
      results = undefined;
      $.ajax({
        url: host + '/translate',
        type: 'POST',
        data: {
          'txt': t,
          'html': v
        },
        success: function (resp) {
          const data = JSON.parse(resp);
          results = data;
          $('#loading-anim').css("visibility", "hidden");
          updateHint("好啦！可以复制结果啦！");
        }
      });
    }
    txt.text().then((t) => {
      if (html === "") {
        sendRequest(t, "");
      } else {
        html.text().then((v) => {
          sendRequest(t, v);
        });
      }
    });
  }
}

function copyResult() {
  if (results === undefined) {
    if ($('#loading-anim').css("visibility") == "hidden") {
      updateHint("请先点击翻译");
      return;
    } else {
      updateHint("再等一等，小熊马上就好");
      return;
    }
  } else {
    setClipboard(results.txt, results.html);
  }
}

$('#btn-tran').on('click', translate);
$('#btn-copy').on('click', copyResult);