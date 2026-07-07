if (document.getElementById("body").hasAttribute("data-swup") && typeof Swup !== "undefined") {
  jQuery.fn.Shake = function (times, distance) {
    this.each(function () {
      var element = $(this);
      element.css({ position: "relative" });
      for (var x = 1; x <= times; x++) {
        element.animate({ left: -distance }, 50)
          .animate({ left: distance }, 50)
          .animate({ left: 0 }, 50);
      }
    });
    return this;
  };

  // Initialize Swup
  var swup = new Swup({
    containers: ["#main"],
  });

  // Handle search form manually
  var searchForm = document.getElementById("search");
  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = document.getElementById("s").value;
      if (query) {
        var separator = window.location.search ? "&" : "?";
        swup.loadPage({
          url: window.location.pathname + separator + "s=" + encodeURIComponent(query),
        });
      }
    });
  }

  // Swup lifecycle hooks
  swup.on("visit:start", function () {
    $("#header").prepend("<div id='bar'></div>");
  });

  swup.on("content:replace", function () {
    setTimeout(function () {
      $("#bar").remove();
    }, 300);
    $("#header").removeClass("on");
    $("#s").val("");
    $("#secondary").removeAttr("style");
    if (typeof hljs !== "undefined") {
      document.querySelectorAll("pre code").forEach(function (block) {
        hljs.highlightBlock(block);
      });
    }
  });

  swup.on("page:view", function () {
    if ($(".ajaxload").length) {
      initLoadMore();
    }
    syncCatalogButton();
    setupCommentForm();
    setupProtectedPost();
    if (typeof _hmt !== "undefined") {
      _hmt.push(["_trackPageview", location.pathname + location.search]);
    }
    if (typeof ga !== "undefined") {
      ga("send", "pageview", location.pathname + location.search);
    }
  });

  function setupCommentForm() {
    $body = $("html,body");
    var commentListSelector = ".comment-list",
      commentNumSelector = ".comment-num",
      replyLinkSelector = ".comment-reply a",
      whisperReplySelector = ".whisper-reply",
      textareaSelector = "#textarea",
      newCommentId = "",
      parentReplyId = "";
    bindReplyClick();
    $("#comment-form").submit(function () {
      $.ajax({
        url: $(this).attr("action"),
        type: "post",
        data: $(this).serializeArray(),
        error: function () {
          alert("提交失败，请检查网络并重试或者联系管理员。");
          return false;
        },
        success: function (responseData) {
          if (!$(commentListSelector, responseData).length) {
            alert(
              "您输入的内容不符合规则或者回复太频繁，请修改内容或者稍等片刻。",
            );
            return false;
          } else {
            newCommentId = $(commentListSelector, responseData)
              .html()
              .match(/id=\"?comment-\d+/g)
              .join()
              .match(/\d+/g)
              .sort(function (a, b) {
                return a - b;
              })
              .pop();
            if ($(".page-navigator .prev").length && parentReplyId == "") {
              newCommentId = "";
            }
            if (parentReplyId) {
              responseData = $("#li-comment-" + newCommentId, responseData).hide();
              if ($("#" + parentReplyId).find(".comment-children").length <= 0) {
                $("#" + parentReplyId).append(
                  "<div class='comment-children'><ol class='comment-list'><\/ol><\/div>",
                );
              }
              if (newCommentId) $("#" + parentReplyId + " .comment-children .comment-list").prepend(responseData);
              parentReplyId = "";
            } else {
              responseData = $("#li-comment-" + newCommentId, responseData).hide();
              if (!$(commentListSelector).length)
                $("#comments").prepend(
                  "<h3>已有 <span class='comment-num'>0<\/span> 条评论<\/h3><ol class='comment-list'><\/ol>",
                );
              $(commentListSelector).prepend(responseData);
            }
            $("#li-comment-" + newCommentId).fadeIn();
            var currentCount;
            $(commentNumSelector).length
              ? ((currentCount = parseInt($(commentNumSelector).text().match(/\d+/))),
                $(commentNumSelector).html(
                  $(commentNumSelector)
                    .html()
                    .replace(currentCount, currentCount + 1),
                ))
              : 0;
            TypechoComment.cancelReply();
            $(textareaSelector).val("");
            $(replyLinkSelector + "," + whisperReplySelector + ", #cancel-comment-reply-link").off("click");
            bindReplyClick();
            if (newCommentId) {
              $body.animate(
                { scrollTop: $("#li-comment-" + newCommentId).offset().top - 50 },
                300,
              );
            } else {
              $body.animate(
                { scrollTop: $("#comments").offset().top - 50 },
                300,
              );
            }
          }
        },
      });
      return false;
    });
    function bindReplyClick() {
      $(replyLinkSelector + "," + whisperReplySelector).click(function () {
        parentReplyId = $(this).parent().parent().parent().attr("id");
      });
      $("#cancel-comment-reply-link").click(function () {
        parentReplyId = "";
      });
    }
  }
  setupCommentForm();
  if (document.getElementById("token")) {
    var protoken = document.getElementById("token").value.replace("Token", "");
  }
  function setupProtectedPost() {
    $(".protected .post-title a, .protected .more a").click(function () {
      var postElement = $(this).parent().parent();
      postElement.find(".word").text("请输入密码访问").css("color", "red").Shake(2, 10);
      postElement.find(":password").focus();
      return false;
    });
    $(".protected form").submit(function () {
      protectedForm = $(this);
      statusMsg = protectedForm.find(".word");
      $(statusMsg).removeAttr("style").addClass("loading").text("请稍等");
      $(".ajaxload").length ? submitPassword() : fetchPasswordToken();
      return false;
    });
  }
  setupProtectedPost();
  function fetchPasswordToken() {
    var postUrl = $(".protected .post-title a").attr("href");
    if ($("h1.post-title").length) {
      protoken = $(".protected form").attr("action").replace(postUrl, "");
      submitPassword();
    } else {
      $.ajax({
        url: window.location.href,
        success: function (responseData) {
          protoken = $('.protected form[action^="' + postUrl + '"]', responseData)
            .attr("action")
            .replace(postUrl, "");
          submitPassword();
        },
      });
    }
  }
  function submitPassword() {
    var postUrl = protectedForm.parent().parent().find(".post-title a").attr("href");
    $.ajax({
      url: postUrl + protoken,
      type: "post",
      data: protectedForm.serializeArray(),
      error: function () {
        resetStatusText();
        statusMsg
          .text("提交失败，请检查网络并重试或者联系管理员。")
          .css("color", "red")
          .Shake(2, 10);
        return false;
      },
      success: function (responseData) {
        if (!$("h1.post-title", responseData).length) {
          resetStatusText();
          statusMsg
            .text("对不起,您输入的密码错误。")
            .css("color", "red")
            .Shake(2, 10);
          $(":password").val("");
          return false;
        } else {
          resetStatusText();
          statusMsg
            .text("密码正确，如果没有跳转新页面，请手动刷新本页。")
            .css("color", "blue");
          $("h1.post-title").length
            ? swup.loadPage({url: window.location.href})
            : swup.loadPage({url: postUrl});
        }
      },
    });
    function resetStatusText() {
      $(statusMsg).removeClass("loading");
    }
  }
}
var isLoading = true;
function initLoadMore() {
  $('.ajaxload li[class!="next"]').remove();
  $(".ajaxload .next a").click(function () {
    if (isLoading) {
      isLoading = false;
      loadNextPage();
    }
    return false;
  });
}
function loadNextPage() {
  var nextLinkSelector = ".ajaxload .next a",
    nextUrl = $(nextLinkSelector).attr("href");
  $(nextLinkSelector).addClass("loading").text("正在加载");
  if (nextUrl) {
    $.ajax({
      url: nextUrl,
      error: function () {
        alert("请求失败，请检查网络并重试或者联系管理员");
        $(nextLinkSelector).removeAttr("class").text("查看更多");
        isLoading = true;
        return false;
      },
      success: function (responseData) {
        var newPosts = $(responseData).find("#main .post"),
          newNextUrl = $(responseData).find(nextLinkSelector).attr("href");
        if (newPosts) {
          $(".ajaxload").before(newPosts);
        }
        $(nextLinkSelector).removeAttr("class");
        if (newNextUrl) {
          $(nextLinkSelector).text("查看更多").attr("href", newNextUrl);
        } else {
          $(nextLinkSelector).remove();
          $(".ajaxload .next").text("没有更多文章了");
        }
        if ($(".protected", responseData).length) {
          $(".protected *").off();
          setupProtectedPost();
        }
        isLoading = true;
        return false;
      },
    });
  }
}
if (document.getElementsByClassName("ajaxload").length) {
  initLoadMore();
  if ($(".ajaxload.auto").length) {
    $(window).scroll(function () {
      if (
        isLoading &&
        $(".ajaxload .next a").attr("href") &&
        $(this).scrollTop() + $(window).height() + 5 >= $(document).height()
      ) {
        isLoading = false;
        loadNextPage();
      }
    });
  }
}
window.onscroll = function () {
  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  var topBtn = document.getElementById("top");
  var sidebar = document.getElementById("secondary");
  var isHeadFixed = document
    .getElementsByTagName("body")[0]
    .classList.contains("head-fixed");
  if (topBtn) {
    var topBtnElement = document.getElementById("top");
    if (scrollTop >= 200) {
      topBtnElement.removeAttribute("class");
    } else {
      topBtnElement.setAttribute("class", "hidden");
    }
    topBtnElement.onclick = function totop() {
      var currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      if (currentScrollTop > 1) {
        requestAnimationFrame(totop);
        scrollTo(0, currentScrollTop - currentScrollTop / 5);
      } else {
        cancelAnimationFrame(totop);
        scrollTo(0, 0);
      }
    };
  }
  if (isHeadFixed) {
    var headerElement = document.getElementById("header");
    if (scrollTop > 0 && scrollTop < 30) {
      headerElement.style.padding = 15 - scrollTop / 2 + "px 0";
    } else if (scrollTop >= 30) {
      headerElement.style.padding = 0;
    } else {
      headerElement.removeAttribute("style");
    }
  }
  if (sidebar && sidebar.hasAttribute("sidebar-fixed")) {
    var mainElement = document.getElementById("main");
    var windowHeight = document.documentElement.clientHeight;
    var headerOffset = isHeadFixed ? 0 : 41;
    if (mainElement.offsetHeight > sidebar.offsetHeight) {
      if (sidebar.offsetHeight > windowHeight - 71 && scrollTop > sidebar.offsetHeight + 101 - windowHeight) {
        if (scrollTop < mainElement.offsetHeight + 101 - windowHeight) {
          sidebar.style.marginTop = scrollTop - sidebar.offsetHeight - 101 + windowHeight + "px";
        } else {
          sidebar.style.marginTop = mainElement.offsetHeight - sidebar.offsetHeight + "px";
        }
      } else if (sidebar.offsetHeight <= windowHeight - 71 && scrollTop > 30 + headerOffset) {
        if (scrollTop < mainElement.offsetHeight - sidebar.offsetHeight + headerOffset) {
          sidebar.style.marginTop = scrollTop - 30 - headerOffset + "px";
        } else {
          sidebar.style.marginTop = mainElement.offsetHeight - sidebar.offsetHeight - 30 + "px";
        }
      } else {
        sidebar.removeAttribute("style");
      }
    }
  }
};
if (document.getElementById("music")) {
  (function () {
    var audioElement = document.getElementById("audio");
    var musicButton = document.getElementById("music");
    var playlist = audioElement.getAttribute("data-src").split(",");
    var volume = audioElement.getAttribute("data-vol");
    if (volume && volume >= 0 && volume <= 1) {
      audioElement.volume = volume;
    }
    audioElement.src = playlist.shift();
    audioElement.addEventListener("play", onAudioPlay);
    audioElement.addEventListener("pause", onAudioPause);
    audioElement.addEventListener("ended", handleAudioError);
    audioElement.addEventListener("error", handleAudioError);
    audioElement.addEventListener("canplay", queueCurrentTrack);
    function handleAudioError() {
      if (!playlist.length) {
        audioElement.removeEventListener("play", onAudioPlay);
        audioElement.removeEventListener("pause", onAudioPause);
        audioElement.removeEventListener("ended", handleAudioError);
        audioElement.removeEventListener("error", handleAudioError);
        audioElement.removeEventListener("canplay", queueCurrentTrack);
        musicButton.style.display = "none";
        alert(
          "本站的背景音乐好像有问题了，希望您可以通过留言等方式通知管理员，谢谢您的帮助。",
        );
      } else {
        audioElement.src = playlist.shift();
        audioElement.play();
      }
    }
    function onAudioPlay() {
      musicButton.setAttribute("class", "play");
      audioElement.addEventListener("timeupdate", updateProgressBar);
    }
    function onAudioPause() {
      musicButton.removeAttribute("class");
      audioElement.removeEventListener("timeupdate", updateProgressBar);
    }
    function queueCurrentTrack() {
      playlist.push(audioElement.src);
    }
    function updateProgressBar() {
      musicButton.getElementsByTagName("i")[0].style.width =
        ((audioElement.currentTime / audioElement.duration) * 100).toFixed(1) + "%";
    }
    musicButton.onclick = function () {
      if (
        audioElement.canPlayType("audio/mpeg") != "" ||
        audioElement.canPlayType('audio/ogg;codes="vorbis"') != "" ||
        audioElement.canPlayType('audio/mp4;codes="mp4a.40.5"') != ""
      ) {
        if (audioElement.paused) {
          if (audioElement.error) {
            handleAudioError();
          } else {
            audioElement.play();
          }
        } else {
          audioElement.pause();
        }
      } else {
        alert("对不起，您的浏览器不支持HTML5音频播放，请升级您的浏览器。");
      }
    };
    musicButton.removeAttribute("class");
  })();
}
var hasCornerTool = true;
function syncCatalogButton() {
  var catalogColumn = document.getElementById("catalog-col"),
    catalogBtn = document.getElementById("catalog"),
    cornerToolElement = document.getElementById("cornertool"),
    newListItem;
  if (catalogColumn && !catalogBtn) {
    if (cornerToolElement) {
      cornerToolElement = cornerToolElement.getElementsByTagName("ul")[0];
      newListItem = document.createElement("li");
      newListItem.setAttribute("id", "catalog");
      newListItem.setAttribute("onclick", "Catalogswith()");
      newListItem.appendChild(document.createElement("span"));
      cornerToolElement.appendChild(newListItem);
    } else {
      hasCornerTool = false;
      cornerToolElement = document.createElement("div");
      cornerToolElement.setAttribute("id", "cornertool");
      cornerToolElement.innerHTML =
        '<ul><li id="catalog" onclick="Catalogswith()"><span></span></li></ul>';
      document.body.appendChild(cornerToolElement);
    }
    document.getElementById("catalog").className = catalogColumn.className;
  }
  if (!catalogColumn && catalogBtn) {
    hasCornerTool
      ? cornerToolElement.getElementsByTagName("ul")[0].removeChild(catalogBtn)
      : document.body.removeChild(cornerToolElement);
  }
  if (catalogColumn && catalogBtn) {
    catalogBtn.className = catalogColumn.className;
  }
}
syncCatalogButton();
if (typeof hljs !== "undefined") {
  hljs.initHighlightingOnLoad();
}

console.log(
  "\n%c Initial By JIElive %c",
  "color:#fff;background:#000;padding:5px 0",
  "color:#fff;background:#666;padding:5px 0",
);
