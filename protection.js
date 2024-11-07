// كود حماية الموقع
(function(){
    // منع فتح أدوات المطور
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

    // تشويش الكود المصدري
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
    
    // منع النسخ والتحديد
    document.addEventListener('copy', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
    });

    document.addEventListener('cut', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
    });

    document.addEventListener('paste', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
    });

    document.addEventListener('selectstart', e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return true;
        }
        e.preventDefault();
    });

    // منع عرض المصدر
    document.onkeypress = function(event) {
        if (event.ctrlKey && (event.keyCode === 10 || event.keyCode === 13)) {
            event.preventDefault();
        }
    };

    // إزالة التعليقات من HTML عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
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

        removeComments(document.documentElement);
    });
})(); 