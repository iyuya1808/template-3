/* このファイルの用途: 全ページ共通のJavaScript（モバイルメニュー、フォームバリデーション、ギャラリー機能） */
/* カスタマイズ箇所: フォームバリデーションルール、アニメーション設定 */

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    // モバイルナビゲーション
    initMobileNavigation();
    
    // FAQアコーディオン
    initFAQ();
    
    // ギャラリーフィルター
    initGalleryFilter();
    
    // ギャラリーモーダル
    initGalleryModal();
    
    // 予約フォーム
    initReservationForm();
    
    // スムーススクロール
    initSmoothScroll();
});

/**
 * モバイルナビゲーションの初期化
 */
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (!navToggle || !navMenu) return;
    
    navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // ハンバーガーアイコンのアニメーション
        navToggle.classList.toggle('active');
    });
    
    // メニューリンククリック時にメニューを閉じる
    const navLinks = navMenu.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('active');
        });
    });
}

/**
 * FAQアコーディオンの初期化
 */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        const answer = item.querySelector('.faq__answer');
        
        if (!question || !answer) return;
        
        question.addEventListener('click', function() {
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // 他のFAQを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherQuestion = otherItem.querySelector('.faq__question');
                    const otherAnswer = otherItem.querySelector('.faq__answer');
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherAnswer.style.maxHeight = '0';
                }
            });
            
            // 現在のFAQを開閉
            question.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });
}

/**
 * ギャラリーフィルターの初期化
 */
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.gallery__filter');
    const galleryItems = document.querySelectorAll('.gallery__item');
    
    if (!filterButtons.length || !galleryItems.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // アクティブボタンの切り替え
            filterButtons.forEach(btn => btn.classList.remove('gallery__filter--active'));
            this.classList.add('gallery__filter--active');
            
            // アイテムのフィルタリング
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/**
 * ギャラリーモーダルの初期化
 */
function initGalleryModal() {
    const galleryItems = document.querySelectorAll('.gallery__item');
    const modal = document.getElementById('imageModal');
    
    if (!galleryItems.length || !modal) return;
    
    const modalImage = modal.querySelector('.modal__image');
    const modalTitle = modal.querySelector('.modal__title');
    const modalDescription = modal.querySelector('.modal__description');
    const modalClose = modal.querySelector('.modal__close');
    const modalOverlay = modal.querySelector('.modal__overlay');
    
    // ギャラリーアイテムクリック時
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const overlay = this.querySelector('.gallery__item__overlay');
            
            if (!img || !overlay) return;
            
            const title = overlay.querySelector('.gallery__item-title')?.textContent || '';
            const description = overlay.querySelector('.gallery__item-description')?.textContent || '';
            
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modalTitle.textContent = title;
            modalDescription.textContent = description;
            
            openModal('imageModal');
        });
    });
    
    // モーダルを閉じる
    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal('imageModal'));
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => closeModal('imageModal'));
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal('imageModal');
        }
    });
}

/**
 * 予約フォームの初期化
 */
function initReservationForm() {
    const form = document.getElementById('reservationForm');
    
    if (!form) return;
    
    // 今日の日付を最小値として設定
    const dateInput = form.querySelector('#date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(form)) {
            submitReservation(form);
        }
    });
    
    // リアルタイムバリデーション
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
}

/**
 * フォームバリデーション
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // メールアドレスの形式チェック（入力されている場合のみ）
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value && !validateEmail(emailField.value)) {
        showError(emailField, '正しいメールアドレスを入力してください');
        isValid = false;
    }
    
    // 電話番号の形式チェック
    const phoneField = form.querySelector('#phone');
    if (phoneField && !validatePhone(phoneField.value)) {
        showError(phoneField, '正しい電話番号を入力してください（例：090-1234-5678）');
        isValid = false;
    }
    
    // 日付の妥当性チェック
    const dateField = form.querySelector('#date');
    if (dateField && !validateDate(dateField.value)) {
        showError(dateField, '今日以降の日付を選択してください');
        isValid = false;
    }
    
    return isValid;
}

/**
 * 個別フィールドのバリデーション
 */
function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showError(field, 'この項目は必須です');
        return false;
    }
    
    clearError(field);
    return true;
}

/**
 * メールアドレスの形式チェック
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 電話番号の形式チェック
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\-\(\)\+\s]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * 日付の妥当性チェック
 */
function validateDate(date) {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today;
}

/**
 * エラー表示
 */
function showError(field, message) {
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
        errorElement.textContent = message;
    }
    field.classList.add('error');
}

/**
 * エラークリア
 */
function clearError(field) {
    const errorElement = document.getElementById(field.name + '-error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    field.classList.remove('error');
}

/**
 * 予約フォーム送信処理（フェイク）
 */
function submitReservation(form) {
    // 送信ボタンを無効化
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';
    
    // フェイクの送信処理（実際の実装では API を呼び出し）
    setTimeout(() => {
        // 90%の確率で成功
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            openModal('successModal');
            form.reset();
        } else {
            openModal('errorModal');
        }
        
        // ボタンを元に戻す
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }, 2000);
}

/**
 * モーダルを開く
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // フォーカストラップ
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
}

/**
 * モーダルを閉じる
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

/**
 * スムーススクロールの初期化
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * スクロール時のヘッダー背景変更
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(17, 17, 23, 0.98)';
        } else {
            header.style.backgroundColor = 'rgba(17, 17, 23, 0.95)';
        }
    }
});

/**
 * 要素が画面に入った時のアニメーション
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll('.feature, .menu-item, .gallery__item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// スクロールアニメーションの初期化（ページ読み込み後）
window.addEventListener('load', initScrollAnimations);

/**
 * パフォーマンス最適化：画像の遅延読み込み
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// 遅延読み込みの初期化
initLazyLoading();

// グローバル関数として公開（HTMLから呼び出し可能）
window.openModal = openModal;
window.closeModal = closeModal;