// كود حماية الموقع
(function(){
    // منع فتح أدوات المطور
    function preventDevTools() {
        document.addEventListener('contextmenu', e => {
            // السماح بالنقر بالزر الأيمن في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });

        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 73 || e.keyCode === 123)) {
                e.preventDefault();
            }
            if (e.key === 'F12') {
                e.preventDefault();
            }
        });
    }

    // تشويش الكود المصدري
    function obfuscateCode() {
        const _0x5f2d = [
            'preventDefault',
            'contextmenu',
            'keydown',
            'ctrlKey',
            'keyCode',
            'addEventListener'
        ];
        
        function _0x2b4c() {
            return Math.random().toString(36).substring(7);
        }
        
        const _0x1f3a = new Date().getTime();
        const _0x3d5e = window.location.hostname;
        const _0x4c6f = _0x2b4c();
        
        setInterval(() => {
            console.clear();
            console.log(_0x2b4c());
        }, 100);
    }

    // منع النسخ والتحديد
    function preventCopy() {
        document.addEventListener('copy', e => {
            // السماح بالنسخ في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });

        document.addEventListener('cut', e => {
            // السماح بالقص في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });

        document.addEventListener('paste', e => {
            // السماح باللصق في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });

        document.addEventListener('selectstart', e => {
            // السماح بالتحديد في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
        });
    }

    // منع عرض المصدر
    function preventSourceView() {
        document.onkeypress = function(event) {
            if (event.ctrlKey && (event.keyCode === 10 || event.keyCode === 13)) {
                event.preventDefault();
            }
        };
    }

    // تعطيل الماوس الأيمن
    function disableRightClick() {
        document.addEventListener('contextmenu', function(e) {
            // السماح بالنقر بالزر الأيمن في حقول الإدخال
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return true;
            }
            e.preventDefault();
            return false;
        });
    }

    // تشغيل جميع وسائل الحماية
    function initProtection() {
        preventDevTools();
        obfuscateCode();
        preventCopy();
        preventSourceView();
        disableRightClick();
        
        // رسالة تحذير
        console.log('%cتحذير!', 'color: red; font-size: 30px; font-weight: bold;');
        console.log('%cهذا الموقع محمي ضد محاولات الاختراق والنسخ', 'font-size: 20px;');

        // تتبع محاولات الاختراق
        window.onerror = function(msg, url, lineNo, columnNo, error) {
            Analytics.trackError('js_error', {
                message: msg,
                url: url,
                line: lineNo,
                column: columnNo,
                error: error?.stack
            });
            return false;
        };
    }

    // تشغيل الحماية
    initProtection();

    // إزالة التعليقات من HTML عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        // إزالة تعليقات HTML
        const removeComments = (node) => {
            const walker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_COMMENT,
                null,
                false
            );

            const comments = [];
            while (walker.nextNode()) {
                comments.push(walker.currentNode);
            }

            comments.forEach(comment => comment.remove());
        };

        // تطبيق الإزالة على كامل المستند
        removeComments(document.documentElement);
    });
})(); 



  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
  const analytics = getAnalytics();