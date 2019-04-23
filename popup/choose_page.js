//how to save note,question and solution separately as popup window goes when you get to copy other element
var postUrl = "http://localhost/chrome_content_saver/popup/post.php";

function random_string(num_s){
  let r = Math.random().toString(36).substring(num_s);
  return r;
}

function generate_valid_key(){
  var con = true;
  while(con){
    var key_need = random_string(7);
    $.ajax({
      type: 'POST',
      url: postUrl,
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
  }
  return key_need;
}

function getScriptURL(){
  var scripts = document.getElementsByTagName('script');
  var lastScript = scripts[scripts.length-1];
  var scriptName = lastScript.src;
  var scriptUrlArray = scriptName.split('/');
  var scriptUrlArray = scriptUrlArray.splice(0,scriptUrlArray.length-1);
  var scriptUrl = scriptUrlArray.join('/');
  // alternatie var script =  document.currentScript || document.querySelector('script[src*="choose_page.js"]'); return script.src;
  return scriptUrl;
}

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

function getCurrentTabUrls(){
  var urls=Array();
  chrome.tabs.query(
    {/*currentWindow: true, active: true*/}, 
      function(tabs){
        for (let tab of tabs) {
            var title_ = tab.title;
            var url_ = tab.url;
            urls.push(url_);
            
        }
        var url_file_text = htmlDecode( urls.join('<br>').replace(/\<br>/g,'\r\n') );
        download("urls.txt",url_file_text);
      }
  );
  
}

function remove_select_option_by_value(id,value){
  var selectobject=document.getElementById(id);
  for (var i=0; i<selectobject.length; i++){
  if (selectobject.options[i].value == value )
     selectobject.remove(i);
  }
}



  


function populate_categories(){
  if(document.getElementById("select")){
    var elem = document.getElementById("select");
    elem.parentNode.removeChild(elem);
  }
  
  var select_div = document.createElement("select");
  select_div.setAttribute("id", "select");
  select_div.onchange = function () {
    if (this[this.selectedIndex].value === "NEW") {      
      remove_select_option_by_value("select","NEW");

      var input_div = document.createElement("div");
      input_div.setAttribute("id", "input_cat_div");
      document.body.appendChild(input_div);
      input_div.innerHTML += '<input type="text" id="new_input_cat" placeholder="New Category"><input id="new_input_cat_submit" type="submit">';
    }
  };
  var container_div = document.getElementById("form1");
  container_div.insertBefore(select_div, container_div.firstChild);


  $.post(postUrl, {"action":"get_cats"}, function(txt){
    if(select_div){
      var arTxt = txt.split(',');
      for (let cat of arTxt) {
        select_div.innerHTML += '<option value="'+cat+'">'+cat+'</option>';
      }
      select_div.innerHTML += '<option value="NEW">NEW</option>';  
    }
  });
}


document.addEventListener("click", function(e) {
  //page 1
  if(e.target.id == "watch_later"){
    chrome.tabs.query(
      {currentWindow: true, active: true},
      function(tabs){
        var title = tabs[0].title;
        var url = tabs[0].url;
        var id = tabs[0].id;
        var r = generate_valid_key();
        $.post(postUrl, {"action":"watch_later","title":title,"url":url,"postkey":r},function(txt){
          if(txt == r){
            document.body.innerHTML = 'Watch it later.';
            setTimeout(function(){ chrome.tabs.remove(id); }, 1000);
          }else if(txt == "exists"){
            document.body.innerHTML = 'Already Exists in watch later!!!';
            setTimeout(function(){ chrome.tabs.remove(id); }, 1000);
          }
        });
      }
    );
  }else if(e.target.id == "submit_to_category"){
    document.getElementById("initial").style="display:none;";
    document.getElementById("form1").style="display:block;";
    populate_categories();
  }else if(e.target.id == "open_one_from_last_session"){
    $.post(postUrl, {"action":"open_one_from_last_session"}, function(txt){
      var json = JSON.parse(txt);
      var url = json[0];
      var repeat = json[1];
      var postkey = json[2];
      if(repeat == 'norepeat'){
        $.post(postUrl, {"action":"read_once","url":url,"postkey":postkey},function(txt){
          if(txt == 'read-once'){
            chrome.tabs.create({url: url/*,"selected":false*/},function(tab){
              //alert(tab.id);
            });
          }
        })
      }else if(repeat == 'repeat'){
        var confirmation = confirm("Want to watch again?");
        if(confirmation){
          $.post(postUrl, {"action":"read_again","url":url,"postkey":postkey},function(txt){
            if(txt == 'read-again'){
              chrome.tabs.create({url: url});
            }
          })
        }else{

        }
      }
    })
  }else if(e.target.id == "new_input_cat_submit"){    
    var inText = document.getElementById("new_input_cat");
    $.post(postUrl, {"action":"input_category","new_category":inText.value}, function(txt){
      populate_categories();
    });
    
    var elem = document.getElementById("input_cat_div");
    elem.parentNode.removeChild(elem);
  }
  else if(e.target.id == "restore_last_session"){
    $.ajax({
      type: 'POST',
      url: postUrl,
      data: {"action":"restore_last_session"},
      error: function(jqXHR, textStatus) { alert(textStatus); },
      dataType: 'text',
      async: false,
      success: function(txt){
        var urls = JSON.parse(txt);
        for(let url of urls)
        chrome.tabs.create({url: url});
      }
    });
    
  }else if(e.target.id == "populate_tabs"){
    var urls = Array();
    chrome.tabs.query(
      {/*currentWindow: true, active: true*/}, 
      function(tabs){
        var urls = Array();
        document.getElementById("initial").style="display:none;";

        var tab_div = document.createElement("div");
        tab_div.setAttribute("id", "populated_tab_div");
        document.body.appendChild(tab_div);

        for(let tab of tabs){
          urls.push(tab.url);
          document.getElementById("populated_tab_div").innerHTML += "<span id='"+tab.id+"' class='populated_tab'>" + tab.title + "</span><br>";
        }
      }
    );

  }else if(e.target.className == "populated_tab"){
    var target_id = parseInt(e.target.id);
    chrome.tabs.update(target_id, {selected: true});
  }else if(e.target.id == "save_this_session"){
    chrome.tabs.query(
    {/*currentWindow: true, active: true*/}, 
      function(tabs){
        var urls = Array();
        for(let tab of tabs){
          urls.push(tab.url);
        }
        
        var r = generate_valid_key();
        $.ajax({
          type: 'POST',
          url: postUrl,
          data: {"action":"save_this_session","urls":urls.join(','),"postkey":r},
          error: function(jqXHR, textStatus) { alert(textStatus); },
          dataType: 'text',
          async: false,
          success: function(txt){
            if(txt == r){
              document.body.innerHTML = "Saved your tabs !!!";
              setTimeout(function(){ window.close(); }, 1500);
              chrome.tabs.query(
              {/*currentWindow: true, active: true*/}, 
                function(tabs){
                  for(let tab of tabs){
                    chrome.tabs.remove(tab.id);
                    //last tab remains when it closes so it can add up this tab when restored
                  }
                }
              );
            }else{
              alert("All this tabs are already saved !!!");
            }
          }
        });
      }
    );
  }
  else if(e.target.id == "export_opened_tab_urls"){
    //var TagName_ = window.prompt("Enter a file URL","TagName");
    getCurrentTabUrls();
  }
  //page 1

  //category page
  if(e.target.className == "details"){
    var sle = document.getElementById("select");
    var category = sle.options[sle.selectedIndex].value;
    var solution = document.getElementById("solution").value;
    var question = document.getElementById("question").value;
    var note = document.getElementById("note").value;
    var url = window.location.href;
    
    chrome.tabs.query(
      {currentWindow: true, active: true},
      function(tabs){
        var title = tabs[0].title;
        var newURL = postUrl+'?title='+title+'&cat='+category+'&sol='+solution+'&ques='+question+'&note='+note+'&url='+url;
        chrome.tabs.create({ url: newURL });    
      }
    );
    
  }
  else if(e.target.className == "submit"){
    chrome.tabs.query(
    {currentWindow: true, active: true}, 
      function(tabs){
            var title1 = tabs[0].title;
            var url1 = tabs[0].url;
            //var TagName_ = window.prompt("Enter a file URL","TagName");
            var sle = document.getElementById("select");
            var TagName_ = sle.options[sle.selectedIndex].value;
            var solution_ = escape(document.getElementById("solution").value);
            var note_ = document.getElementById("note").value;
            var question_ = document.getElementById("question").value;
            var post_key_now = generate_valid_key();
            //use unescape() to read after getting data from database
            var data = {
                "title": title1,
                "url": url1,
                "tag": TagName_,
                "postkey": post_key_now,
                "solution":solution_,
                "note":note_,
                "question":question_,
                "action":"post_data"
            };  

            $.post(postUrl, data, function(txt){
              if(post_key_now == txt){
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
  //category page

  
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