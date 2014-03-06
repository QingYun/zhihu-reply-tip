// ==UserScript==
// @name       zhihu-reply-tip
// @namespace  https://github.com/QingYun/
// @version    0.1
// @description  显示被引用的用户的最近一条评论
// @match      http://www.zhihu.com/*
// @copyright  2012+, QingYun
// ==/UserScript==

var HIDE_STYLE = "display: none";

function createReplyTipNode() {
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("class", "reply zm-comment-op-link");
    
    var i = document.createElement("i");
    i.setAttribute("class", "zg-icon zg-icon-comment-reply");
    
    a.appendChild(i);
    a.appendChild(document.createTextNode("查看 TA 的最近一条评论"));
    
    return a;
}

function latestReply(commentItems, userLookingFor, endIndex) {
    for (var i = endIndex - 1; i >= 0 ; i--) {
        var curUser = commentItems[i].querySelector(".zg-link").textContent;
        if (curUser ==  userLookingFor) {
            return commentItems[i].querySelector(".zm-comment-content").textContent;
        }
    }
}

function addReplyTips(commentBox) {
    if (commentBox.getAttribute("data-count") < 2)
        return ;
    
    var commentItems = commentBox.querySelectorAll(".zm-item-comment");
    for (var i = 0; i < commentItems.length; i++) {
        var curItem = commentItems[i];
        if (curItem.querySelector("q") === null) {
            var headNode = curItem.querySelector(".zm-comment-hd");
            if (headNode.childNodes.length > 3) {
                var referredUser;
                if (headNode.firstChild.nodeValue == "\n匿名用户")
                    referredUser = headNode.querySelectorAll(".zg-link")[0];
                else
                    referredUser = headNode.querySelectorAll(".zg-link")[1];
                
                if (referredUser) {
                    var replyTip = createReplyTipNode();
                    
                    replyTip.addEventListener("click", (function(curItem, referredReply) { 
                        return function() {
                            var q;
                            if (curItem.querySelector("q") === null) {
                                q = document.createElement("q");
                                q.setAttribute("style", HIDE_STYLE);
                                q.appendChild(document.createTextNode(referredReply));
                                
                                var content = curItem.querySelector(".zm-comment-content");
                                content.parentNode.insertBefore(q, content);
                            } else {
                                q = curItem.querySelector("q");
                            }
                            
                            if (q.getAttribute("style") == HIDE_STYLE) {
                                q.removeAttribute("style");
                            } else {
                                q.setAttribute("style", HIDE_STYLE);
                            }
                        };
                    })(curItem, latestReply(commentItems, referredUser.textContent, i)));
                    
                    curItem.querySelector(".zm-comment-hd").appendChild(replyTip);
                }
            }
        }
    }
}

(function(){
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type == "childList") {
                if (mutation.addedNodes.length && mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains("zm-comment-box")
                    && mutation.removedNodes.length && mutation.removedNodes[0].classList && mutation.removedNodes[0].classList.contains("zm-comment-box")) {
                    addReplyTips(mutation.addedNodes[0]);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true
        , subtree: true
        , attributes: false
        , characterData: false
    });
})();