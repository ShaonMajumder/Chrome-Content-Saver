
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

document.addEventListener("click", function(e) {
  if(e.target.className == "button1"){
    $.post("http://localhost/chrome_content_saver/test.php", {"action":"get_cats"}, function(txt){
      var arTxt = txt.split(',');
      for (let cat of arTxt) {
        document.getElementById("select").innerHTML += '<option value="'+cat+'">'+cat+'</option>';
      }
    });
    document.getElementById("initial").style="display:none;";
    document.getElementById("form1").style="display:block;";
  }
  if(e.target.className == "submit"){
    chrome.tabs.query(
    {currentWindow: true, active: true}, 
      function(tabs){
            
            var title1 = tabs[0].title;
            var url1 = tabs[0].url;
            //var TagName_ = window.prompt("Enter a file URL","TagName");
            var TagName_ = $("#select :selected").val();
            var solution_ = escape($("#solution").val());
            //use unescape() to read after getting data from database
            var postkey = "2343";
              
            var con = true;
            while(con){
              let r = Math.random().toString(36).substring(7);
              var key_need = r;
              
              $.ajax({
                      type: 'POST',
                      url: "http://localhost/chrome_content_saver/test.php",
                      data: {"action":"validate_key","key_need":key_need},
                      error: function(jqXHR, textStatus) { alert(textStatus); },
                      dataType: 'text',
                      async: false,
                      success: function(txt){
                                if(txt == "No Match key"){
                                  //alert("Unique");
                                  con = false;    // breaking loop
                                  
                                }else if(key_need == txt){
                                  //alert("Not Unique");
                                }
                              }
              });

              /*$.post("http://localhost/chrome_content_saver/test.php", {"key_need":key_need}, function(txt){
                if(txt == "No Match key"){
                  alert("Unique");
                  con = false;   // not in work 
                  //close tab
                }else if(key_need == txt){
                  alert("Not Unique");
                }
              });*/
              
            }
            //alert("Achieved: "+key_need);
            var data = {
                "title": title1,
                "url": url1,
                "tag": TagName_,
                "postkey": key_need,
                "solution":solution_,
                "action":"post_data"
            };  

            $.post("http://localhost/chrome_content_saver/test.php", data, function(txt){
              if(key_need == txt){
                chrome.tabs.query(
                {currentWindow: true, active: true}, 
                  function(tabs){
                    chrome.tabs.remove(tabs[0].id);
                  }
                );
              }
            });
            document.body.innerHTML = "Successfully Done !!!";
            setTimeout(function(){ window.close(); }, 1500);

              
              
            

      }
    );

    
  }
   

  if(e.target.className == "button2"){
     var TagName_ = window.prompt("Enter a file URL","TagName");

    chrome.tabs.query(
    {/*currentWindow: true, active: true*/}, 
      function(tabs){
        document.getElementById('list').innerHTML = "";
        for (let tab of tabs) {
            var title_ = tab.title;
            var url_ = tab.url;
            
            document.getElementById('list').innerHTML += title_ + " <+>-u-r-l-<+> " + url_ + "<br>";
          }
        var url_file_text = htmlDecode( document.getElementById("list").innerHTML.replace(/\<br>/g,'\r\n') );
        download("urls.txt",url_file_text);
      }
    );

    
  }
  /*
  if (!e.target.classList.contains("page-choice")) {
    return
  }

  var chosenPage = "https://" + e.target.textContent;
  chrome.tabs.create({
    url: chosenPage
  });
  */
});